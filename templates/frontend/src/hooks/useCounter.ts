import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../wagmi'
import { counterAbi } from '../abi/Counter'

export function useCounter() {
  const { data: count, isLoading: isCountLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.Counter,
    abi: counterAbi,
    functionName: 'number',
  })

  const { writeContract, isPending: isWritePending, data: hash, error: writeError } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const increment = () => writeContract({ address: CONTRACT_ADDRESSES.Counter, abi: counterAbi, functionName: 'increment' })
  const setNumber = (value: bigint) => writeContract({ address: CONTRACT_ADDRESSES.Counter, abi: counterAbi, functionName: 'setNumber', args: [value] })

  return { count, isCountLoading, increment, setNumber, isWritePending, isConfirming, isSuccess, writeError, hash, refetch }
}
