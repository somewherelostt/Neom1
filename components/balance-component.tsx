// Balance Display Component
"use client";

import { useBalances } from "../hooks/use-balances";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Loader2, Wallet, RefreshCw, TrendingUp } from "lucide-react";
import type { SessionKey } from "../lib/utils";

interface BalanceComponentProps {
  sessionKey: SessionKey | null;
  isAuthenticated: boolean;
}

export function BalanceComponent({
  sessionKey,
  isAuthenticated,
}: BalanceComponentProps) {
  const { balances, isLoading, error, refetch } = useBalances(
    sessionKey,
    isAuthenticated
  );

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Asset Balances
          </CardTitle>
          <CardDescription>
            View your Yellow Network asset balances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            Connect wallet and authenticate to view balances
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Asset Balances
          <Badge variant="secondary">Yellow Network</Badge>
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>Your available assets for transfers</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={refetch}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">
              Loading balances...
            </span>
          </div>
        )}

        {error && !isLoading && (
          <div className="space-y-3">
            <div className="text-sm text-amber-600 dark:text-amber-400 text-center py-3 bg-amber-50 dark:bg-amber-950/50 rounded-lg border border-amber-200 dark:border-amber-800">
              ⚠️ {error}
            </div>
            {balances.length > 0 && (
              <div className="text-xs text-muted-foreground text-center">
                📊 Demo data shown below
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={isLoading}
              className="w-full mt-2"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Retry Loading Balances
            </Button>
          </div>
        )}

        {!isLoading && balances.length === 0 && !error && (
          <div className="text-sm text-muted-foreground text-center py-6">
            <div className="mb-2">No assets found</div>
            <div className="text-xs">Transfer some assets to see them here</div>
          </div>
        )}

        {!isLoading && balances.length > 0 && (
          <div className="space-y-2">
            {balances.map((balance) => (
              <div
                key={balance.asset}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {balance.symbol.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      {balance.symbol.toUpperCase()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {balance.asset}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold">
                    {parseFloat(balance.amount).toLocaleString(undefined, {
                      maximumFractionDigits: 4,
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Available
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
          <div className="font-medium mb-1">💡 Tips:</div>
          <ul className="space-y-1">
            <li>• Balances update automatically with transfers</li>
            <li>• Assets are held in Yellow Network state channels</li>
            <li>• Instant transfers between authenticated users</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
