'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

// Types
interface FaucetState {
  canClaim: boolean;
  cooldownEnds: Date | null;
  lastClaimTime: Date | null;
  isLoading: boolean;
}

interface TokenBalance {
  formatted: string;
  raw: bigint;
  symbol: string;
  decimals: number;
}

interface TransactionState {
  hash: string | null;
  status: 'idle' | 'pending' | 'success' | 'error';
  error: string | null;
}

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  maxSupply: string;
  claimAmount: string;
  cooldownTime: number;
  isPaused: boolean;
  contractAddress: string;
}

// Contract ABI
const FAUCET_TOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function claim() external',
  'function claimAmount() view returns (uint256)',
  'function cooldownTime() view returns (uint256)',
  'function lastClaimTime(address user) view returns (uint256)',
  'function canClaim(address user) view returns (bool)',
  'function timeUntilNextClaim(address user) view returns (uint256)',
  'function getFaucetInfo() view returns (uint256 _claimAmount, uint256 _cooldownTime, uint256 _maxSupply, uint256 _totalSupply, bool _isPaused)',
  'function maxSupply() view returns (uint256)',
  'function paused() view returns (bool)',
];

export function useFaucet() {
  
  const { address, isConnected } = useAccount();

  const [faucetState, setFaucetState] = useState<FaucetState>({
    canClaim: true,
    cooldownEnds: null,
    lastClaimTime: null,
    isLoading: false,
  });

  const [tokenBalance, setTokenBalance] = useState<TokenBalance>({
    formatted: '0',
    raw: BigInt(0),
    symbol: 'FAUCET',
    decimals: 18,
  });

  const [ethBalance, setEthBalance] = useState<TokenBalance>({
    formatted: '0',
    raw: BigInt(0),
    symbol: 'ETH',
    decimals: 18,
  });

  const [transaction, setTransaction] = useState<TransactionState>({
    hash: null,
    status: 'idle',
    error: null,
  });

  const [tokenInfo, setTokenInfo] = useState<TokenInfo>({
    name: 'Faucet Token',
    symbol: 'FAUCET',
    decimals: 18,
    totalSupply: '0',
    maxSupply: '1000000',
    claimAmount: '100',
    cooldownTime: 86400, // 24 hours
    isPaused: false,
    contractAddress: process.env.NEXT_PUBLIC_FAUCET_TOKEN_ADDRESS || '',
  });

  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Replace the getProvider function with this:
  const getProvider = useCallback(() => {
    if (typeof window === 'undefined') {
      throw new Error('Not in browser environment');
    }

    // Check for various wallet providers
    const ethereum = window.ethereum || window.coinbaseWalletExtension;
    if (!ethereum) {
      throw new Error('No wallet provider found');
    }

    return new ethers.BrowserProvider(ethereum);
  }, []);

  const getContract = useCallback((withSigner = false) => {
    const contractAddress = process.env.NEXT_PUBLIC_FAUCET_TOKEN_ADDRESS;
    if (!contractAddress) {
      throw new Error('Contract address not configured');
    }

    const provider = getProvider();
    if (withSigner) {
      return provider.getSigner().then(signer =>
        new ethers.Contract(contractAddress, FAUCET_TOKEN_ABI, signer)
      );
    }
    return new ethers.Contract(contractAddress, FAUCET_TOKEN_ABI, provider);
  }, [getProvider]);

  // Fetch token balance
  // Replace fetchTokenBalance with this:
  const fetchTokenBalance = useCallback(async () => {
    if (!address || !isConnected) return;

    try {
      // Check if we have a provider first
      if (typeof window === 'undefined' || !window.ethereum) {
        console.log('No wallet provider available');
        return;
      }

      const contract = getContract();
      const [balance, decimals, symbol] = await Promise.all([
        contract.balanceOf(address),
        contract.decimals(),
        contract.symbol(),
      ]);

      setTokenBalance({
        raw: balance,
        formatted: parseFloat(ethers.formatUnits(balance, decimals)).toFixed(2),
        symbol,
        decimals: Number(decimals),
      });
    } catch (error) {
      console.error('Error fetching token balance:', error);
      // Don't throw error, just log it
    }
  }, [address, isConnected, getContract]);

// Add this near the top of the useFaucet function, after the useState declarations:
const [isWalletReady, setIsWalletReady] = useState(false);

// Add this useEffect to check wallet readiness:
useEffect(() => {
  const checkWallet = () => {
    if (typeof window !== 'undefined' && window.ethereum && isConnected && address) {
      setIsWalletReady(true);
    } else {
      setIsWalletReady(false);
    }
  };

  checkWallet();
  
  // Listen for wallet changes
  if (typeof window !== 'undefined' && window.ethereum) {
    window.ethereum.on('accountsChanged', checkWallet);
    window.ethereum.on('chainChanged', checkWallet);
    
    return () => {
      window.ethereum?.removeListener?.('accountsChanged', checkWallet);
      window.ethereum?.removeListener?.('chainChanged', checkWallet);
    };
  }
}, [isConnected, address]);

  // Fetch ETH balance
  // Replace fetchEthBalance with this:
  const fetchEthBalance = useCallback(async () => {
    if (!address || !isConnected) return;

    try {
      // Check if we have a provider first
      if (typeof window === 'undefined' || !window.ethereum) {
        console.log('No wallet provider available');
        return;
      }

      const provider = getProvider();
      const balance = await provider.getBalance(address);

      setEthBalance({
        raw: balance,
        formatted: parseFloat(ethers.formatEther(balance)).toFixed(4),
        symbol: 'ETH',
        decimals: 18,
      });
    } catch (error) {
      console.error('Error fetching ETH balance:', error);
      // Don't throw error, just log it
    }
  }, [address, isConnected, getProvider]);



  // Fetch claim status
  const fetchClaimStatus = useCallback(async () => {
    if (!address || !isConnected) return;

    try {
      const contract = await getContract();
      const [canClaim, lastClaim, timeUntil, cooldownTime] = await Promise.all([
        contract.canClaim(address),
        contract.lastClaimTime(address),
        contract.timeUntilNextClaim(address),
        contract.cooldownTime(),
      ]);

      const lastClaimDate = Number(lastClaim) > 0 ? new Date(Number(lastClaim) * 1000) : null;
      const cooldownEnds = lastClaimDate
        ? new Date(lastClaimDate.getTime() + Number(cooldownTime) * 1000)
        : null;

      setFaucetState({
        canClaim,
        lastClaimTime: lastClaimDate,
        cooldownEnds,
        isLoading: false,
      });

      setTimeRemaining(Number(timeUntil));
    } catch (error) {
      console.error('Error fetching claim status:', error);
      setFaucetState(prev => ({ ...prev, isLoading: false }));
    }
  }, [address, isConnected, getContract]);

  // Fetch token info
  const fetchTokenInfo = useCallback(async () => {
    try {
      const contract = await getContract();
      const [name, symbol, decimals, faucetInfo] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.getFaucetInfo(),
      ]);

      const [claimAmount, cooldownTime, maxSupply, totalSupply, isPaused] = faucetInfo;

      setTokenInfo({
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatUnits(totalSupply, decimals),
        maxSupply: ethers.formatUnits(maxSupply, decimals),
        claimAmount: ethers.formatUnits(claimAmount, decimals),
        cooldownTime: Number(cooldownTime),
        isPaused,
        contractAddress: process.env.NEXT_PUBLIC_FAUCET_TOKEN_ADDRESS || '',
      });
    } catch (error) {
      console.error('Error fetching token info:', error);
    }
  }, [getContract]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    if (!address || !isConnected) return;

    setFaucetState(prev => ({ ...prev, isLoading: true }));

    try {
      await Promise.all([
        fetchTokenBalance(),
        fetchEthBalance(),
        fetchClaimStatus(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setFaucetState(prev => ({ ...prev, isLoading: false }));
    }
  }, [address, isConnected, fetchTokenBalance, fetchEthBalance, fetchClaimStatus]);

  // Countdown timer
  const startCountdown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const updateCountdown = () => {
      if (faucetState.cooldownEnds) {
        const now = Date.now();
        const endTime = faucetState.cooldownEnds.getTime();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

        setTimeRemaining(remaining);

        if (remaining === 0) {
          clearInterval(intervalRef.current!);
          fetchClaimStatus();
        }
      }
    };

    updateCountdown();
    intervalRef.current = setInterval(updateCountdown, 1000);
  }, [faucetState.cooldownEnds, fetchClaimStatus]);

  // Claim tokens
  const claimTokens = useCallback(async () => {
    if (!address || !faucetState.canClaim) return;

    setTransaction({
      hash: null,
      status: 'pending',
      error: null,
    });

    try {
      const contract = await getContract(true);
      const tx = await contract.claim();

      setTransaction({
        hash: tx.hash,
        status: 'pending',
        error: null,
      });

      // Wait for confirmation
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        setTransaction({
          hash: tx.hash,
          status: 'success',
          error: null,
        });

        // Refresh data after successful claim
        setTimeout(() => {
          fetchAllData();
        }, 2000);
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Claim error:', error);
      setTransaction({
        hash: null,
        status: 'error',
        error: error.message || 'Transaction failed',
      });
    }
  }, [address, faucetState.canClaim, getContract, fetchAllData]);

  // Reset transaction
  const resetTransaction = useCallback(() => {
    setTransaction({
      hash: null,
      status: 'idle',
      error: null,
    });
  }, []);

  // Format time remaining
  const formatTimeRemaining = useCallback((seconds: number): string => {
    if (seconds <= 0) return '0 seconds';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }, []);

  // Calculate cooldown progress
  const getCooldownProgress = useCallback(() => {
    if (!faucetState.cooldownEnds || faucetState.canClaim) return 100;

    const now = Date.now();
    const endTime = faucetState.cooldownEnds.getTime();
    const startTime = endTime - (tokenInfo.cooldownTime * 1000);

    const totalDuration = endTime - startTime;
    const elapsed = now - startTime;

    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  }, [faucetState.cooldownEnds, faucetState.canClaim, tokenInfo.cooldownTime]);

  // Effects
  useEffect(() => {
    // Add a small delay to ensure wallet is fully connected
    const timer = setTimeout(() => {
      if (address && isConnected && typeof window !== 'undefined' && window.ethereum) {
        fetchAllData();
        fetchTokenInfo();
      } else {
        // Reset state when disconnected
        setFaucetState({
          canClaim: true,
          cooldownEnds: null,
          lastClaimTime: null,
          isLoading: false,
        });
        setTokenBalance({
          formatted: '0',
          raw: BigInt(0),
          symbol: 'FAUCET',
          decimals: 18,
        });
        setEthBalance({
          formatted: '0',
          raw: BigInt(0),
          symbol: 'ETH',
          decimals: 18,
        });
        setTransaction({
          hash: null,
          status: 'idle',
          error: null,
        });
        setTimeRemaining(0);
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, [address, isConnected, fetchAllData, fetchTokenInfo]);

  useEffect(() => {
    if (!faucetState.canClaim && timeRemaining > 0) {
      startCountdown();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [faucetState.canClaim, timeRemaining, startCountdown]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!address || !isConnected) return;

    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [address, isConnected, fetchAllData]);


  return {
  // State
  faucetState,
  tokenBalance,
  ethBalance,
  transaction,
  tokenInfo,
  timeRemaining,
  isWalletReady, // Add this

  // Actions
  claimTokens,
  resetTransaction,
  refreshData: fetchAllData,

  // Computed values
  isEligible: faucetState.canClaim && isConnected && !tokenInfo.isPaused && isWalletReady,
  hasMinimumEth: parseFloat(ethBalance.formatted) > 0.0001,
  cooldownProgress: getCooldownProgress(),
  formattedTimeRemaining: formatTimeRemaining(timeRemaining),

  // Helper functions
  getExplorerUrl: (txHash: string) => `https://sepolia.basescan.org/tx/${txHash}`,
  getAddressUrl: (address: string) => `https://sepolia.basescan.org/address/${address}`,
};
}