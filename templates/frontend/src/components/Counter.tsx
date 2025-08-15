import { useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { useContract } from '../hooks/useContract'
import { CONTRACT_ADDRESSES } from '../wagmi'

export function Counter() {
  const { isConnected, chain } = useAccount()
  const chainId = useChainId()
  const { count, isCountLoading, increment, setNumber, isWritePending, isConfirming, isSuccess, writeError, readError } = useContract()
  const [customValue, setCustomValue] = useState('')

  const contractAddress = CONTRACT_ADDRESSES[chainId.toString() as keyof typeof CONTRACT_ADDRESSES]?.Counter

  const onSet = () => {
    const value = BigInt(customValue || '0')
    setNumber(value)
    setCustomValue('')
  }

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔌</span>
        </div>
        <p className="text-slate-400">Connect your wallet to interact with the smart contract</p>
      </div>
    )
  }

  if (!contractAddress) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-red-400">Contract not deployed on {chain?.name}</p>
        <p className="text-slate-400 text-sm mt-2">Deploy with: <code className="bg-slate-700 px-2 py-1 rounded">make deploy-testnet</code></p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Contract Status */}
      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-white">Contract Status</h4>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-400">Connected</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Network:</span>
            <p className="text-white font-mono">{chain?.name}</p>
          </div>
          <div>
            <span className="text-slate-400">Contract:</span>
            <p className="text-white font-mono text-xs">{contractAddress}</p>
          </div>
        </div>
      </div>

      {/* Counter Display */}
      <div className="text-center py-8">
        <div className="text-6xl font-bold text-white mb-2">
          {isCountLoading ? (
            <div className="animate-pulse">...</div>
          ) : (
            count?.toString() ?? '0'
          )}
        </div>
        <p className="text-slate-400">Current Count</p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={increment}
          disabled={isWritePending || isConfirming}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
        >
          {isWritePending || isConfirming ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isWritePending ? 'Confirming...' : 'Mining...'}
            </>
          ) : (
            <>
              <span className="mr-2">+</span>
              Increment
            </>
          )}
        </button>
        
        <button
          onClick={() => setNumber(BigInt(0))}
          disabled={isWritePending || isConfirming}
          className="bg-slate-600 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
        >
          Reset
        </button>
      </div>

      {/* Custom Value Input */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300">Set Custom Value</label>
        <div className="flex space-x-3">
          <input
            type="number"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Enter a number..."
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={onSet}
            disabled={!customValue || isWritePending || isConfirming}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-all duration-200"
          >
            Set
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {isSuccess && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-400 text-sm">
          ✅ Transaction successful!
        </div>
      )}
      
      {writeError && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
          ❌ Transaction failed: {writeError.message}
        </div>
      )}

      {readError && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 text-yellow-400 text-sm">
          ⚠️ Read error: {readError.message}
        </div>
      )}
    </div>
  )
}
