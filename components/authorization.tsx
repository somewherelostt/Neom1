"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { webSocketService } from "@/lib/websocket";
import { processAuthResponse, createAuthMessage } from "@/lib/signature";
import { type WalletState } from "@/lib/wallet";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface AuthorizationProps {
  walletState: WalletState;
  onAuthSuccess?: (response: any) => void;
  onAuthError?: (error: string) => void;
}

export function Authorization({
  walletState,
  onAuthSuccess,
  onAuthError,
}: AuthorizationProps) {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authStatus, setAuthStatus] = useState<
    "idle" | "requesting" | "success" | "error"
  >("idle");
  const [authError, setAuthError] = useState<string | null>(null);

  const handleAuthorize = useCallback(async () => {
    if (!walletState.isConnected || !walletState.account) {
      setAuthError("Please connect your wallet first");
      setAuthStatus("error");
      return;
    }

    setIsAuthorizing(true);
    setAuthStatus("requesting");
    setAuthError(null);

    try {
      console.log("Sending authorization request...");

      // Send auth request through WebSocket
      const response = await webSocketService.sendAuthRequest(
        walletState.account
      );

      console.log("Received auth response:", response);

      // Process and verify the response
      const authResult = await processAuthResponse(
        response,
        walletState.account
      );

      if (authResult.isAuthenticated) {
        setAuthStatus("success");
        onAuthSuccess?.(response);
        console.log("Authorization successful!");
      } else {
        setAuthStatus("error");
        setAuthError(authResult.error || "Authorization failed");
        onAuthError?.(authResult.error || "Authorization failed");
      }
    } catch (error: any) {
      console.error("Authorization error:", error);
      setAuthStatus("error");
      setAuthError(error.message || "Authorization request failed");
      onAuthError?.(error.message || "Authorization request failed");
    } finally {
      setIsAuthorizing(false);
    }
  }, [walletState, onAuthSuccess, onAuthError]);

  const getStatusIcon = () => {
    switch (authStatus) {
      case "requesting":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-[#00FFC6]" />;
      case "error":
        return <XCircle className="w-4 h-4 text-[#FF1CF7]" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (authStatus) {
      case "requesting":
        return "Authorizing...";
      case "success":
        return "Authorized";
      case "error":
        return "Auth Failed";
      default:
        return "Authorize";
    }
  };

  const getButtonColor = () => {
    switch (authStatus) {
      case "success":
        return "bg-gradient-to-r from-[#00FFC6]/20 to-[#00E0FF]/20 border-[#00FFC6]/30 text-[#00FFC6]";
      case "error":
        return "bg-gradient-to-r from-[#FF1CF7]/20 to-[#FF1CF7]/20 border-[#FF1CF7]/30 text-[#FF1CF7]";
      default:
        return "bg-gradient-to-r from-[#00E0FF] to-[#00FFC6] text-black hover:shadow-lg hover:shadow-[#00E0FF]/25";
    }
  };

  if (!walletState.isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-[#1C1C40]/30 backdrop-blur-sm rounded-2xl border border-white/10 opacity-50">
        <Shield className="w-4 h-4 text-white/40" />
        <span className="text-xs font-medium text-white/40">
          Connect wallet to authorize
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleAuthorize}
        disabled={isAuthorizing || authStatus === "success"}
        className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-2xl transition-all duration-300 ${getButtonColor()}`}
      >
        {getStatusIcon()}
        <span className="text-sm">{getStatusText()}</span>
      </Button>

      {authError && (
        <div className="text-xs text-[#FF1CF7] bg-[#FF1CF7]/10 px-3 py-2 rounded-xl border border-[#FF1CF7]/20">
          {authError}
        </div>
      )}
    </div>
  );
}
