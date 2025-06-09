'use client';

import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownLink, WalletDropdownDisconnect } from '@coinbase/onchainkit/wallet';
import { Address, Avatar, Name, Identity, EthBalance } from '@coinbase/onchainkit/identity';
import { color } from '@coinbase/onchainkit/theme';

export default function ConnectWalletButton() {
  return (
    <div className="flex justify-center mb-8">
      <Wallet>
        <ConnectWallet 
          withWalletAggregator={true}
          text="Connect Wallet"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200 transform hover:scale-105 shadow-lg"
        >
          <Avatar className="h-6 w-6" />
          <Name />
        </ConnectWallet>
        
        <WalletDropdown>
          <Identity 
            className="px-4 pt-3 pb-2"
            hasCopyAddressOnClick={true}
          >
            <Avatar />
            <Name />
            <Address />
            <EthBalance />
          </Identity>
          
          <WalletDropdownLink 
            icon="wallet" 
            href="https://wallet.coinbase.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Go to Wallet Dashboard
          </WalletDropdownLink>
          
          <WalletDropdownLink 
            icon="wallet" 
            href="https://sepolia.basescan.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on BaseScan
          </WalletDropdownLink>
          
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}