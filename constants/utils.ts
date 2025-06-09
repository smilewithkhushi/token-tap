// lib/utils.ts
import { ethers } from 'ethers';

/**
 * Format time remaining in human-readable format
 */
export function formatTimeRemaining(seconds: number): string {
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
}

/**
 * Format token balance with proper decimals
 */
export function formatTokenBalance(balance: string, decimals: number = 18, displayDecimals: number = 2): string {
  const formatted = ethers.formatUnits(balance, decimals);
  return parseFloat(formatted).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals,
  });
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, startLength: number = 6, endLength: number = 4): string {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

/**
 * Calculate percentage with proper formatting
 */
export function calculatePercentage(current: string, total: string): number {
  const currentNum = parseFloat(current);
  const totalNum = parseFloat(total);
  if (totalNum === 0) return 0;
  return (currentNum / totalNum) * 100;
}

/**
 * Get Base Sepolia provider
 */
export function getBaseSepoliaProvider() {
  const rpcUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || 'https://sepolia.base.org';
  return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Format error messages for better UX
 */
export function formatErrorMessage(error: any): string {
  if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
    return 'Transaction was rejected by user.';
  } else if (error.code === 4902) {
    return 'Please add Base Sepolia network to your wallet.';
  } else if (error.message?.includes('insufficient funds')) {
    return 'Insufficient ETH for gas fees on Base Sepolia.';
  } else if (error.message?.includes('CooldownActive')) {
    return 'You are still in cooldown period.';
  } else if (error.message?.includes('MaxSupplyExceeded')) {
    return 'Maximum token supply reached.';
  } else if (error.message?.includes('Pausable: paused')) {
    return 'Faucet is currently paused.';
  } else if (error.message?.includes('execution reverted')) {
    return 'Smart contract rejected the transaction.';
  } else if (error.message?.includes('network')) {
    return 'Network connection issue. Please check Base Sepolia connection.';
  } else {
    return 'Please try again or check your connection to Base Sepolia.';
  }
}