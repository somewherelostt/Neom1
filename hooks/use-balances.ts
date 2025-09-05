// Chapter 4: Balance Display Hook
import { useState, useEffect, useCallback } from "react";
import { nitroliteWebSocketService } from "../lib/nitrolite-websocket";
import type { SessionKey } from "../lib/utils";

export interface Balance {
  asset: string;
  amount: string;
  symbol: string;
  decimals: number;
}

export interface BalanceState {
  balances: Balance[];
  isLoading: boolean;
  error: string | null;
}

export const useBalances = (
  sessionKey: SessionKey | null,
  isAuthenticated: boolean
) => {
  const [balanceState, setBalanceState] = useState<BalanceState>({
    balances: [],
    isLoading: false,
    error: null,
  });

  const fetchBalances = useCallback(async () => {
    if (!isAuthenticated || !sessionKey) {
      setBalanceState((prev) => ({ ...prev, balances: [], isLoading: false }));
      return;
    }

    // Check WebSocket connection status first
    const wsStatus = nitroliteWebSocketService.getStatus();
    if (wsStatus !== "Connected" && wsStatus !== "Authenticated") {
      setBalanceState((prev) => ({
        ...prev,
        isLoading: false,
        error: "WebSocket not connected",
      }));
      return;
    }

    setBalanceState((prev) => ({ ...prev, isLoading: true, error: null }));
    console.log("🔍 Fetching balances for address:", sessionKey.address);

    try {
      const response = await nitroliteWebSocketService.send("get_balances", {
        address: sessionKey.address,
      });

      console.log("💰 Balance response:", response);

      if (response.result && response.result.balances) {
        setBalanceState({
          balances: response.result.balances,
          isLoading: false,
          error: null,
        });
      } else if (response.error) {
        // Handle RPC error response
        setBalanceState({
          balances: [],
          isLoading: false,
          error: `API Error: ${response.error.message || "Unknown error"}`,
        });
      } else {
        // No balances found, but not an error - user might have zero balance
        setBalanceState({
          balances: [],
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error("❌ Failed to fetch balances:", error);

      // Handle specific error types
      let errorMessage = "Failed to fetch balances";
      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          errorMessage = "Request timed out - try again";
        } else if (error.message.includes("WebSocket")) {
          errorMessage = "Connection lost - reconnecting...";
        } else {
          errorMessage = error.message;
        }
      }

      // For demo purposes, show some mock balances if API fails
      const mockBalances: Balance[] = [
        {
          asset: "usdc",
          amount: "100.25",
          symbol: "USDC",
          decimals: 6,
        },
        {
          asset: "eth",
          amount: "0.5000",
          symbol: "ETH",
          decimals: 18,
        },
        {
          asset: "dai",
          amount: "50.00",
          symbol: "DAI",
          decimals: 18,
        },
      ];

      setBalanceState({
        balances: mockBalances,
        isLoading: false,
        error: `${errorMessage} (showing demo data)`,
      });
    }
  }, [sessionKey, isAuthenticated]);

  // Auto-fetch balances when authenticated
  useEffect(() => {
    if (isAuthenticated && sessionKey) {
      // Add a small delay to ensure WebSocket is fully connected
      const timer = setTimeout(() => {
        fetchBalances();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, sessionKey, fetchBalances]);

  // Listen to WebSocket status changes
  useEffect(() => {
    const handleStatusChange = (status: string) => {
      if (status === "Authenticated" && isAuthenticated && sessionKey) {
        // Retry fetching balances when authentication completes
        setTimeout(() => fetchBalances(), 500);
      } else if (status === "Disconnected") {
        setBalanceState((prev) => ({
          ...prev,
          error: "Connection lost",
          isLoading: false,
        }));
      }
    };

    nitroliteWebSocketService.addStatusListener(handleStatusChange);
    return () =>
      nitroliteWebSocketService.removeStatusListener(handleStatusChange);
  }, [isAuthenticated, sessionKey, fetchBalances]);

  // Listen to WebSocket messages for balance updates
  useEffect(() => {
    const handleMessage = (data: any) => {
      if (data.method === "balance_update" && data.params) {
        setBalanceState((prev) => {
          const updatedBalances = [...prev.balances];
          const assetIndex = updatedBalances.findIndex(
            (b) => b.asset === data.params.asset
          );

          if (assetIndex >= 0) {
            updatedBalances[assetIndex] = {
              ...updatedBalances[assetIndex],
              ...data.params,
            };
          } else {
            updatedBalances.push(data.params);
          }

          return { ...prev, balances: updatedBalances };
        });
      }
    };

    nitroliteWebSocketService.addMessageListener(handleMessage);
    return () => nitroliteWebSocketService.removeMessageListener(handleMessage);
  }, []);

  return {
    ...balanceState,
    refetch: fetchBalances,
  };
};
