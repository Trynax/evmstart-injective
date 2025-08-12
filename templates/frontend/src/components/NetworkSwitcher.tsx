import { useAccount, useSwitchChain } from 'wagmi'
import { anvil, injectiveEvmTestnet, injectiveEvmMainnet } from '../wagmi'

export function NetworkSwitcher() {
  const { chain } = useAccount()
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
    { config: anvil, label: 'Anvil (Local)' },
    { config: injectiveEvmTestnet, label: 'Injective Testnet' },
    { config: injectiveEvmMainnet, label: 'Injective Mainnet' },
  ]

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">Networks</h3>
      <div className="space-y-2">
        {networks.map(({ config, label }) => (
          <div key={config.id} className="flex items-center justify-between">
            <span className={`text-sm ${chain?.id === config.id ? 'font-bold text-green-600' : ''}`}>
              {label} {chain?.id === config.id && '(Active)'}
            </span>
            <div className="space-x-2">
              <button
                onClick={() => switchChain({ chainId: config.id })}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={chain?.id === config.id}
              >
                Switch
              </button>
              <button
                onClick={() => addToMetaMask(config)}
                className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Add to MetaMask
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {chain && (
        <div className="mt-3 text-xs text-gray-600">
          Current: {chain.name} (ID: {chain.id})
        </div>
      )}
    </div>
  )
}
