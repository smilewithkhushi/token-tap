'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { baseSepolia } from 'viem/chains';

// Complete ABI for your FaucetToken contract
const FAUCET_TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function name() view returns (string)',
  'function canClaim(address user) view returns (bool)',
  'function timeUntilNextClaim(address user) view returns (uint256)',
  'function getClaimStatus(address user) view returns (bool canClaimNow, uint256 lastClaim, uint256 nextClaim)',
  'function getFaucetInfo() view returns (uint256 _claimAmount, uint256 _cooldownTime, uint256 _maxSupply, uint256 _totalSupply, bool _isPaused)',
  'function claimAmount() view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function maxSupply() view returns (uint256)'
];

interface TokenBalanceProps {
  refreshTrigger?: number;
  onClaimStatusChange?: (canClaim: boolean, timeRemaining: number) => void;
}

export default function TokenBalance({ refreshTrigger, onClaimStatusChange }: TokenBalanceProps) {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState('0');
  const [symbol, setSymbol] = useState('FAUCET');
  const [tokenName, setTokenName] = useState('Faucet Token');
  const [canClaim, setCanClaim] = useState(false);
  const [timeUntilClaim, setTimeUntilClaim] = useState(0);
  const [claimAmount, setClaimAmount] = useState('100');
  const [totalSupply, setTotalSupply] = useState('0');
  const [maxSupply, setMaxSupply] = useState('0');
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Ready to claim!';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const getBaseSepoliaProvider = () => {
    const rpcUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || 'https://sepolia.base.org';
    return new ethers.JsonRpcProvider(rpcUrl);
  };

  const fetchTokenData = async () => {
    if (!address || !isConnected) return;

    // Check if contract address is available
    const contractAddress = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS;
    if (!contractAddress) {
      setError('Contract address not configured. Please check your environment variables.');
      console.error('Missing NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS environment variable');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching token data for address:', address);
      console.log('Contract address:', contractAddress);
      
      const provider = getBaseSepoliaProvider();
      
      // Test provider connection first
      const network = await provider.getNetwork();
      console.log('Network:', network);
      
      const contract = new ethers.Contract(
        contractAddress,
        FAUCET_TOKEN_ABI,
        provider
      );

      console.log('Contract created, fetching data...');

      // Try each function individually to identify which one fails
      try {
        const balanceResult = await contract.balanceOf(address);
        console.log('Balance:', balanceResult.toString());
        
        const symbolResult = await contract.symbol();
        console.log('Symbol:', symbolResult);
        
        const decimalsResult = await contract.decimals();
        console.log('Decimals:', decimalsResult.toString());
        
        const nameResult = await contract.name();
        console.log('Name:', nameResult);
        
        const canClaimResult = await contract.canClaim(address);
        console.log('Can claim:', canClaimResult);
        
        const timeUntilClaimResult = await contract.timeUntilNextClaim(address);
        console.log('Time until claim:', timeUntilClaimResult.toString());
        
        const faucetInfoResult = await contract.getFaucetInfo();
        console.log('Faucet info:', faucetInfoResult);

        // Process results
        const formattedBalance = ethers.formatUnits(balanceResult, decimalsResult);
        const formattedClaimAmount = ethers.formatUnits(faucetInfoResult[0], decimalsResult);
        const formattedTotalSupply = ethers.formatUnits(faucetInfoResult[3], decimalsResult);
        const formattedMaxSupply = ethers.formatUnits(faucetInfoResult[2], decimalsResult);

        setBalance(formattedBalance);
        setSymbol(symbolResult);
        setTokenName(nameResult);
        setCanClaim(canClaimResult);
        setTimeUntilClaim(Number(timeUntilClaimResult));
        setClaimAmount(formattedClaimAmount);
        setTotalSupply(formattedTotalSupply);
        setMaxSupply(formattedMaxSupply);
        setIsPaused(faucetInfoResult[4]);

        // Notify parent component about claim status
        if (onClaimStatusChange) {
          onClaimStatusChange(canClaimResult, Number(timeUntilClaimResult));
        }
        
      } catch (contractError) {
        console.error('Contract call error:', contractError);
        throw contractError;
      }

    } catch (error: any) {
      console.error('Error fetching token data:', error);
      
      // More specific error messages
      if (error.message?.includes('could not detect network')) {
        setError('Cannot connect to Base Sepolia. Please check your RPC endpoint.');
      } else if (error.message?.includes('call revert exception')) {
        setError('Contract not found or invalid. Please verify the contract address.');
      } else if (error.message?.includes('network')) {
        setError('Network connection failed. Please check your internet connection.');
      } else {
        setError(`Failed to fetch token data: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every second to update countdown
  useEffect(() => {
    const interval = setInterval(() => {
      if (timeUntilClaim > 0) {
        setTimeUntilClaim(prev => Math.max(0, prev - 1));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeUntilClaim]);

  useEffect(() => {
    if (isConnected) {
      fetchTokenData();
    }
  }, [address, isConnected, refreshTrigger]);

  // Don't render if wallet not connected
  if (!isConnected) return null;

  return (
    <div className="text-center mb-8 space-y-6">
      {/* Main Balance Card */}
      <div className="bg-gray-800 rounded-xl p-6 max-w-md mx-auto border border-gray-700 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-300 mb-2">Your Balance</h3>
        
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-10 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-32 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : (
          <>
            <p className="text-4xl font-bold text-white mb-1">
              {parseFloat(balance).toLocaleString()} {symbol}
            </p>
            <p className="text-sm text-gray-400">{tokenName}</p>
          </>
        )}
      </div>

      {/* Faucet Status Card */}
      <div className="bg-gray-800 rounded-xl p-6 max-w-md mx-auto border border-gray-700 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Faucet Status</h3>
        
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {isPaused && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-400">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="font-semibold">Faucet Paused</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Claim Amount:</span>
              <span className="text-white font-semibold">{parseFloat(claimAmount).toLocaleString()} {symbol}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Status:</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${canClaim && !isPaused ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className={`font-semibold ${canClaim && !isPaused ? 'text-green-400' : 'text-yellow-400'}`}>
                  {isPaused ? 'Paused' : canClaim ? 'Ready!' : 'Cooldown'}
                </span>
              </div>
            </div>
            
            {!canClaim && !isPaused && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Next claim in:</span>
                <span className="text-blue-400 font-mono text-sm">
                  {formatTimeRemaining(timeUntilClaim)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Token Supply Info */}
      <div className="bg-gray-800 rounded-xl p-4 max-w-md mx-auto border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Token Supply</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Total Supply:</span>
            <span className="text-gray-200">{parseFloat(totalSupply).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Max Supply:</span>
            <span className="text-gray-200">{parseFloat(maxSupply).toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(parseFloat(totalSupply) / parseFloat(maxSupply)) * 100}%` 
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 text-center">
            {((parseFloat(totalSupply) / parseFloat(maxSupply)) * 100).toFixed(1)}% of max supply
          </p>
        </div>
      </div>

      {/* Contract Info with better error display */}
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3 max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 text-blue-300 text-sm">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span>Connected to Base Sepolia</span>
        </div>
        <div className="text-xs text-blue-400 mt-1">
          {process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS ? (
            <>Contract: {process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS?.slice(0, 6)}...
            {process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS?.slice(-4)}</>
          ) : (
            <span className="text-red-400">⚠️ Contract address not configured</span>
          )}
        </div>
      </div>
    </div>
  );
}