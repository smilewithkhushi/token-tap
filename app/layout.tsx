import '@coinbase/onchainkit/styles.css';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Inter } from 'next/font/google';
import FooterComponent from '@/components/FooterComponent';

const inter = Inter({ subsets: ['latin'] });


export const metadata: Metadata = {
  title: 'Token Tap',
  description: 'Get tokens in your wallet for free - in just a click',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background dark">
        <Providers>
          {children}
          <FooterComponent />
        </Providers>

      </body>
    </html>
  );
}
