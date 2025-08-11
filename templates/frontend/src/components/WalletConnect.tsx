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
      <div className="border rounded-lg p-4 bg-green-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Connected Wallet</p>
            <p className="font-mono text-sm">{address}</p>
            {balance && (
              <p className="text-sm text-gray-600">Balance: {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}</p>
            )}
          </div>
          <button onClick={() => disconnect()} className="px-4 py-2 bg-red-500 text-white rounded">Disconnect</button>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="text-center">
        {!showConnectors ? (
          <button onClick={() => setShowConnectors(true)} className="px-6 py-3 bg-blue-500 text-white rounded-lg">Connect Wallet</button>
        ) : (
          <div className="space-y-2">
            {connectors.map((connector) => (
              <button key={connector.uid} onClick={() => connect({ connector })} disabled={isPending} className="w-full px-4 py-2 border rounded">
                {connector.name}
                {isPending && ' (connecting...)'}
              </button>
            ))}
            <button onClick={() => setShowConnectors(false)} className="w-full px-4 py-2 text-gray-500">Cancel</button>
          </div>
        )}
      </div>
    </div>
  )
}
