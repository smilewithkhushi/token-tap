"use client";
import React from 'react'
import { Badge } from '@/components/ui/badge';
import { Coins, Zap, Shield, Globe } from 'lucide-react';


const HeroSection = () => {
  return (
    <div className="my-12 text-center space-y-6">
      <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
        <Coins className="h-5 w-5 text-blue-200" />
        <span className="text-white/90 text-sm font-medium">Base Sepolia Testnet</span>
        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
          Live
        </Badge>
      </div>

      <div className="space-y-4">
        <h1 className="text-5xl font-bold text-white mb-4">
         Token Tap
        </h1>
        <p className="text-white/80 text-xl max-w-2xl mx-auto leading-relaxed">
         Just Click and Get free testnet tokens instantly on Base Sepolia. Perfect for developers building and testing DApps.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Zap className="h-5 w-5 text-yellow-300" />
            <span className="text-white font-semibold">Instant Claims</span>
          </div>
          <p className="text-white/70 text-sm">Get tokens in seconds</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Shield className="h-5 w-5 text-green-300" />
            <span className="text-white font-semibold">Secure & Safe</span>
          </div>
          <p className="text-white/70 text-sm">OpenZeppelin standards</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Globe className="h-5 w-5 text-blue-300" />
            <span className="text-white font-semibold">Base Network</span>
          </div>
          <p className="text-white/70 text-sm">Built on Base Sepolia</p>
        </div>
      </div>
    </div>

  )
}

export default HeroSection