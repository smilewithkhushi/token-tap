'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Coins, 
  Clock, 
  RefreshCw,
  Zap,
  Gift,
  Pause,
  AlertTriangle
} from 'lucide-react';
import { useFaucet } from '@/hooks/useFaucet';

export function FaucetClaim() {
  const {
    faucetState,
    tokenInfo,
    timeRemaining,
    isEligible,
    hasMinimumEth,
    cooldownProgress,
    formattedTimeRemaining,
    claimTokens,
    transaction,
  } = useFaucet();

  const handleClaim = async () => {
    try {
      await claimTokens();
    } catch (error) {
      console.error('Claim failed:', error);
    }
  };

  const getClaimButtonState = () => {
    if (tokenInfo.isPaused) {
      return {
        disabled: true,
        text: 'Faucet Paused',
        icon: Pause,
        variant: 'destructive' as const,
      };
    }
    
    if (!hasMinimumEth) {
      return {
        disabled: true,
        text: 'Insufficient ETH for Gas',
        icon: AlertTriangle,
        variant: 'destructive' as const,
      };
    }
    
    if (transaction.status === 'pending') {
      return {
        disabled: true,
        text: 'Claiming Tokens...',
        icon: RefreshCw,
        variant: 'default' as const,
        animate: true,
      };
    }
    
    if (isEligible) {
      return {
        disabled: false,
        text: `Claim ${tokenInfo.claimAmount} ${tokenInfo.symbol}`,
        icon: Gift,
        variant: 'default' as const,
      };
    }
    
    return {
      disabled: true,
      text: 'Cooldown Active',
      icon: Clock,
      variant: 'secondary' as const,
    };
  };

  const buttonState = getClaimButtonState();

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-blue-100 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Coins className="h-6 w-6 text-blue-600" />
            <span>Token Faucet</span>
          </div>
          <div className="flex items-center space-x-2">
            {tokenInfo.isPaused ? (
              <Badge variant="destructive" className="flex items-center space-x-1">
                <Pause className="h-3 w-3" />
                <span>Paused</span>
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>Active</span>
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Claim Info Card */}
        <div className="p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-lg border border-blue-100">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-2">
              <Gift className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Get Free Tokens
              </h3>
              <p className="text-lg font-semibold text-blue-600">
                {tokenInfo.claimAmount} {tokenInfo.symbol} per claim
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Claim once every {Math.floor(tokenInfo.cooldownTime / 3600)} hours
              </p>
            </div>
          </div>
        </div>

        {/* Cooldown Status */}
        {!faucetState.canClaim && timeRemaining > 0 && (
          <div className="space-y-4">
            <Alert className="border-orange-200 bg-orange-50">
              <Clock className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <div className="flex items-center justify-between">
                  <span>Next claim available in:</span>
                  <span className="font-semibold">{formattedTimeRemaining}</span>
                </div>
              </AlertDescription>
            </Alert>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Cooldown Progress</span>
                <span>{Math.round(cooldownProgress)}%</span>
              </div>
              <Progress value={cooldownProgress} className="h-3" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Started</span>
                <span>Available to claim</span>
              </div>
            </div>
          </div>
        )}

        {/* Ready to Claim */}
        {faucetState.canClaim && !tokenInfo.isPaused && (
          <Alert className="border-green-200 bg-green-50">
            <Zap className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="flex items-center justify-between">
                <span>🎉 Ready to claim tokens!</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Available Now
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Claim Button */}
        <div className="space-y-3">
          <Button
            onClick={handleClaim}
            disabled={buttonState.disabled}
            className={`w-full h-12 text-lg font-semibold shadow-lg transition-all duration-200 ${
              buttonState.variant === 'default' && !buttonState.disabled
                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-xl'
                : ''
            }`}
            variant={buttonState.variant}
            size="lg"
          >
            <buttonState.icon 
              className={`mr-3 h-5 w-5 ${buttonState.animate ? 'animate-spin' : ''}`} 
            />
            {buttonState.text}
          </Button>
          
          <div className="text-center space-y-1">
            <p className="text-xs text-gray-500">
              Gas fees paid in ETH • Free testnet tokens for development
            </p>
            {!tokenInfo.isPaused && (
              <p className="text-xs text-gray-400">
                Contract: {tokenInfo.contractAddress.slice(0, 6)}...{tokenInfo.contractAddress.slice(-4)}
              </p>
            )}
          </div>
        </div>

        {/* Additional extra Info */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">Total Supply</p>
            <p className="text-xs text-gray-500">
              {parseFloat(tokenInfo.totalSupply).toLocaleString()} / {parseFloat(tokenInfo.maxSupply).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">Network</p>
            <p className="text-xs text-gray-500">Base Sepolia</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}