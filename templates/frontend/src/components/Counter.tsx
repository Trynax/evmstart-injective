import { useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { useContract } from '../hooks/useContract'
import { CONTRACT_ADDRESSES } from '../wagmi'

export function Counter() {
  const { isConnected, chain } = useAccount()
  const chainId = useChainId()
  const { count, isCountLoading, increment, setNumber, isWritePending, isConfirming, isSuccess, writeError } = useContract()
  const [customValue, setCustomValue] = useState('')

  const contractAddress = CONTRACT_ADDRESSES[chainId.toString() as keyof typeof CONTRACT_ADDRESSES]?.Counter

  if (!isConnected) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔌</span>
        </div>
        <p className="text-slate-400">Connect your wallet to get started</p>
      </div>
    )
  }

  if (!contractAddress) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-red-400 font-medium mb-2">Contract not deployed</p>
        <p className="text-slate-400 text-sm">Deploy with: <code className="bg-slate-800 px-2 py-1 rounded">make deploy-testnet</code></p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
      {/* Counter Display */}
      <div className="text-center mb-8">
        <div className="text-6xl font-bold text-white mb-2">
          {isCountLoading ? (
            <div className="animate-pulse text-slate-500">...</div>
          ) : (
            count?.toString() ?? '0'
          )}
        </div>
        <p className="text-slate-400">Current Count</p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={increment}
          disabled={isWritePending || isConfirming}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center"
        >
          {isWritePending || isConfirming ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {isWritePending ? 'Confirming...' : 'Mining...'}
            </>
          ) : (
            'Increment'
          )}
        </button>

        {/* Custom Value Input */}
        <div className="flex space-x-3">
          <input
            type="number"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Set custom value..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={() => {
              if (customValue) {
                setNumber(BigInt(customValue))
                setCustomValue('')
              }
            }}
            disabled={!customValue || isWritePending || isConfirming}
            className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
          >
            Set
          </button>
        </div>

        <button
          onClick={() => setNumber(BigInt(0))}
          disabled={isWritePending || isConfirming}
          className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
        >
          Reset
        </button>
      </div>

      {/* Status Messages */}
      {isSuccess && (
        <div className="mt-4 bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-400 text-sm text-center">
          ✅ Transaction successful!
        </div>
      )}
      
      {writeError && (
        <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm text-center">
          ❌ {writeError.message}
        </div>
      )}
    </div>
  )
}
