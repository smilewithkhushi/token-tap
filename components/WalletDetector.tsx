'use client';

import { useEffect, useState } from 'react';

export default function WalletDetector() {
  const [walletInfo, setWalletInfo] = useState({
    hasEthereum: false,
    walletType: 'None',
    isConnected: false,
  });

  useEffect(() => {
    const checkWallet = () => {
      if (typeof window === 'undefined') return;

      const hasEthereum = !!window.ethereum;
      let walletType = 'None';
      
      if (window.ethereum) {
        if (window.ethereum.isMetaMask) walletType = 'MetaMask';
        else if (window.ethereum.isCoinbaseWallet) walletType = 'Coinbase Wallet';
        else if (window.ethereum.isRabby) walletType = 'Rabby';
        else walletType = 'Unknown Web3 Wallet';
      }

      setWalletInfo({
        hasEthereum,
        walletType,
        isConnected: hasEthereum && window.ethereum.selectedAddress !== null,
      });
    };

    checkWallet();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', checkWallet);
      window.ethereum.on('connect', checkWallet);
      window.ethereum.on('disconnect', checkWallet);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', checkWallet);
        window.ethereum.removeListener('connect', checkWallet);
        window.ethereum.removeListener('disconnect', checkWallet);
      }
    };
  }, []);

  if (!walletInfo.hasEthereum) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 max-w-md mx-auto mb-6">
        <div className="text-center">
          <h3 className="text-red-300 font-semibold mb-2">⚠️ No Wallet Detected</h3>
          <p className="text-red-200 text-sm mb-4">
            Please install a Web3 wallet to use this faucet
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1 rounded transition-colors"
            >
              Install MetaMask
            </a>
            <a
              href="https://www.coinbase.com/wallet"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors"
            >
              Get Coinbase Wallet
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 max-w-md mx-auto mb-6">
      <div className="text-center text-sm">
        <span className="text-green-300">✅ {walletInfo.walletType} detected</span>
      </div>
    </div>
  );
}