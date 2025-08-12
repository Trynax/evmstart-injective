import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../wagmi'
import { contractAbi } from '../abi/Contract'

export function useContract() {
  const { data: count, isLoading: isCountLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.Counter,
    abi: contractAbi,
    functionName: 'number',
  })

  const { writeContract, isPending: isWritePending, data: hash, error: writeError } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const increment = () => writeContract({ address: CONTRACT_ADDRESSES.Counter, abi: contractAbi, functionName: 'increment' })
  const setNumber = (value: bigint) => writeContract({ address: CONTRACT_ADDRESSES.Counter, abi: contractAbi, functionName: 'setNumber', args: [value] })

  return { count, isCountLoading, increment, setNumber, isWritePending, isConfirming, isSuccess, writeError, hash, refetch }
}
