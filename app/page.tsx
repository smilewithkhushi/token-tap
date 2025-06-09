'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Coins,
  Wallet2Icon,
  ExternalLink,
  Info,
  Clock,
  Copy,
  CheckCheck
} from 'lucide-react';
import { useState } from 'react';

// OnchainKit Components
import {
  ConnectWallet,
  Wallet as WalletProvider,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import { ethers } from 'ethers';

// Wagmi hook for account management
import { useAccount } from 'wagmi';

// Custom Components
import { TokenBalanceComponent } from '@/components/TokenBalanceComponent';
import { FaucetClaim } from '@/components/FaucetClaim';
import { TransactionStatus } from '@/components/TransactionStatus';

// Custom Hooks
import { useFaucet } from '@/hooks/useFaucet';
import HeroSection from '@/components/HeroSection';

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { tokenInfo } = useFaucet();
  const [copied, setCopied] = useState(false);

  const copyContractAddress = async () => {
    if (tokenInfo.contractAddress) {
      await navigator.clipboard.writeText(tokenInfo.contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return 'Not available';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="space-y-8 mx-6 md:mx-22 lg:mx-32 xl:mx-40 2xl:mx-52 my-10">

      <HeroSection />

      {/* Wallet Connection Card - Always Visible */}
      <Card className="bg-white/95 backdrop-blur-sm border-blue-100 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
            <Wallet2Icon className="h-7 w-7 text-blue-600" />
            <span>{isConnected ? 'Wallet Connected' : 'Connect Your Wallet'}</span>
          </CardTitle>
          <CardDescription className="text-lg">
            {isConnected
              ? 'Your wallet is connected. Click below to manage your connection.'
              : 'Connect your wallet to start claiming free testnet tokens'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className={`border-blue-200 ${isConnected ? 'bg-green-50' : 'bg-blue-50'}`}>
            <Wallet2Icon className={`h-4 w-4 ${isConnected ? 'text-green-600' : 'text-blue-600'}`} />
            <AlertDescription className={isConnected ? 'text-green-800' : 'text-blue-800'}>
              {isConnected
                ? 'Wallet successfully connected to Base Sepolia testnet'
                : 'Connect your Coinbase Wallet, MetaMask, or any Web3 wallet to get started'
              }
            </AlertDescription>
          </Alert>

          <div className="flex justify-center">
            <WalletProvider>
              <ConnectWallet
                text={isConnected ? "Manage Wallet" : "Connect Wallet"}
              />
              <WalletDropdown>
                <Identity address={address} hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                  <EthBalance />
                </Identity>
                <WalletDropdownLink
                  icon="wallet"
                  href="https://keys.coinbase.com"
                  target="_blank"
                >
                  Wallet
                </WalletDropdownLink>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </WalletProvider>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Supports 100+ wallets including Coinbase Wallet, MetaMask, WalletConnect</p>
          </div>
        </CardContent>
      </Card>

      {/* Connected State - Show Faucet Interface */}
      {isConnected && (
        <div className="space-y-6">

          {/* a button to claim faucets */}

          <Card className="bg-white/95 backdrop-blur-sm border-blue-100 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Coins className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Claim Free Tokens
                  </h3>
                  <p className="text-blue-600 font-semibold">
                    Get 100 FAUCET tokens instantly
                  </p>
                </div>

                <Button
                  onClick={async () => {
                    try {
                      // Simple claim function
                      if (window.ethereum) {
                        const provider = new ethers.BrowserProvider(window.ethereum);
                        const signer = await provider.getSigner();

                        // Replace with your contract address
                        const contractAddress = process.env.NEXT_PUBLIC_FAUCET_TOKEN_ADDRESS || "YOUR_CONTRACT_ADDRESS";
                        const contract = new ethers.Contract(contractAddress, ["function claim() external"], signer);

                        const tx = await contract.claim();
                        console.log("Transaction sent:", tx.hash);
                        alert("Tokens claimed! Check your wallet.");
                      }
                    } catch (error) {
                      console.error(error);
                      alert("Error claiming tokens. Check console.");
                    }
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl"
                  size="lg"
                >
                  <Coins className="mr-2 h-5 w-5" />
                  Claim 100 FAUCET Tokens
                </Button>

                <p className="text-xs text-gray-500">
                  Free testnet tokens • No real value
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Token Balance Component */}
          {address && <TokenBalanceComponent address={address as string} />}

          {/* Transaction Status Component */}
          <TransactionStatus />

          {/* Faucet Claim Component */}
          <FaucetClaim />
        </div>
      )}

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* How It Works */}
        <Card className="bg-white/90 backdrop-blur-sm border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-600" />
              <span>How It Works</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Connect Wallet</p>
                  <p className="text-sm text-gray-600">Connect to Base Sepolia testnet</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">Claim Tokens</p>
                  <p className="text-sm text-gray-600">
                    Get {tokenInfo.claimAmount || '100'} {tokenInfo.symbol || 'FAUCET'} tokens instantly
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">Wait & Repeat</p>
                  <p className="text-sm text-gray-600">
                    Claim again after {Math.floor((tokenInfo.cooldownTime || 86400) / 3600)}-hour cooldown
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                  4
                </div>
                <div>
                  <p className="font-medium text-gray-900">Build & Test</p>
                  <p className="text-sm text-gray-600">Use for DApp development</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Token Details */}
        <Card className="bg-white/90 backdrop-blur-sm border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Coins className="h-5 w-5 text-blue-600" />
              <span>Token Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Name</p>
                <p className="font-semibold text-gray-900">{tokenInfo.name || 'Faucet Token'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Symbol</p>
                <p className="font-semibold text-gray-900">{tokenInfo.symbol || 'FAUCET'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Standard</p>
                <p className="font-semibold text-gray-900">ERC-20</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Network</p>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Base Sepolia
                </Badge>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Claim Amount</span>
                  <span className="font-semibold text-gray-900">
                    {tokenInfo.claimAmount || '100'} {tokenInfo.symbol || 'FAUCET'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cooldown Period</span>
                  <span className="font-semibold text-gray-900 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {Math.floor((tokenInfo.cooldownTime || 86400) / 3600)}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Supply</span>
                  <span className="font-semibold text-gray-900">
                    {parseFloat(tokenInfo.totalSupply || '0').toLocaleString()} / {parseFloat(tokenInfo.maxSupply || '1000000').toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Contract Address */}
            {tokenInfo.contractAddress && (
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <p className="text-gray-500 text-sm">Contract Address</p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 text-xs bg-gray-100 px-3 py-2 rounded font-mono">
                      {formatAddress(tokenInfo.contractAddress)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyContractAddress}
                      className="h-8 w-8 p-0"
                    >
                      {copied ? (
                        <CheckCheck className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://sepolia.basescan.org/address/${tokenInfo.contractAddress}`, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <Alert className="border-yellow-200 bg-yellow-50">
              <Info className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 text-xs">
                ⚠️ These are testnet tokens with no real value. For development and testing only.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>


    </div>
  );
}