import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { useState } from 'react'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [showConnectors, setShowConnectors] = useState(false)
  const { data: balance } = useBalance({ address })

  if (isConnected) {
    return (
      <div className="flex items-center space-x-3">
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-4 py-2">
          {balance && (
            <div className="text-green-300 text-sm font-medium">
              {parseFloat(balance.formatted).toFixed(2)} {balance.symbol}
            </div>
          )}
        </div>
        <button 
          onClick={() => disconnect()} 
          className="px-4 py-2 bg-gradient-to-r from-[#6C6C6C] to-[#FFFFFF00] text-white rounded-lg transition-colors text-sm hover:opacity-80"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setShowConnectors(true)} 
        className="px-6 py-2 text-white rounded-lg font-medium transition-colors bg-[#0F80D2] hover:scale-105"
      >
        Connect wallet
      </button>
      
      {showConnectors && (
        <>
   
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowConnectors(false)}
          />
          

          <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-20 p-4">
            <div className="space-y-3">
              <div className="text-white font-medium text-sm mb-3">Choose wallet</div>
              {connectors.map((connector) => (
                <button 
                  key={connector.uid} 
                  onClick={() => {
                    connect({ connector })
                    setShowConnectors(false)
                  }} 
                  disabled={isPending} 
                  className="w-full flex items-center space-x-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors disabled:opacity-50"
                >
                  <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                    {connector.name === 'MetaMask' && '🦊'}
                    {connector.name === 'WalletConnect' && '🔗'}
                    {connector.name === 'Coinbase Wallet' && '💙'}
                    {!['MetaMask', 'WalletConnect', 'Coinbase Wallet'].includes(connector.name) && '👛'}
                  </div>
                  <span className="text-white font-medium">{connector.name}</span>
                  {isPending && <span className="text-slate-400 text-sm">Connecting...</span>}
                </button>
              ))}
              <button 
                onClick={() => setShowConnectors(false)} 
                className="w-full p-2 text-slate-400 hover:text-white transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
