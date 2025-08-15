import { useState } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { anvil, injectiveEvmTestnet, injectiveEvmMainnet } from '../wagmi'

export function NetworkSwitcher() {
  const { chain, isConnected } = useAccount()
  const { switchChain } = useSwitchChain()
  const [isOpen, setIsOpen] = useState(false)

  const networks = [
    { config: anvil, label: 'Local', icon: '🔧' },
    { config: injectiveEvmTestnet, label: 'Testnet', icon: '🧪' },
    { config: injectiveEvmMainnet, label: 'Mainnet', icon: '🌐' },
  ]

  if (!isConnected) {
    return null
  }

  const currentNetwork = networks.find(n => n.config.id === chain?.id)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white transition-colors"
      >
        <span>{currentNetwork?.icon || '🔗'}</span>
        <span>{currentNetwork?.label || chain?.name || 'Unknown'}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-20">
            {networks.map((network) => {
              const isActive = chain?.id === network.config.id
              
              return (
                <button
                  key={network.config.id}
                  onClick={() => {
                    if (!isActive) {
                      switchChain({ chainId: network.config.id })
                    }
                    setIsOpen(false)
                  }}
                  disabled={isActive}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    isActive 
                      ? 'bg-purple-500/20 text-purple-300 cursor-default' 
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span>{network.icon}</span>
                      <span>{network.label}</span>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
