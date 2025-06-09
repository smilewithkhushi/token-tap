'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';

// Types for wallet state
interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  isCorrectNetwork: boolean;
}

export function useWallet() {
  // Wagmi hooks
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  // Local state for additional wallet info
  const [error, setError] = useState<string | null>(null);
  const [isWalletReady, setIsWalletReady] = useState(false);

  // Check if we're on the correct network (Base Sepolia)
  const isCorrectNetwork = chainId === baseSepolia.id;

  // Wallet state object
  const walletState: WalletState = {
    address: address || null,
    isConnected,
    isConnecting: isPending,
    chainId: chainId || null,
    isCorrectNetwork,
  };

  // Check wallet readiness
  useEffect(() => {
    const checkWalletReadiness = () => {
      if (isConnected && address && typeof window !== 'undefined') {
        // Check if ethereum provider is available
        const hasProvider = !!(window.ethereum || window.coinbaseWalletExtension);
        setIsWalletReady(hasProvider);
      } else {
        setIsWalletReady(false);
      }
    };

    checkWalletReadiness();

    // Listen for provider changes
    if (typeof window !== 'undefined') {
      const handleAccountsChanged = () => {
        setTimeout(checkWalletReadiness, 100);
      };

      const handleChainChanged = () => {
        setTimeout(checkWalletReadiness, 100);
      };

      // Add event listeners
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        return () => {
          window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
          window.ethereum?.removeListener?.('chainChanged', handleChainChanged);
        };
      }
    }
  }, [isConnected, address, chainId]);

  // Connect wallet function
  const connectWallet = useCallback(async () => {
    try {
      setError(null);
      
      // Find Coinbase Wallet connector first, then fallback to others
      const coinbaseConnector = connectors.find(
        connector => connector.name.toLowerCase().includes('coinbase')
      );
      
      const preferredConnector = coinbaseConnector || connectors[0];
      
      if (preferredConnector) {
        connect({ connector: preferredConnector });
      } else {
        throw new Error('No wallet connectors available');
      }
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    }
  }, [connect, connectors]);

  // Disconnect wallet function
  const disconnectWallet = useCallback(() => {
    try {
      disconnect();
      setError(null);
      setIsWalletReady(false);
    } catch (err: any) {
      console.error('Disconnect error:', err);
      setError(err.message || 'Failed to disconnect wallet');
    }
  }, [disconnect]);

  // Switch to Base Sepolia network
  const switchToBaseSepolia = useCallback(async () => {
    try {
      setError(null);
      
      if (switchChain) {
        await switchChain({ chainId: baseSepolia.id });
      } else {
        throw new Error('Chain switching not supported');
      }
    } catch (err: any) {
      console.error('Network switch error:', err);
      setError(err.message || 'Failed to switch network');
      
      // If wagmi switch fails, try manual switch via window.ethereum
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${baseSepolia.id.toString(16)}` }],
          });
        } catch (switchError: any) {
          // If the chain doesn't exist, add it
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: `0x${baseSepolia.id.toString(16)}`,
                    chainName: baseSepolia.name,
                    rpcUrls: baseSepolia.rpcUrls.default.http,
                    blockExplorerUrls: baseSepolia.blockExplorers?.default 
                      ? [baseSepolia.blockExplorers.default.url]
                      : ['https://sepolia.basescan.org'],
                    nativeCurrency: baseSepolia.nativeCurrency,
                  },
                ],
              });
            } catch (addError) {
              console.error('Failed to add Base Sepolia network:', addError);
              throw new Error('Failed to add Base Sepolia network to wallet');
            }
          } else {
            throw switchError;
          }
        }
      }
    }
  }, [switchChain]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get formatted address
  const getFormattedAddress = useCallback((addr?: string) => {
    const addressToFormat = addr || address;
    if (!addressToFormat) return '';
    return `${addressToFormat.slice(0, 6)}...${addressToFormat.slice(-4)}`;
  }, [address]);

  // Get wallet provider info
  const getWalletInfo = useCallback(() => {
    if (typeof window === 'undefined') {
      return { hasProvider: false, providerName: 'Unknown' };
    }

    let providerName = 'Unknown';
    let hasProvider = false;

    if (window.ethereum) {
      hasProvider = true;
      if (window.ethereum.isCoinbaseWallet) {
        providerName = 'Coinbase Wallet';
      } else if (window.ethereum.isMetaMask) {
        providerName = 'MetaMask';
      } else {
        providerName = 'Web3 Wallet';
      }
    }

    return { hasProvider, providerName };
  }, []);

  // Auto-switch to Base Sepolia when wallet connects
  useEffect(() => {
    if (isConnected && address && !isCorrectNetwork && isWalletReady) {
      // Add a small delay to ensure connection is stable
      const timer = setTimeout(() => {
        switchToBaseSepolia();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, address, isCorrectNetwork, isWalletReady, switchToBaseSepolia]);

  return {
    // Wallet state
    ...walletState,
    isWalletReady,
    
    // Actions
    connect: connectWallet,
    disconnect: disconnectWallet,
    switchToBaseSepolia,
    
    // Error handling
    error,
    clearError,
    
    // Utility functions
    getFormattedAddress,
    getWalletInfo,
    
    // Network info
    currentChain: {
      id: chainId,
      name: isCorrectNetwork ? 'Base Sepolia' : 'Unknown Network',
      isSupported: isCorrectNetwork,
    },
    
    // Available connectors
    availableConnectors: connectors.map(connector => ({
      id: connector.id,
      name: connector.name,
      icon: connector.icon,
    })),
  };
}