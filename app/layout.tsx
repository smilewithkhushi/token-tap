import '@coinbase/onchainkit/styles.css';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { UI_CONFIG } from '@/lib/constants';
import { Inter } from 'next/font/google';
import FooterComponent from '@/components/FooterComponent';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: UI_CONFIG.APP_NAME,
  description: UI_CONFIG.APP_DESCRIPTION,
  keywords: ['Base', 'Faucet', 'Testnet', 'Tokens', 'Web3'],
  authors: [{ name: 'Your Name' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background dark">
        <Providers>{children}

          <FooterComponent />
        </Providers>

      </body>
    </html>
  );
}
