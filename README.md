# evmstart-injective

🚀 **Kickstart your Injective EVM dApp with one command** - Complete full-stack boilerplate with Foundry smart contracts and React frontend.

## ✨ Features

- **One-Command Setup**: Create a complete dApp project instantly
- **Smart Contract Framework**: Pre-configured Foundry with Counter contract example
- **Modern React Frontend**: Vite + TypeScript + TailwindCSS + wagmi/viem
- **Automatic Deployment**: Deploys contracts to local Anvil chain and updates frontend config
- **Multi-Network Support**: Configured for Anvil, Injective EVM Testnet, and Mainnet
- **MetaMask Integration**: Ready-to-use wallet connection with network switching
- **Debugging Tools**: Built-in debugging components and error handling

## 🚀 Quick Start

```bash
npx evmstart-injective my-dapp
```
This  command will:

1. 📁 Create your project structure
2. ⛓️ Start Anvil local blockchain
3. 🚀 Deploy Counter contract automatically  
4. 🔗 Update frontend with deployed contract address
5. 📋 Show you the next steps

## 📦 What You Get

### Smart Contracts (`/contracts`)
- **Foundry framework** with forge, cast, and anvil
- **Counter.sol** - Example contract with increment/decrement functions
- **Counter.s.sol** - Deployment script
- **Counter.t.sol** - Test suite
- **forge-std** library included

### Frontend (`/frontend`)
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **wagmi + viem** for Web3 integration
- **MetaMask** wallet connection
- **Network switcher** component
- **Contract interaction** hooks and components

## 🎯 How It Works

### 1. Project Creation
- Copies templates from the package
- Creates proper directory structure
- Initializes both contracts and frontend

### 2. Automatic Deployment
- Starts Anvil local blockchain on port 8545
- Deploys Counter contract using Foundry's forge
- Uses default Anvil private key for deployment
- Waits for transaction confirmation

### 3. Frontend Configuration
- Reads deployment broadcast data
- Automatically updates `wagmi.ts` with deployed contract address
- Configures networks (Anvil, Injective EVM Testnet/Mainnet)

### 4. Ready to Use
- Frontend is pre-configured to interact with deployed contract
- Includes debugging components showing contract state
- Error handling and transaction status display

## 🌐 Networks Configured

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| Anvil (Local) | 31337 | http://127.0.0.1:8545 |
| Injective EVM Testnet | 1439 | https://k8s.testnet.json-rpc.injective.network/ |
| Injective EVM Mainnet | 1776 | https://sentry.evm-rpc.injective.network/ |

## 🔧 Next Steps

After running the command:

### Start Frontend Development
```bash
cd my-dapp/frontend
npm install
npm run dev
```
Visit: http://localhost:5173

### Test Smart Contracts
```bash
cd my-dapp/contracts
forge test
```

### Deploy to Testnet/Mainnet
```bash
cd my-dapp/contracts
# Deploy to Injective EVM Testnet
forge script script/Counter.s.sol --rpc-url https://k8s.testnet.json-rpc.injective.network/ --broadcast --private-key YOUR_PRIVATE_KEY

# Deploy to Injective EVM Mainnet  
forge script script/Counter.s.sol --rpc-url https://sentry.evm-rpc.injective.network/ --broadcast --private-key YOUR_PRIVATE_KEY
```

## 🛠️ Requirements

- **Node.js** 18+ 
- **Foundry** - Install from [getfoundry.sh](https://getfoundry.sh)

## 📁 Project Structure

```
my-dapp/
├── contracts/                 # Foundry smart contracts
│   ├── src/Counter.sol       # Example contract
│   ├── script/Counter.s.sol  # Deployment script
│   ├── test/Counter.t.sol    # Contract tests
│   └── foundry.toml          # Foundry config
└── frontend/                 # React frontend
    ├── src/
    │   ├── components/       # React components
    │   ├── hooks/           # Custom hooks
    │   ├── abi/             # Contract ABIs
    │   └── wagmi.ts         # Web3 configuration
    └── package.json
```


## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
