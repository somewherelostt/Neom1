"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { nitroliteWebSocketService } from "@/lib/nitrolite-websocket";
import { getWalletClient } from "@/lib/wallet";
import type { Address } from "viem";

interface NitroliteAuthProps {
  address: Address | null;
  onAuthSuccess?: (sessionId: string) => void;
}

export function NitroliteAuth({ address, onAuthSuccess }: NitroliteAuthProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStatus, setAuthStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [authMessage, setAuthMessage] = useState<string>("");

  const handleAuthenticate = async () => {
    if (!address) {
      setAuthMessage("Please connect your wallet first");
      setAuthStatus("error");
      return;
    }

    setIsAuthenticating(true);
    setAuthStatus("idle");
    setAuthMessage("");

    try {
      // Get wallet client
      const walletClient = await getWalletClient();
      if (!walletClient) {
        throw new Error("Failed to get wallet client");
      }

      // Connect to WebSocket if not already connected
      if (nitroliteWebSocketService.getStatus() === "Disconnected") {
        nitroliteWebSocketService.connect();

        // Wait for connection
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(
            () => reject(new Error("WebSocket connection timeout")),
            10000
          );

          const checkConnection = () => {
            const status = nitroliteWebSocketService.getStatus();
            if (status === "Connected") {
              clearTimeout(timeout);
              resolve(true);
            } else if (status === "Disconnected") {
              clearTimeout(timeout);
              reject(new Error("WebSocket connection failed"));
            } else {
              setTimeout(checkConnection, 100);
            }
          };

          checkConnection();
        });
      }

      // Authenticate session
      const authResponse = await nitroliteWebSocketService.authenticateSession(
        walletClient,
        address
      );

      if (authResponse.result?.authenticated) {
        setAuthStatus("success");
        setAuthMessage(
          `Session authenticated successfully! Session ID: ${authResponse.result.sessionId}`
        );
        onAuthSuccess?.(authResponse.result.sessionId);
      } else {
        throw new Error(authResponse.error?.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setAuthStatus("error");
      setAuthMessage(
        error instanceof Error ? error.message : "Authentication failed"
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getStatusBadge = () => {
    const wsStatus = nitroliteWebSocketService.getStatus();

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
      case "Authenticated":
        return (
          <Badge
            variant="default"
            className="flex items-center gap-1 bg-green-600"
          >
            <CheckCircle className="h-3 w-3" />
            Authenticated
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          onClick={handleAuthenticate}
          disabled={isAuthenticating || !address}
          className="flex items-center gap-2"
        >
          {isAuthenticating && <Loader2 className="h-4 w-4 animate-spin" />}
          {isAuthenticating ? "Authenticating..." : "Authenticate Session"}
        </Button>

        {getStatusBadge()}
      </div>

      {authMessage && (
        <Alert variant={authStatus === "error" ? "destructive" : "default"}>
          <AlertDescription className="flex items-center gap-2">
            {authStatus === "success" && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            {authStatus === "error" && <AlertCircle className="h-4 w-4" />}
            {authMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
