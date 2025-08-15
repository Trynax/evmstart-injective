import { http, createConfig } from 'wagmi'
import { defineChain } from 'viem'
import { metaMask, walletConnect } from 'wagmi/connectors'

// Injective EVM Testnet
export const injectiveEvmTestnet = defineChain({
  id: 1439,
  name: 'Injective EVM Testnet',
  nativeCurrency: { name: 'INJ', symbol: 'INJ', decimals: 18 },
  rpcUrls: { 
    default: { http: ['https://k8s.testnet.json-rpc.injective.network/'] },
    public: { http: ['https://k8s.testnet.json-rpc.injective.network/'] }
  },
  blockExplorers: {
    default: { name: 'Injective Testnet Explorer', url: 'https://testnet.blockscout.injective.network' },
  },
  testnet: true,
})

// Injective EVM Mainnet
export const injectiveEvmMainnet = defineChain({
  id: 1776,
  name: 'Injective EVM',
  nativeCurrency: { name: 'INJ', symbol: 'INJ', decimals: 18 },
  rpcUrls: { 
    default: { http: ['https://sentry.evm-rpc.injective.network/'] },
    public: { http: ['https://sentry.evm-rpc.injective.network/'] }
  },
  blockExplorers: {
    default: { name: 'Injective Explorer', url: 'https://blockscout.injective.network' },
  },
})

// Local Anvil for development
export const anvil = defineChain({
  id: 31337,
  name: 'Anvil',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { 
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] }
  },
  testnet: true,
})

export const CONTRACT_ADDRESSES = {
  "31337": {
    "Counter": "0x0000000000000000000000000000000000000000"
  },
  "1439": {
    "Counter": "0x0000000000000000000000000000000000000000"
  },
  "1776": {
    "Counter": "0x0000000000000000000000000000000000000000"
  }
} as const

export const config = createConfig({
  chains: [anvil, injectiveEvmTestnet, injectiveEvmMainnet],
  connectors: [
    metaMask(),
    walletConnect({ projectId: 'your-project-id' }),
  ],
  transports: { 
    [anvil.id]: http(),
    [injectiveEvmTestnet.id]: http(),
    [injectiveEvmMainnet.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
