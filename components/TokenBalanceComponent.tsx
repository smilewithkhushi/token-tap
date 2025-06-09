'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  RefreshCw, 
  AlertTriangle,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { useFaucet } from '@/hooks/useFaucet';

interface TokenBalanceProps {
  address: string;
}

export function TokenBalanceComponent({ address }: TokenBalanceProps) {
  const {
    tokenBalance,
    ethBalance,
    tokenInfo,
    faucetState,
    hasMinimumEth,
    refreshData,
  } = useFaucet();

  const handleRefresh = () => {
    refreshData();
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-blue-100 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-blue-600" />
            <span>Your Balance</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={faucetState.isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${faucetState.isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Token Balance */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Coins className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {tokenInfo.symbol} Tokens
                </span>
              </div>
              <Badge variant="secondary" className="bg-blue-200 text-blue-800 text-xs">
                Testnet
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-blue-700">
                {tokenBalance.formatted}
              </p>
              <p className="text-xs text-blue-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {tokenInfo.name}
              </p>
            </div>
          </div>

          {/* ETH Balance */}
          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">
                  ETH Balance
                </span>
              </div>
              <Badge 
                variant={hasMinimumEth ? "secondary" : "destructive"} 
                className="text-xs"
              >
                {hasMinimumEth ? "Sufficient" : "Low"}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-700">
                {ethBalance.formatted}
              </p>
              <p className="text-xs text-gray-600">
                For gas fees
              </p>
            </div>
          </div>
        </div>

        {/* Low ETH Warning */}
        {!hasMinimumEth && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  Low ETH balance. You may need more for gas fees.
                </span>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-yellow-700 underline"
                  onClick={() => window.open('https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet', '_blank')}
                >
                  Get ETH
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Account Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
          <span>Connected Address:</span>
          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
            {address.slice(0, 6)}...{address.slice(-4)}
          </code>
        </div>
      </CardContent>
    </Card>
  );
}