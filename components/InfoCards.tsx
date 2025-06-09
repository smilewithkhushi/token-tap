import React from 'react'

const InfoCards = () => {
  return (
    <div className='my-12'>{/* Base Ecosystem Info */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 max-w-2xl mx-auto border border-blue-700/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2">
              🏗️ Built for Base Ecosystem
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-800/30 rounded-lg p-3 border border-blue-600/30">
                <div className="text-blue-200">Claim Amount</div>
                <div className="text-white font-bold text-lg">100 FAUCET</div>
                <div className="text-blue-300 text-xs">Per Transaction</div>
              </div>
              <div className="bg-purple-800/30 rounded-lg p-3 border border-purple-600/30">
                <div className="text-purple-200">Cooldown Period</div>
                <div className="text-white font-bold text-lg">24 Hours</div>
                <div className="text-purple-300 text-xs">Between Claims</div>
              </div>
              <div className="bg-green-800/30 rounded-lg p-3 border border-green-600/30">
                <div className="text-green-200">Max Supply</div>
                <div className="text-white font-bold text-lg">1M FAUCET</div>
                <div className="text-green-300 text-xs">Total Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-8 text-center">
          <div className="bg-gray-800/30 border border-gray-600 rounded-xl p-6 max-w-2xl mx-auto backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">How Token Tap Works</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</div>
                <span>Connect your wallet using Coinbase's Minikit integration</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">2</div>
                <span>Ensure you're on Base Sepolia testnet (auto-switched)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">3</div>
                <span>Claim 100 FAUCET tokens every 24 hours for free</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center font-bold">4</div>
                <span>Use tokens for testing your Base DApps</span>
              </div>
            </div>
          </div>
        </div>
        </div>
  )
}

export default InfoCards