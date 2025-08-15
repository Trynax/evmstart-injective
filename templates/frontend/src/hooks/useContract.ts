import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../wagmi'
import { contractAbi } from '../abi/Contract'
import { useEffect } from 'react'

export function useContract() {
  const chainId = useChainId()
  const contractAddress = CONTRACT_ADDRESSES[chainId.toString() as keyof typeof CONTRACT_ADDRESSES]?.Counter as `0x${string}` | undefined

  const { 
    data: count, 
    isLoading: isCountLoading, 
    error: readError,
    refetch 
  } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'number',
  })

  const { writeContract, isPending: isWritePending, data: hash, error: writeError } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Refetch count after successful transaction
  useEffect(() => {
    if (isSuccess) {
      refetch()
    }
  }, [isSuccess, refetch])

  // Log errors for debugging
  useEffect(() => {
    if (readError) {
      console.error('Contract read error:', readError)
    }
  }, [readError])

  const increment = () => {
    if (!contractAddress) return
    writeContract({ address: contractAddress, abi: contractAbi, functionName: 'increment' })
  }
  const setNumber = (value: bigint) => {
    if (!contractAddress) return
    writeContract({ address: contractAddress, abi: contractAbi, functionName: 'setNumber', args: [value] })
  }

  return { 
    count, 
    isCountLoading, 
    increment, 
    setNumber, 
    isWritePending, 
    isConfirming, 
    isSuccess, 
    writeError, 
    readError,
    hash, 
    refetch 
  }
}
