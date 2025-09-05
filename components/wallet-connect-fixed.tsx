"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  connectWallet,
  disconnectWallet,
  checkWalletConnection,
  formatAddress,
  type WalletState,
} from "@/lib/wallet";

interface WalletConnectProps {
  onConnectionChange: (walletState: WalletState) => void;
  currentWalletState?: WalletState;
}

export function WalletConnect({
  onConnectionChange,
  currentWalletState,
}: WalletConnectProps) {
  const [localWalletState, setLocalWalletState] = useState<WalletState>(
    currentWalletState || {
      account: null,
      walletClient: null,
      isConnected: false,
    }
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDisconnectMenu, setShowDisconnectMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await connectWallet();
      if (result) {
        const newWalletState = {
          account: result.account,
          walletClient: result.walletClient,
          isConnected: true,
        };
        setLocalWalletState(newWalletState);
        onConnectionChange(newWalletState);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = useCallback(async () => {
    await disconnectWallet();
    const disconnectedState = {
      account: null,
      walletClient: null,
      isConnected: false,
    };
    setLocalWalletState(disconnectedState);
    onConnectionChange(disconnectedState);
    setShowDisconnectMenu(false);
  }, [onConnectionChange]);

  // Check for existing wallet connection on component mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      const result = await checkWalletConnection();
      if (result) {
        const newWalletState = {
          account: result.account,
          walletClient: result.walletClient,
          isConnected: true,
        };
        setLocalWalletState(newWalletState);
        onConnectionChange(newWalletState);
      }
    };

    checkExistingConnection();

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          handleDisconnect();
        } else {
          // Account changed, reconnect
          checkExistingConnection();
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }
  }, [onConnectionChange, handleDisconnect]);

  // Handle clicking outside the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowDisconnectMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (currentWalletState) {
      setLocalWalletState(currentWalletState);
    }
  }, [currentWalletState]);

  if (localWalletState.isConnected && localWalletState.account) {
    return (
      <div className="relative" ref={menuRef}>
        <Button
          onClick={() => setShowDisconnectMenu(!showDisconnectMenu)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00E0FF]/20 to-[#00FFC6]/20 backdrop-blur-sm rounded-2xl border border-[#00E0FF]/30 hover:from-[#00E0FF]/30 hover:to-[#00FFC6]/30 transition-all duration-300"
        >
          <div className="w-2 h-2 bg-[#00FFC6] rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-white">
            {formatAddress(localWalletState.account)}
          </span>
        </Button>

        {showDisconnectMenu && (
          <div className="absolute top-full right-0 mt-2 bg-[#1C1C40] border border-white/20 rounded-2xl shadow-lg backdrop-blur-sm z-50">
            <Button
              onClick={handleDisconnect}
              className="w-full px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300"
              variant="ghost"
            >
              Disconnect Wallet
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-gradient-to-r from-[#00E0FF] to-[#00FFC6] text-black font-semibold rounded-2xl px-6 py-2 shadow-lg shadow-[#00E0FF]/25 hover:shadow-[#00E0FF]/40 transition-all duration-300 disabled:opacity-50"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
