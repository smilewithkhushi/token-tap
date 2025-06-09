
"use client"

import React from 'react'

const FooterComponent = () => {
  return (

    <footer className="glass border-t border-white/20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <p className="text-white/80 text-sm">
              Built with ❤️ by @smilewithkhushi
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-white/60">
            <a
              href="https://docs.base.org"
              target="_blank"
              className="hover:text-white/80 transition-colors"
            >
              Base Docs
            </a>
            <span>•</span>
            <a
              href="https://sepolia.basescan.org"
              target="_blank"
              className="hover:text-white/80 transition-colors"
            >
              BaseScan
            </a>
            <span>•</span>
            <a
              href="https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet"
              target="_blank"
              className="hover:text-white/80 transition-colors"
            >
              Get ETH
            </a>
          </div>
        </div>
      </div>
    </footer>

  )
}

export default FooterComponent;