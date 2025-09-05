// Transfer Component - Demonstrates Yellow Network Channel Creation
"use client";

import { useState } from "react";
import { Address, isAddress } from "viem";
import { useTransfer } from "../hooks/use-transfer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Loader2, Send, CheckCircle, AlertCircle } from "lucide-react";

interface TransferComponentProps {
  sessionKey: any;
  isAuthenticated: boolean;
}

export function TransferComponent({
  sessionKey,
  isAuthenticated,
}: TransferComponentProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("0.01");
  const [asset, setAsset] = useState("usdc");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);

  const { handleTransfer } = useTransfer(sessionKey, isAuthenticated);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAddress(recipient)) {
      setResult({ success: false, error: "Invalid recipient address" });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setResult({ success: false, error: "Invalid amount" });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const transferResult = await handleTransfer(
        recipient as Address,
        amount,
        asset
      );
      setResult(transferResult);

      if (transferResult.success) {
        // Reset form on success
        setRecipient("");
        setAmount("0.01");
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Transfer failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            P2P Transfer
          </CardTitle>
          <CardDescription>
            Send instant transfers via Yellow Network state channels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please authenticate first to enable instant transfers
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          P2P Transfer
          <Badge variant="secondary">Yellow Network</Badge>
        </CardTitle>
        <CardDescription>
          Send instant transfers via state channels • No gas fees • Instant
          settlement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="recipient" className="text-sm font-medium">
              Recipient Address
            </label>
            <Input
              id="recipient"
              type="text"
              placeholder="0x742d35Cc6634C0532925a3b8D5c3e5De4a1234567"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="font-mono text-sm"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount
              </label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="asset" className="text-sm font-medium">
                Asset
              </label>
              <select
                id="asset"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                <option value="usdc">USDC</option>
                <option value="eth">ETH</option>
                <option value="dai">DAI</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !recipient || !amount}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Channel...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send {amount} {asset.toUpperCase()}
              </>
            )}
          </Button>
        </form>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {result.success
                ? `Transfer sent successfully! Channel created on Yellow Network.`
                : result.error}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
          <div className="font-medium mb-2">How it works:</div>
          <ul className="space-y-1">
            <li>• Creates bilateral state channel with recipient</li>
            <li>• Instant off-chain settlement via Yellow Network</li>
            <li>• Uses your session key for seamless signing</li>
            <li>• On-chain settlement when channel closes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
