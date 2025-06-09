// Wallet Types
export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
}

// Transaction Types
export interface TransactionState {
  hash: string | null;
  status: 'idle' | 'pending' | 'success' | 'error';
  error: string | null;
}

// Token Types
export interface TokenBalance {
  formatted: string;
  raw: bigint;
  symbol: string;
  decimals: number;
}

// Faucet Types
export interface FaucetState {
  canClaim: boolean;
  cooldownEnds: Date | null;
  lastClaimTime: Date | null;
  isLoading: boolean;
}

// Component Props
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}