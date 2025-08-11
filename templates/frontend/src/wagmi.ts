import { http, createConfig } from 'wagmi'
import { defineChain } from 'viem'
import { metaMask, walletConnect } from 'wagmi/connectors'

// Minimal Injective EVM chain placeholder (adjust RPC as needed)
export const injectiveEvm = defineChain({
  id: 2525,
  name: 'Injective EVM',
  nativeCurrency: { name: 'INJ', symbol: 'INJ', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.example.injective-evm'] } },
})

export const CONTRACT_ADDRESSES = {
  Counter: '0x0000000000000000000000000000000000000000',
} as const

export const config = createConfig({
  chains: [injectiveEvm],
  connectors: [
    metaMask(),
    walletConnect({ projectId: 'your-project-id' }),
  ],
  transports: { [injectiveEvm.id]: http() },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
