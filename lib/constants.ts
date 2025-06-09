// Network and Contract Configuration
export const NETWORK_CONFIG = {
  BASE_SEPOLIA: {
    chainId: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
  }
} as const;

// Contract Addresses (Update these after deployment)
export const CONTRACT_ADDRESSES = {
  FAUCET_TOKEN: process.env.NEXT_PUBLIC_FAUCET_TOKEN_ADDRESS || '0xYourContractAddressHere',
} as const;

// Faucet Configuration
export const FAUCET_CONFIG = {
  CLAIM_AMOUNT: '100', // 100 tokens per claim
  COOLDOWN_HOURS: 24,
  DECIMALS: 18,
} as const;

// UI Configuration
export const UI_CONFIG = {
  APP_NAME: 'Token Tap',
  APP_DESCRIPTION: 'Claim free testnet tokens on Base',
  GITHUB_URL: 'https://github.com/smilewithkhushi/token-tap',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  INSUFFICIENT_BALANCE: 'Insufficient ETH for gas fees',
  COOLDOWN_ACTIVE: 'Please wait before claiming again',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  NETWORK_ERROR: 'Please switch to Base Sepolia network',
} as const;