import {
  createWalletClient,
  custom,
  type Address,
  type WalletClient,
} from "viem";
import { mainnet } from "viem/chains";

export interface WalletState {
  account: Address | null;
  walletClient: WalletClient | null;
  isConnected: boolean;
}

export async function connectWallet(): Promise<{
  account: Address;
  walletClient: WalletClient;
} | null> {
  if (!window.ethereum) {
    alert("Please install MetaMask!");
    return null;
  }

  try {
    // First get the address
    const tempClient = createWalletClient({
      chain: mainnet,
      transport: custom(window.ethereum),
    });
    const [address] = await tempClient.requestAddresses();

    // CHAPTER 3: Create wallet client with account for EIP-712 signing
    const walletClient = createWalletClient({
      account: address,
      chain: mainnet,
      transport: custom(window.ethereum),
    });

    return {
      account: address,
      walletClient: walletClient,
    };
  } catch (error: any) {
    console.error("Failed to connect wallet:", error);
    if (error.code === 4001) {
      // User rejected the request
      alert("Please connect to MetaMask to continue");
    } else {
      alert("Failed to connect wallet. Please try again.");
    }
    return null;
  }
}

export async function disconnectWallet(): Promise<void> {
  try {
    // While we can't force MetaMask to disconnect, we can clear permissions
    // This will require the user to reconnect manually next time
    if (window.ethereum && window.ethereum.request) {
      // Some wallets support wallet_revokePermissions
      try {
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [
            {
              eth_accounts: {},
            },
          ],
        });
      } catch (error) {
        // If revokePermissions is not supported, that's okay
        console.log("Wallet permissions revocation not supported:", error);
      }
    }
    console.log("Wallet disconnected from app");
  } catch (error) {
    console.error("Error during wallet disconnect:", error);
  }
}

export async function checkWalletConnection(): Promise<{
  account: Address;
  walletClient: WalletClient;
} | null> {
  if (!window.ethereum) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });

    if (accounts.length === 0) {
      return null;
    }

    // CHAPTER 3: Create wallet client with account for EIP-712 signing
    const walletClient = createWalletClient({
      account: accounts[0] as Address,
      chain: mainnet,
      transport: custom(window.ethereum),
    });

    return {
      account: accounts[0] as Address,
      walletClient: walletClient,
    };
  } catch (error) {
    console.error("Failed to check wallet connection:", error);
    return null;
  }
}

export async function getWalletClient(): Promise<WalletClient | null> {
  if (!window.ethereum) {
    return null;
  }

  try {
    const client = createWalletClient({
      chain: mainnet,
      transport: custom(window.ethereum),
    });

    return client;
  } catch (error) {
    console.error("Failed to get wallet client:", error);
    return null;
  }
}

export function formatAddress(address: Address): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
