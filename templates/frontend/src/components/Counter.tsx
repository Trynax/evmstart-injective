import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useContract } from '../hooks/useContract'

export function Counter() {
  const { isConnected } = useAccount()
  const { count, isCountLoading, increment, setNumber, isWritePending, isConfirming, isSuccess, writeError } = useContract()
  const [customValue, setCustomValue] = useState('')

  const onSet = () => {
    const value = BigInt(customValue || '0')
    setNumber(value)
    setCustomValue('')
  }

  if (!isConnected) {
    return <div className="border rounded p-6 text-center text-gray-600">Connect your wallet to interact</div>
  }

  return (
    <div className="border rounded p-6 space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Counter</h2>
        {isCountLoading ? (
          <p className="text-gray-600">Loading...</p>
        ) : (
          <div className="text-3xl font-bold text-blue-600">{count?.toString() ?? '0'}</div>
        )}
      </div>

      <div className="flex gap-2 justify-center">
        <button onClick={increment} disabled={isWritePending || isConfirming} className="px-4 py-2 bg-green-500 text-white rounded">+1</button>
      </div>

      <div className="flex gap-2 justify-center">
        <input type="number" value={customValue} onChange={(e) => setCustomValue(e.target.value)} className="px-3 py-2 border rounded" placeholder="Set value" />
        <button onClick={onSet} disabled={isWritePending || isConfirming || !customValue} className="px-4 py-2 bg-blue-500 text-white rounded">Set</button>
      </div>

      {isConfirming && <p className="text-center text-yellow-600 text-sm">Confirming...</p>}
      {isSuccess && <p className="text-center text-green-600 text-sm">Confirmed!</p>}
      {writeError && <p className="text-center text-red-600 text-sm">{writeError.message}</p>}
    </div>
  )
}
