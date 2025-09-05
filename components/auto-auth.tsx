"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2, Key, Shield } from "lucide-react";
import { authenticationService, type AuthState } from "@/lib/authentication";
import {
  nitroliteWebSocketService,
  type WsStatus,
} from "@/lib/nitrolite-websocket";
import type { Address, WalletClient } from "viem";

interface AutoAuthProps {
  walletClient: WalletClient | null;
  account: Address | null;
}

export function AutoAuth({ walletClient, account }: AutoAuthProps) {
  const [authState, setAuthState] = useState<AuthState>(
    authenticationService.getAuthState()
  );
  const [wsStatus, setWsStatus] = useState<WsStatus>(
    nitroliteWebSocketService.getStatus()
  );
  const [authMessage, setAuthMessage] = useState<string>("");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Listen to auth state changes
    authenticationService.addListener(setAuthState);

    // Listen to WebSocket status changes
    nitroliteWebSocketService.addStatusListener(setWsStatus);

    // Update authentication service with wallet data
    if (walletClient && account) {
      authenticationService.setWalletData(walletClient, account);
    } else {
      authenticationService.clearWalletData();
    }

    // Listen to WebSocket status for auth triggers
    authenticationService.onWebSocketStatusChange(wsStatus);

    return () => {
      authenticationService.removeListener(setAuthState);
      nitroliteWebSocketService.removeStatusListener(setWsStatus);
    };
  }, [walletClient, account, wsStatus]);

  useEffect(() => {
    // Update status messages based on auth state
    if (authState.isAuthenticated) {
      setAuthMessage(
        "Session authenticated successfully! Ready for Web3 interactions."
      );
    } else if (authState.isAuthAttempted && wsStatus === "Connected") {
      setAuthMessage(
        "Authenticating session... Please check your wallet for signature request."
      );
    } else if (wsStatus === "Connecting") {
      setAuthMessage("Connecting to Nitrolite network...");
    } else if (wsStatus === "Connected" && !authState.isAuthAttempted) {
      setAuthMessage(
        "Connected to network. Authentication will start automatically."
      );
    } else if (!account) {
      setAuthMessage("Connect your wallet to start automatic authentication.");
    } else {
      setAuthMessage("Waiting for network connection...");
    }
  }, [authState, wsStatus, account]);

  const handleReset = () => {
    authenticationService.reset();
    setAuthMessage("Authentication reset. Generating new session key...");
  };

  const getStatusBadge = () => {
    if (authState.isAuthenticated) {
      return (
        <Badge
          variant="default"
          className="flex items-center gap-1 bg-green-600"
        >
          <Shield className="h-3 w-3" />
          Authenticated
        </Badge>
      );
    }

    if (authState.isAuthAttempted) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Authenticating
        </Badge>
      );
    }

    switch (wsStatus) {
      case "Connecting":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Connecting
          </Badge>
        );
      case "Connected":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Connected
          </Badge>
        );
      default:
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Disconnected
          </Badge>
        );
    }
  };

  const getSessionKeyInfo = () => {
    if (!authState.sessionKey) return null;

    const shortAddress = `${authState.sessionKey.address.slice(
      0,
      6
    )}...${authState.sessionKey.address.slice(-4)}`;

    return (
      <div className="text-xs text-white/60 flex items-center gap-1">
        <Key className="h-3 w-3" />
        Session: {shortAddress}
      </div>
    );
  };

  const isReadyForAuth =
    account && wsStatus === "Connected" && authState.sessionKey;
  const showProgress = authState.isAuthAttempted || authState.isAuthenticated;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {getStatusBadge()}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="text-white/60 hover:text-white text-xs"
        >
          {showDetails ? "Hide" : "Details"}
        </Button>

        {!authState.isAuthenticated &&
          !authState.isAuthAttempted &&
          isReadyForAuth && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs border-[#FF1CF7]/30 text-[#FF1CF7] hover:bg-[#FF1CF7]/10"
            >
              Reset Auth
            </Button>
          )}
      </div>

      {showDetails && (
        <div className="space-y-2">
          {authMessage && (
            <Alert
              variant={authState.isAuthenticated ? "default" : "destructive"}
            >
              <AlertDescription className="flex items-center gap-2 text-xs">
                {authState.isAuthenticated && (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                )}
                {authState.isAuthAttempted && !authState.isAuthenticated && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                {!authState.isAuthenticated && !authState.isAuthAttempted && (
                  <AlertCircle className="h-3 w-3" />
                )}
                {authMessage}
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-[#1C1C40]/20 rounded-lg p-3 space-y-2">
            <div className="text-xs font-medium text-white/80">
              Session Details
            </div>
            {getSessionKeyInfo()}

            {authState.sessionExpireTimestamp && (
              <div className="text-xs text-white/60">
                Expires:{" "}
                {new Date(
                  parseInt(authState.sessionExpireTimestamp) * 1000
                ).toLocaleString()}
              </div>
            )}

            <div className="flex items-center gap-4 text-xs">
              <span
                className={`${account ? "text-green-400" : "text-red-400"}`}
              >
                Wallet: {account ? "Connected" : "Disconnected"}
              </span>
              <span
                className={`${
                  wsStatus === "Connected"
                    ? "text-green-400"
                    : "text-orange-400"
                }`}
              >
                Network: {wsStatus}
              </span>
              <span
                className={`${
                  authState.sessionKey ? "text-green-400" : "text-orange-400"
                }`}
              >
                Session: {authState.sessionKey ? "Ready" : "Generating"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Progress indicator for automatic flow */}
      {showProgress && (
        <div className="bg-gradient-to-r from-[#1C1C40]/30 to-[#0B0B2A]/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-xs font-medium text-[#00E0FF]">
              Automatic Authentication
            </div>
            {authState.isAuthenticated && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <div
                className={`w-2 h-2 rounded-full ${
                  account ? "bg-green-500" : "bg-gray-500"
                }`}
              ></div>
              <span className={account ? "text-white" : "text-white/60"}>
                Wallet Connected
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div
                className={`w-2 h-2 rounded-full ${
                  wsStatus === "Connected"
                    ? "bg-green-500"
                    : wsStatus === "Connecting"
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-gray-500"
                }`}
              ></div>
              <span
                className={
                  wsStatus === "Connected" ? "text-white" : "text-white/60"
                }
              >
                Network Connected
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div
                className={`w-2 h-2 rounded-full ${
                  authState.isAuthAttempted
                    ? authState.isAuthenticated
                      ? "bg-green-500"
                      : "bg-yellow-500 animate-pulse"
                    : "bg-gray-500"
                }`}
              ></div>
              <span
                className={
                  authState.isAuthenticated
                    ? "text-white"
                    : authState.isAuthAttempted
                    ? "text-white"
                    : "text-white/60"
                }
              >
                Session Authenticated
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
