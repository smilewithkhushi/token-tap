import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from './constants';

// Enhanced ERC-20 Token ABI for the deployed contract
export const FAUCET_TOKEN_ABI = [
  // ERC-20 Standard Functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  
  // Faucet Functions
  'function claim() external',
  'function claimAmount() view returns (uint256)',
  'function cooldownTime() view returns (uint256)',
  'function lastClaimTime(address user) view returns (uint256)',
  'function canClaim(address user) view returns (bool)',
  'function timeUntilNextClaim(address user) view returns (uint256)',
  'function getClaimStatus(address user) view returns (bool canClaimNow, uint256 lastClaim, uint256 nextClaim)',
  'function getFaucetInfo() view returns (uint256 _claimAmount, uint256 _cooldownTime, uint256 _maxSupply, uint256 _totalSupply, bool _isPaused)',
  'function maxSupply() view returns (uint256)',
  'function paused() view returns (bool)',
  
  // Owner Functions
  'function owner() view returns (address)',
  'function setClaimAmount(uint256 newAmount) external',
  'function setCooldownTime(uint256 newCooldownTime) external',
  'function pause() external',
  'function unpause() external',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  'event TokensClaimed(address indexed user, uint256 amount)',
  'event ClaimAmountUpdated(uint256 newAmount)',
  'event CooldownTimeUpdated(uint256 newCooldownTime)',
] as const;

// Get provider from window.ethereum
export function getProvider(): ethers.BrowserProvider {
  if (typeof window === 'undefined') {
    throw new Error('Window is undefined - not in browser environment');
  }
  
  const ethereum = window.ethereum || window.coinbaseWalletExtension;
  if (!ethereum) {
    throw new Error('No wallet provider found. Please install Coinbase Wallet or MetaMask.');
  }
  
  return new ethers.BrowserProvider(ethereum);
}

// Get signer (for transactions)
export async function getSigner(): Promise<ethers.JsonRpcSigner> {
  const provider = getProvider();
  return await provider.getSigner();
}

// Get read-only contract instance
export function getTokenContract(signerOrProvider?: ethers.Signer | ethers.Provider): ethers.Contract {
  const contractAddress = CONTRACT_ADDRESSES.FAUCET_TOKEN;
  
  if (!contractAddress) {
    throw new Error('Token contract address not configured. Please check your environment variables.');
  }

  const providerOrSigner = signerOrProvider || getProvider();
  return new ethers.Contract(contractAddress, FAUCET_TOKEN_ABI, providerOrSigner);
}

// Enhanced contract interaction functions
export const contractUtils = {
  // Get token balance for an address
  async getTokenBalance(address: string): Promise<{ formatted: string; raw: bigint; decimals: number; symbol: string }> {
    try {
      const contract = getTokenContract();
      const [balance, decimals, symbol] = await Promise.all([
        contract.balanceOf(address),
        contract.decimals(),
        contract.symbol(),
      ]);
      
      return {
        raw: balance,
        formatted: ethers.formatUnits(balance, decimals),
        decimals: Number(decimals),
        symbol,
      };
    } catch (error: any) {
      console.error('Error fetching token balance:', error);
      throw new Error(`Failed to fetch token balance: ${error.message}`);
    }
  },

  // Get ETH balance for gas fees
  async getEthBalance(address: string): Promise<{ formatted: string; raw: bigint }> {
    try {
      const provider = getProvider();
      const balance = await provider.getBalance(address);
      
      return {
        raw: balance,
        formatted: ethers.formatEther(balance),
      };
    } catch (error: any) {
      console.error('Error fetching ETH balance:', error);
      throw new Error(`Failed to fetch ETH balance: ${error.message}`);
    }
  },

  // Get comprehensive claim status
  async getClaimStatus(address: string): Promise<{
    canClaim: boolean;
    lastClaimTime: Date | null;
    nextClaimTime: Date | null;
    timeUntilNextClaim: number;
    cooldownHours: number;
  }> {
    try {
      const contract = getTokenContract();
      const [claimStatus, timeUntilNext, cooldownTime] = await Promise.all([
        contract.getClaimStatus(address),
        contract.timeUntilNextClaim(address),
        contract.cooldownTime(),
      ]);

      const [canClaimNow, lastClaim, nextClaim] = claimStatus;
      
      return {
        canClaim: canClaimNow,
        lastClaimTime: Number(lastClaim) > 0 ? new Date(Number(lastClaim) * 1000) : null,
        nextClaimTime: Number(nextClaim) > 0 ? new Date(Number(nextClaim) * 1000) : null,
        timeUntilNextClaim: Number(timeUntilNext),
        cooldownHours: Number(cooldownTime) / 3600,
      };
    } catch (error: any) {
      console.error('Error checking claim status:', error);
      throw new Error(`Failed to check claim status: ${error.message}`);
    }
  },

  // Claim tokens from faucet
  async claimTokens(): Promise<ethers.TransactionResponse> {
    try {
      const signer = await getSigner();
      const contract = getTokenContract(signer);
      
      // Check if contract is paused
      const isPaused = await contract.paused();
      if (isPaused) {
        throw new Error('Faucet is currently paused. Please try again later.');
      }
      
      // Simple transaction without gas estimation to avoid issues
      const tx = await contract.claim();
      
      return tx;
    } catch (error: any) {
      console.error('Error claiming tokens:', error);
      
      // Parse common error messages
      if (error.message?.includes('Cannot claim yet')) {
        throw new Error('You must wait before claiming again. Check the cooldown timer.');
      } else if (error.message?.includes('insufficient funds')) {
        throw new Error('Insufficient ETH for gas fees. Please add more ETH to your wallet.');
      } else if (error.message?.includes('Max supply exceeded')) {
        throw new Error('Maximum token supply reached. No more tokens can be minted.');
      } else if (error.message?.includes('user rejected')) {
        throw new Error('Transaction was rejected by user.');
      } else {
        throw new Error(error.message || 'Failed to claim tokens. Please try again.');
      }
    }
  },

  // Get comprehensive token and faucet info
  async getTokenInfo(): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    maxSupply: string;
    claimAmount: string;
    cooldownTime: number;
    isPaused: boolean;
    contractAddress: string;
  }> {
    try {
      const contract = getTokenContract();
      
      const [name, symbol, decimals, faucetInfo] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.getFaucetInfo(),
      ]);

      const [claimAmount, cooldownTime, maxSupply, totalSupply, isPaused] = faucetInfo;

      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatUnits(totalSupply, decimals),
        maxSupply: ethers.formatUnits(maxSupply, decimals),
        claimAmount: ethers.formatUnits(claimAmount, decimals),
        cooldownTime: Number(cooldownTime),
        isPaused,
        contractAddress: CONTRACT_ADDRESSES.FAUCET_TOKEN,
      };
    } catch (error: any) {
      console.error('Error fetching token info:', error);
      throw new Error(`Failed to fetch token info: ${error.message}`);
    }
  },

  // Wait for transaction confirmation with progress
  async waitForTransaction(txHash: string, confirmations: number = 1): Promise<ethers.TransactionReceipt> {
    try {
      const provider = getProvider();
      const receipt = await provider.waitForTransaction(txHash, confirmations);
      
      if (!receipt) {
        throw new Error('Transaction receipt not found');
      }
      
      if (receipt.status !== 1) {
        throw new Error('Transaction failed during execution');
      }
      
      return receipt;
    } catch (error: any) {
      console.error('Error waiting for transaction:', error);
      throw new Error(`Transaction failed: ${error.message}`);
    }
  },

  // Get transaction status
  async getTransactionStatus(txHash: string): Promise<{
    status: 'pending' | 'success' | 'failed';
    confirmations: number;
    blockNumber?: number;
  }> {
    try {
      const provider = getProvider();
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { status: 'pending', confirmations: 0 };
      }
      
      const currentBlock = await provider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber + 1;
      
      return {
        status: receipt.status === 1 ? 'success' : 'failed',
        confirmations,
        blockNumber: receipt.blockNumber,
      };
    } catch (error: any) {
      console.error('Error getting transaction status:', error);
      return { status: 'failed', confirmations: 0 };
    }
  },

  // Format time remaining for display
  formatTimeRemaining(seconds: number): string {
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
  },
};