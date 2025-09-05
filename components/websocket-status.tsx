"use client";

import { useEffect, useState } from "react";
import {
  nitroliteWebSocketService,
  type WsStatus,
} from "@/lib/nitrolite-websocket";
import { Button } from "./ui/button";
import { RefreshCw, Wifi, WifiOff, AlertCircle } from "lucide-react";

export function WebSocketStatus() {
  const [wsStatus, setWsStatus] = useState<WsStatus>("Disconnected");

  useEffect(() => {
    // Subscribe to status updates from our service
    nitroliteWebSocketService.addStatusListener(setWsStatus);

    // Tell the service to connect
    nitroliteWebSocketService.connect();

    // On cleanup, remove the listener
    return () => {
      nitroliteWebSocketService.removeStatusListener(setWsStatus);
    };
  }, []);

  const handleReconnect = () => {
    console.log("🔄 Manual reconnection triggered");
    nitroliteWebSocketService.forceReconnect();
  };

  const getStatusColor = (status: WsStatus) => {
    switch (status) {
      case "Connected":
        return "bg-[#00FFC6]";
      case "Authenticated":
        return "bg-[#00E0FF]";
      case "Connecting":
        return "bg-[#FF1CF7] animate-pulse";
      case "Disconnected":
        return "bg-red-500";
      default:
        return "bg-white/40";
    }
  };

  const getStatusText = (status: WsStatus) => {
    switch (status) {
      case "Connected":
        return "Connected";
      case "Authenticated":
        return "Authenticated";
      case "Connecting":
        return "Connecting...";
      case "Disconnected":
        return "Disconnected";
      default:
        return "Unknown";
    }
  };

  const getStatusIcon = (status: WsStatus) => {
    switch (status) {
      case "Connected":
      case "Authenticated":
        return <Wifi className="w-3 h-3" />;
      case "Connecting":
        return <RefreshCw className="w-3 h-3 animate-spin" />;
      case "Disconnected":
        return <WifiOff className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#1C1C40]/30 backdrop-blur-sm rounded-2xl border border-white/10">
        <div
          className={`w-2 h-2 rounded-full ${getStatusColor(wsStatus)}`}
        ></div>
        {getStatusIcon(wsStatus)}
        <span className="text-xs font-medium text-white/80 font-mono">
          {getStatusText(wsStatus)}
        </span>
      </div>

      {wsStatus === "Disconnected" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReconnect}
          className="h-8 px-2 text-xs text-white/60 hover:text-white"
          title="Retry connection"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}
