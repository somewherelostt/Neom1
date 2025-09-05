// Final Chapter: P2P Transfer Hook with Channel Creation
import { useCallback } from "react";
import {
  createTransferMessage,
  createECDSAMessageSigner,
} from "@erc7824/nitrolite";
import type { Address } from "viem";
import { nitroliteWebSocketService } from "../lib/nitrolite-websocket";
import type { SessionKey } from "../lib/utils";

export interface TransferResult {
  success: boolean;
  error?: string;
}

export const useTransfer = (
  sessionKey: SessionKey | null,
  isAuthenticated: boolean
) => {
  const handleTransfer = useCallback(
    async (
      recipient: Address,
      amount: string,
      asset: string = "usdc"
    ): Promise<TransferResult> => {
      if (!isAuthenticated || !sessionKey) {
        return { success: false, error: "Please authenticate first" };
      }

      try {
        // Create session signer from stored key
        const sessionSigner = createECDSAMessageSigner(sessionKey.privateKey);

        // Create transfer message - THIS CREATES THE CHANNEL
        const transferPayload = await createTransferMessage(sessionSigner, {
          destination: recipient,
          allocations: [
            {
              asset: asset.toLowerCase(),
              amount: amount,
            },
          ],
        });

        console.log("📡 Sending transfer request...");
        console.log("💰 Amount:", amount, asset.toUpperCase());
        console.log("📍 Recipient:", recipient);

        // Send to Yellow network via WebSocket
        nitroliteWebSocketService.send(transferPayload);

        return { success: true };
      } catch (error) {
        console.error("❌ Failed to create transfer:", error);
        const errorMsg =
          error instanceof Error ? error.message : "Failed to create transfer";
        return { success: false, error: errorMsg };
      }
    },
    [sessionKey, isAuthenticated]
  );

  return { handleTransfer };
};
