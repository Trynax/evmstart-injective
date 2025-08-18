import { useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { useContract } from '../hooks/useContract'
import { CONTRACT_ADDRESSES } from '../wagmi'
import { WalletConnect } from './WalletConnect'
import { NetworkSwitcher } from './NetworkSwitcher'
import metamaskLogo from '../assets/metamaskLogo.svg'
import braveLogo from '../assets/braveLogo.svg'
import leapLogo from '../assets/leapLogo.svg'
import keplrLogo from '../assets/keplrLogo.png'
import walletLogo from '../assets/walletLogo.svg'

export function Counter() {
  const { isConnected, chain } = useAccount()
  const chainId = useChainId()
  const { count, isCountLoading, increment, setNumber, isWritePending, isConfirming, isSuccess, writeError } = useContract()
  const [customValue, setCustomValue] = useState('')

  const contractAddress = CONTRACT_ADDRESSES[chainId.toString() as keyof typeof CONTRACT_ADDRESSES]?.Counter

  if (!isConnected) {
    return (
      <div className="w-full max-w-lg mx-auto">

        <div className="bg-transparent border border-[#2A3441] rounded-2xl p-8 relative ">
       
          <div className="flex justify-start mb-8">
            <NetworkSwitcher />
          </div>
          
 
          <div className="text-center space-y-8">
       
            <div className="flex justify-center items-center space-x-8 my-8">
      
              <div className="absolute bottom-4 left-8">
                <img src={metamaskLogo} alt="MetaMask" className="w-8 h-8" />
              </div>
   
              <div className="absolute bottom-4 right-8">
                <img src={braveLogo} alt="Brave" className="w-8 h-8" />
              </div>
              
             
              <div className="absolute top-4 right-16">
                <img src={leapLogo} alt="Leap" className="w-8 h-8" />
              </div>
    
              <div className="absolute ">
                <img src={keplrLogo} alt="Keplr" className="w-8 h-8" />
              </div>
        
              <div className="absolute top-4 left-16">
                <img src={walletLogo} alt="WalletConnect" className="w-8 h-8" />
              </div>
            </div>
   
            <div className="space-y-4">
              <h3 className="text-white text-xl font-medium">Connect wallet to get started</h3>
              <WalletConnect />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!contractAddress) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-red-400 font-medium mb-2">Contract not deployed</p>
        <p className="text-slate-400 text-sm">Deploy with: <code className="bg-slate-800 px-2 py-1 rounded">make deploy-testnet</code></p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">

      <div className="text-center mb-8">
        <div className="text-6xl font-bold text-white mb-2">
          {isCountLoading ? (
            <div className="animate-pulse text-slate-500">...</div>
          ) : (
            count?.toString() ?? '0'
          )}
        </div>
        <p className="text-slate-400">Current Count</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={increment}
          disabled={isWritePending || isConfirming}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center"
        >
          {isWritePending || isConfirming ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {isWritePending ? 'Confirming...' : 'Mining...'}
            </>
          ) : (
            'Increment'
          )}
        </button>

 
        <div className="flex space-x-3">
          <input
            type="number"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Set custom value..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={() => {
              if (customValue) {
                setNumber(BigInt(customValue))
                setCustomValue('')
              }
            }}
            disabled={!customValue || isWritePending || isConfirming}
            className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
          >
            Set
          </button>
        </div>

        <button
          onClick={() => setNumber(BigInt(0))}
          disabled={isWritePending || isConfirming}
          className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
        >
          Reset
        </button>
      </div>


      {isSuccess && (
        <div className="mt-4 bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-400 text-sm text-center">
          ✅ Transaction successful!
        </div>
      )}
      
      {writeError && (
        <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm text-center">
          ❌ {writeError.message}
        </div>
      )}
    </div>
  )
}
