// lib/contracts.ts
export const FAUCET_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS!;

export const FAUCET_TOKEN_ABI = [
  // Read functions
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
  'function maxSupply() view returns (uint256)',
  'function paused() view returns (bool)',
  'function cooldownTime() view returns (uint256)',
  'function lastClaimTime(address user) view returns (uint256)',
  
  // Write functions
  'function claim() external',
  
  // Events
  'event TokensClaimed(address indexed user, uint256 amount)',
  'event ClaimAmountUpdated(uint256 newAmount)',
  'event CooldownTimeUpdated(uint256 newCooldownTime)',
] as const;

// Base Sepolia network constants
export const BASE_SEPOLIA = {
  chainId: 84532,
  name: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  blockExplorer: 'https://sepolia.basescan.org',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
} as const;

// Useful constants
export const CLAIM_AMOUNT = 100;
export const COOLDOWN_HOURS = 24;
export const OWNER = "khushi"