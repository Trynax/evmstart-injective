import { useAccount, useSwitchChain } from 'wagmi'
import { anvil, injectiveEvmTestnet, injectiveEvmMainnet } from '../wagmi'

export function NetworkSwitcher() {
  const { chain, isConnected } = useAccount()
  const { switchChain } = useSwitchChain()

  const addToMetaMask = async (network: any) => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${network.id.toString(16)}`,
              chainName: network.name,
              rpcUrls: [network.rpcUrls.default.http[0]],
              nativeCurrency: network.nativeCurrency,
              blockExplorerUrls: network.blockExplorers?.default?.url ? [network.blockExplorers.default.url] : undefined,
            },
          ],
        })
      } catch (error) {
        console.error('Failed to add network:', error)
      }
    }
  }

  const networks = [
    { 
      config: anvil, 
      label: 'Anvil (Local)',
      description: 'Local development',
      status: 'development'
    },
    { 
      config: injectiveEvmTestnet, 
      label: 'Injective EVM Testnet',
      description: 'For testing',
      status: 'testnet'
    },
    { 
      config: injectiveEvmMainnet, 
      label: 'Injective EVM Mainnet',
      description: 'Production network',
      status: 'mainnet'
    },
  ]

  if (!isConnected) {
    return (
      <div className="text-center py-4">
        <p className="text-slate-400 text-sm">Connect wallet to see network options</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Current Network */}
      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Current Network</p>
            <p className="text-white font-medium">{chain?.name}</p>
          </div>
          <div className={`w-3 h-3 rounded-full ${
            chain?.id === anvil.id ? 'bg-blue-500' :
            chain?.id === injectiveEvmTestnet.id ? 'bg-yellow-500' :
            chain?.id === injectiveEvmMainnet.id ? 'bg-green-500' :
            'bg-gray-500'
          }`}></div>
        </div>
      </div>

      {/* Network Options */}
      <div className="space-y-2">
        {networks.map((network) => {
          const isActive = chain?.id === network.config.id
          const statusColors = {
            development: 'border-blue-500/50 bg-blue-500/10',
            testnet: 'border-yellow-500/50 bg-yellow-500/10',
            mainnet: 'border-green-500/50 bg-green-500/10'
          }
          
          return (
            <button
              key={network.config.id}
              onClick={() => {
                if (!isActive) {
                  switchChain({ chainId: network.config.id })
                }
              }}
              disabled={isActive}
              className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                isActive 
                  ? `${statusColors[network.status as keyof typeof statusColors]} cursor-not-allowed` 
                  : 'border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-white">{network.label}</span>
                    {isActive && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{network.description}</p>
                  <p className="text-xs text-slate-500 mt-1">Chain ID: {network.config.id}</p>
                </div>
                <div className="ml-4">
                  {!isActive && (
                    <div className="text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Add to MetaMask Helper */}
      <div className="text-center pt-2">
        <button
          onClick={() => addToMetaMask(chain)}
          className="text-sm text-slate-400 hover:text-slate-300 underline"
        >
          Add current network to MetaMask
        </button>
      </div>
    </div>
  )
}
