'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  X,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useFaucet } from '@/hooks/useFaucet';

export function TransactionStatus() {
  const {
    transaction,
    resetTransaction,
    getExplorerUrl,
  } = useFaucet();

  // Don't render if no transaction
  if (transaction.status === 'idle') {
    return null;
  }

  const getStatusConfig = () => {
    switch (transaction.status) {
      case 'pending':
        return {
          icon: RefreshCw,
          iconClass: 'text-blue-600 animate-spin',
          title: 'Transaction Pending',
          description: 'Your transaction is being processed on the blockchain...',
          bgClass: 'border-blue-200 bg-blue-50',
          textClass: 'text-blue-800',
          badge: { text: 'Processing', variant: 'secondary' as const, class: 'bg-blue-100 text-blue-800' },
        };
      case 'success':
        return {
          icon: CheckCircle,
          iconClass: 'text-green-600',
          title: 'Transaction Successful!',
          description: '🎉 Your tokens have been successfully claimed and added to your wallet.',
          bgClass: 'border-green-200 bg-green-50',
          textClass: 'text-green-800',
          badge: { text: 'Confirmed', variant: 'secondary' as const, class: 'bg-green-100 text-green-800' },
        };
      case 'error':
        return {
          icon: AlertTriangle,
          iconClass: 'text-red-600',
          title: 'Transaction Failed',
          description: transaction.error || 'An error occurred while processing your transaction.',
          bgClass: 'border-red-200 bg-red-50',
          textClass: 'text-red-800',
          badge: { text: 'Failed', variant: 'destructive' as const },
        };
      default:
        return null;
    }
  };

  const statusConfig = getStatusConfig();
  if (!statusConfig) return null;

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
      <CardContent className="pt-6">
        <Alert className={statusConfig.bgClass}>
          <div className="flex items-start space-x-3">
            <statusConfig.icon className={`h-5 w-5 mt-0.5 ${statusConfig.iconClass}`} />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className={`font-semibold ${statusConfig.textClass}`}>
                  {statusConfig.title}
                </h4>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={statusConfig.badge.variant}
                    className={statusConfig.badge.class}
                  >
                    {statusConfig.badge.text}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetTransaction}
                    className={`h-6 w-6 p-0 hover:bg-white/50 ${statusConfig.textClass}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <AlertDescription className={statusConfig.textClass}>
                {statusConfig.description}
              </AlertDescription>

              {/* Transaction Hash */}
              {transaction.hash && (
                <div className="flex items-center justify-between pt-2 mt-3 border-t border-current/20">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="opacity-75">Transaction:</span>
                    <code className="bg-white/50 px-2 py-1 rounded text-xs font-mono">
                      {transaction.hash.slice(0, 8)}...{transaction.hash.slice(-6)}
                    </code>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(getExplorerUrl(transaction.hash!), '_blank')}
                    className={`h-8 px-3 hover:bg-white/50 ${statusConfig.textClass}`}
                  >
                    <span className="text-xs mr-1">View on BaseScan</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* Next Steps for Success */}
              {transaction.status === 'success' && (
                <div className="mt-4 p-3 bg-white/50 rounded-lg border border-green-300">
                  <h5 className="font-medium text-green-900 mb-2 flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    What's Next?
                  </h5>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Your tokens are now in your wallet</li>
                    <li>• Use them for testing DApps and smart contracts</li>
                    <li>• Come back after the cooldown to claim more</li>
                  </ul>
                </div>
              )}

              {/* Retry for Error */}
              {transaction.status === 'error' && (
                <div className="mt-3 flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetTransaction}
                    className="text-red-700 border-red-300 hover:bg-red-50"
                  >
                    Try Again
                  </Button>
                  <span className="text-xs text-red-600">
                    Check your wallet and network connection
                  </span>
                </div>
              )}

              {/* Processing Time Info for Pending */}
              {transaction.status === 'pending' && (
                <div className="mt-3 flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 opacity-75" />
                  <span className="opacity-75">
                    This usually takes 10-30 seconds on Base Sepolia
                  </span>
                </div>
              )}
            </div>
          </div>
        </Alert>
      </CardContent>
    </Card>
  );
}