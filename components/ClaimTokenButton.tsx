'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

// ABI for claiming tokens from your FaucetToken contract
const FAUCET_TOKEN_ABI = [
  'function claim() external',
  'function canClaim(address user) view returns (bool)',
  'function timeUntilNextClaim(address user) view returns (uint256)',
  'function claimAmount() view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function paused() view returns (bool)'
];

interface ClaimTokensButtonProps {
  onClaim?: () => void;
  canClaim?: boolean;
  timeRemaining?: number;
}

export default function ClaimTokensButton({ onClaim, canClaim = false, timeRemaining = 0 }: ClaimTokensButtonProps) {
  const { address, isConnected } = useAccount();
  const [claiming, setClaiming] = useState(false);
  const [lastClaimTx, setLastClaimTx] = useState('');

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return '';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getBaseSepoliaSigner = async () => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error('Not in browser environment');
    }

    // Check for window.ethereum
    if (!window.ethereum) {
      throw new Error('No wallet extension detected. Please install MetaMask, Coinbase Wallet, or another Web3 wallet.');
    }

    try {
      // Request account access if needed
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Check current network
      const network = await provider.getNetwork();
      const baseSepoliaChainId = 84532; // Base Sepolia chain ID
      
      console.log('Current network:', network.chainId.toString());
      console.log('Target network:', baseSepoliaChainId);
      
      if (Number(network.chainId) !== baseSepoliaChainId) {
        console.log('Switching to Base Sepolia...');
        
        try {
          // Request to switch to Base Sepolia
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${baseSepoliaChainId.toString(16)}` }],
          });
        } catch (switchError) {
          console.log('Switch error:', switchError);
          
          // This error code indicates that the chain has not been added to the wallet
          if (switchError && typeof switchError === 'object' && 'code' in switchError && switchError.code === 4902) {
            console.log('Adding Base Sepolia network...');
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${baseSepoliaChainId.toString(16)}`,
                chainName: 'Base Sepolia',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia.basescan.org'],
              }],
            });
          } else {
            throw switchError;
          }
        }
        
        // Re-create provider after network switch
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        return await newProvider.getSigner();
      }
      
      return await provider.getSigner();
      
    } catch (error) {
      console.error('Error in getBaseSepoliaSigner:', error);
      throw error;
    }
  };

  const claimTokens = async () => {
    if (!address || !isConnected || !canClaim) {
      console.log('Claim requirements not met:', { address, isConnected, canClaim });
      return;
    }

    // Check if contract address is available
    const contractAddress = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS;
    if (!contractAddress) {
      alert('❌ Contract address not configured. Please check your environment variables.');
      return;
    }

    setClaiming(true);
    
    try {
      console.log('Starting claim process...');
      console.log('User address:', address);
      console.log('Contract address:', contractAddress);
      
      // Get signer for Base Sepolia
      const signer = await getBaseSepoliaSigner();
      console.log('Signer obtained successfully');
      
      // Verify signer address matches connected address
      const signerAddress = await signer.getAddress();
      console.log('Signer address:', signerAddress);
      
      if (signerAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Wallet address mismatch. Please make sure you are connected to the correct wallet.');
      }
      
      // Create contract instance
      const contract = new ethers.Contract(
        contractAddress,
        FAUCET_TOKEN_ABI,
        signer
      );

      console.log('Contract instance created');

      // Check if contract is paused
      const isPaused = await contract.paused();
      if (isPaused) {
        alert('❌ Faucet is currently paused. Please try again later.');
        return;
      }

      // Double-check if user can claim
      const userCanClaim = await contract.canClaim(address);
      if (!userCanClaim) {
        alert('❌ You are still in cooldown period. Please wait before claiming again.');
        return;
      }

      console.log('Pre-flight checks passed, sending claim transaction...');
      
      // Call the claim function with optimized gas
      const gasEstimate = await contract.claim.estimateGas();
      console.log('Estimated gas:', gasEstimate.toString());
      
      const tx = await contract.claim({
        gasLimit: gasEstimate * BigInt(120) / BigInt(100), // Add 20% buffer
      });
      
      console.log('Transaction sent:', tx.hash);
      
      // Set transaction hash immediately
      setLastClaimTx(tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      // Show success message with Base-specific messaging
      alert('🎉 100 FAUCET tokens claimed successfully on Base Sepolia!');
      
      // Trigger parent component refresh
      if (onClaim) {
        onClaim();
      }
      
    } catch (error: any) {
      console.error('Error claiming tokens:', error);
      
      // Handle specific error messages
      let errorMessage = 'Failed to claim tokens. ';
      
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        errorMessage += 'Transaction was rejected by user.';
      } else if (error.code === 4902) {
        errorMessage += 'Please add Base Sepolia network to your wallet.';
      } else if (error.message?.includes('No wallet extension detected')) {
        errorMessage += 'Please install MetaMask, Coinbase Wallet, or another Web3 wallet extension.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage += 'Insufficient ETH for gas fees on Base Sepolia.';
      } else if (error.message?.includes('CooldownActive')) {
        errorMessage += 'You are still in cooldown period.';
      } else if (error.message?.includes('MaxSupplyExceeded')) {
        errorMessage += 'Maximum token supply reached.';
      } else if (error.message?.includes('Pausable: paused')) {
        errorMessage += 'Faucet is currently paused.';
      } else if (error.message?.includes('execution reverted')) {
        if (error.message.includes('Cannot claim yet')) {
          errorMessage += 'Cooldown period is still active.';
        } else {
          errorMessage += 'Smart contract rejected the transaction.';
        }
      } else if (error.message?.includes('network')) {
        errorMessage += 'Network connection issue. Please check Base Sepolia connection.';
      } else if (error.message?.includes('address mismatch')) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again or check your connection to Base Sepolia.';
      }
      
      alert('❌ ' + errorMessage);
    } finally {
      setClaiming(false);
    }
  };

  // Don't render if wallet not connected
  if (!isConnected) return null;

  const getButtonText = () => {
    if (claiming) return 'Claiming...';
    if (!canClaim && timeRemaining > 0) return `Wait ${formatTimeRemaining(timeRemaining)}`;
    return '💧 Claim 100 FAUCET';
  };

  const getButtonStyle = () => {
    if (claiming) return 'bg-gray-600 cursor-not-allowed';
    if (!canClaim) return 'bg-yellow-600 cursor-not-allowed';
    return 'bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-lg hover:shadow-blue-500/25';
  };

  return (
    <div className="text-center space-y-6">
      {/* Main Claim Button */}
      <button
        onClick={claimTokens}
        disabled={claiming || !canClaim}
        className={`
          ${getButtonStyle()} 
          text-white font-bold py-4 px-8 rounded-lg transition duration-200 transform 
          flex items-center gap-2 mx-auto min-w-[200px] justify-center
          border border-blue-500/20
        `}
      >
        {claiming ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Claiming...
          </>
        ) : !canClaim && timeRemaining > 0 ? (
          <>
            ⏰ Wait {formatTimeRemaining(timeRemaining)}
          </>
        ) : (
          <>
            💧 Claim 100 FAUCET
          </>
        )}
      </button>

      {/* Claim Status Message */}
      {!canClaim && timeRemaining > 0 && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-yellow-300 text-sm">
            ⏳ Cooldown active. You can claim again in {formatTimeRemaining(timeRemaining)}.
          </p>
        </div>
      )}

      {/* Transaction Link */}
      {lastClaimTx && (
        <div className="bg-gray-800 rounded-lg p-4 max-w-md mx-auto border border-gray-700">
          <p className="text-sm text-gray-400 mb-2">Recent claim transaction:</p>
          <div className="space-y-2">
            <div className="text-xs text-gray-300 font-mono break-all">
              {lastClaimTx}
            </div>
            <a 
              href={`https://sepolia.basescan.org/tx/${lastClaimTx}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              View on BaseScan ↗
            </a>
          </div>
        </div>
      )}
      
    </div>
  );
}