// WebSocket Diagnostic Component
"use client";

import { useState } from "react";
import { nitroliteWebSocketService } from "../lib/nitrolite-websocket";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Globe,
  Zap,
} from "lucide-react";

export function ConnectionDiagnostic() {
  const [testResult, setTestResult] = useState<{
    step: string;
    status: "testing" | "success" | "error";
    message: string;
  } | null>(null);

  const runDiagnostic = async () => {
    setTestResult({
      step: "Testing WebSocket connection...",
      status: "testing",
      message: "",
    });

    try {
      // Step 1: Check environment
      const wsUrl = process.env.NEXT_PUBLIC_NITROLITE_WS_URL;
      if (!wsUrl) {
        setTestResult({
          step: "Environment Check",
          status: "error",
          message: "NEXT_PUBLIC_NITROLITE_WS_URL not found in environment",
        });
        return;
      }

      setTestResult({
        step: "Environment Check",
        status: "success",
        message: `Using URL: ${wsUrl}`,
      });

      // Step 2: Test WebSocket connection
      await new Promise((resolve, reject) => {
        setTestResult({
          step: "WebSocket Connection",
          status: "testing",
          message: "Attempting to connect...",
        });

        const testSocket = new WebSocket(wsUrl);

        const timeout = setTimeout(() => {
          testSocket.close();
          reject(new Error("Connection timeout after 10 seconds"));
        }, 10000);

        testSocket.onopen = () => {
          clearTimeout(timeout);
          setTestResult({
            step: "WebSocket Connection",
            status: "success",
            message: "Connection established successfully!",
          });
          testSocket.close();
          resolve(true);
        };

        testSocket.onerror = (error) => {
          clearTimeout(timeout);
          reject(new Error("Failed to connect to WebSocket"));
        };

        testSocket.onclose = (event) => {
          if (event.code !== 1000) {
            // 1000 is normal closure
            clearTimeout(timeout);
            reject(new Error(`Connection closed with code: ${event.code}`));
          }
        };
      });
    } catch (error) {
      setTestResult({
        step: "Connection Test",
        status: "error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const forceReconnect = () => {
    console.log("🔄 Forcing WebSocket reconnection...");
    nitroliteWebSocketService.forceReconnect();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Connection Diagnostic
          <Badge variant="outline">Debug Tool</Badge>
        </CardTitle>
        <CardDescription>
          Test your connection to Yellow Network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={runDiagnostic}
            disabled={testResult?.status === "testing"}
            className="flex-1"
          >
            {testResult?.status === "testing" ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                Test Connection
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={forceReconnect}
            title="Force reconnect the main WebSocket"
          >
            <Zap className="h-4 w-4" />
          </Button>
        </div>

        {testResult && (
          <Alert
            variant={testResult.status === "error" ? "destructive" : "default"}
          >
            {testResult.status === "success" && (
              <CheckCircle className="h-4 w-4" />
            )}
            {testResult.status === "error" && <XCircle className="h-4 w-4" />}
            {testResult.status === "testing" && (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>
              <div className="font-semibold">{testResult.step}</div>
              <div className="text-sm mt-1">{testResult.message}</div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
          <div className="font-medium mb-2">🔧 Troubleshooting:</div>
          <ul className="space-y-1">
            <li>• Check your internet connection</li>
            <li>• Verify Yellow Network status</li>
            <li>• Try the force reconnect button</li>
            <li>• Check browser console for errors</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
