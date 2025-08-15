# 🚀 evmstart-injective

**The fastest way to build on Injective EVM** - Production-ready dApp scaffolding with smart contracts and frontend in one command.

## ✨ What You Get

### 🏗️ **Complete Development Stack**
- **Smart Contracts**: Pre-configured Foundry framework with example Counter contract
- **Modern Frontend**: React + Vite + TypeScript + TailwindCSS  + wagmi 
- **Auto-Deployment**: One-command deployment to local Anvil with frontend integration
- **Multi-Network Ready**: Anvil (local), Injective EVM Testnet, and Mainnet configs

### ⚡ **Developer Experience**
- **Zero Configuration**: Works out of the box with sensible defaults
- **Live Contract Updates**: Automatic ABI generation and address updates
- **Secure Wallet**: use keystore creation and management


## 🚀 Quick Start

```bash
npx evmstart-injective my-dapp
```

**What happens next:**
1. 📁 **Project Structure** - Creates organized folders for contracts and frontend
2. ⛓️  **Local Blockchain** - Starts Anvil (Ethereum local testnet) on port 8545
3. 🚀 **Smart Contract** - Deploys Counter.sol automatically with forge
4. 🔗 **Frontend Config** - Updates React app with deployed contract address
5. ✅ **Ready to Code** - Everything connected and working

## 📦 Project Structure

```
my-dapp/
├── contracts/                 # 🔧 Smart Contracts (Foundry)
│   ├── src/
│   │   └── Counter.sol       # Example contract with increment/decrement
│   ├── script/
│   │   └── Counter.s.sol     # Deployment script  
│   ├── test/
│   │   └── Counter.t.sol     # Comprehensive test suite
│   ├── foundry.toml          # Foundry configuration
│   └── Makefile              # Deployment commands
└── frontend/                 # ⚛️ React Frontend
    ├── src/
    │   ├── components/       # Counter UI, Wallet connection, Network switcher
    │   ├── hooks/           # Contract interaction hooks
    │   ├── abi/             # Auto-generated contract ABIs
    │   └── wagmi.ts         # Web3 configuration (chains, contracts)
    ├── scripts/
    │   └── update-contracts.js # Auto-updates ABIs and addresses
    └── package.json
```

## 🎯 How It Works

### 🔄 **Automatic Contract Integration**
1. **Deploy** → Foundry deploys contracts and saves deployment data
2. **Extract** → Script reads deployment addresses from broadcast files  
3. **Update** → Frontend `wagmi.ts` auto-updates with new contract addresses
4. **Generate** → ABIs extracted to `src/abi/` for type-safe contract calls

### 🛠️ **Development Workflow**
```bash
# Make contract changes
cd contracts && forge test

# Deploy to local/testnet  
make deploy-local
# or
make deploy-testnet WALLET=my-wallet

# Frontend auto-updates
cd ../frontend && npm run dev
```

### 🔒 **Security First**
- **Keystores**: Secure encrypted wallet storage (no plain private keys)
- **Environment Variables**: Network configs and sensitive data in `.env`
- **Multi-Network**: Separate configs for local, testnet, and mainnet

## 🌐 Supported Networks

| Network | Chain ID | RPC URL | Purpose |
|---------|----------|---------|---------|
| **Anvil (Local)** | 31337 | http://127.0.0.1:8545 | Development & Testing |
| **Injective EVM Testnet** | 1439 | https://k8s.testnet.json-rpc.injective.network/ | Testing with real network conditions |
| **Injective EVM Mainnet** | 1776 | https://sentry.evm-rpc.injective.network/ | Production deployments |

## 🔧 Getting Started

### 1. **Start Development**
```bash
cd my-dapp/frontend
npm install
npm run dev
# → http://localhost:5173
```

### 2. **Test Smart Contracts**
```bash
cd my-dapp/contracts
forge test -vvv
# Run specific test
forge test --match-test testIncrement
```

### 3. **Deploy to Networks**

#### 🏠 Local (Anvil) - Already done!
```bash
make deploy-local
```

#### 🧪 Testnet - For testing
```bash
# Create secure wallet
make setup-wallet
# Enter wallet name: testnet-wallet

# Deploy
make deploy-testnet WALLET=testnet-wallet
```

#### 🌍 Mainnet - Production ready
```bash
# Create secure wallet  
make setup-wallet
# Enter wallet name: mainnet-wallet

# Deploy (with confirmation)
make deploy-mainnet WALLET=mainnet-wallet
```

### 4. **Update Frontend After Deployment**
```bash
cd frontend
npm run update-contracts
# Automatically updates ABIs and contract addresses
```

## � Adding Your Own Contracts

The starter includes a complete **Counter** example, but you can easily add your own contracts. See our **[Custom Contracts Guide](CUSTOM_CONTRACTS.md)** for:

- ✅ **Step-by-step** contract creation 
- ✅ **Deployment scripts** and testing
- ✅ **Frontend integration** with React hooks
- ✅ **Multi-contract** project setup
- ✅ **Best practices** and common patterns

### Quick Example - Adding a Token Contract:

```solidity
// contracts/src/MyToken.sol
pragma solidity ^0.8.13;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 1000000 * 10**decimals());
    }
}
```

Then run `npm run update-contracts` to auto-generate TypeScript bindings!

## 🛠️ Requirements & Installation

### Prerequisites
- **Node.js** 18+ (recommended: 20+)
- **Foundry** - Install: `curl -L https://foundry.paradigm.xyz | bash && foundryup`

### Installation Methods

#### NPX (Recommended)
```bash
npx evmstart-injective my-dapp
```

#### Global Install
```bash
npm install -g evmstart-injective
evmstart-injective my-dapp
```

#### From Source
```bash
git clone https://github.com/Trynax/evmstart-injective
cd evmstart-injective
npm install && npm run build
npm link
evmstart-injective my-dapp
```


## � Troubleshooting

### Common Issues

**❌ "anvil: command not found"**
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

**❌ "Contract not found" in frontend**
```bash
# Re-deploy and update frontend
cd contracts && make deploy-local
cd ../frontend && npm run update-contracts
```

**❌ MetaMask network issues**
- Ensure you're on the correct network (check chain ID)
- Reset MetaMask account if transactions are stuck

**❌ Transaction failures**
- Check wallet has enough gas tokens (ETH for Anvil, INJ for Injective)
- Verify contract is deployed on the current network

### Debug Mode
```bash
# Verbose contract testing
forge test -vvv

# Check deployment addresses
cat contracts/broadcast/Counter.s.sol/31337/run-latest.json
```

## 🤝 Contributing

We welcome contributions! 

### Development Setup
```bash
git clone https://github.com/Trynax/evmstart-injective
cd evmstart-injective
npm install
npm run dev my-test-dapp  # Test the CLI
```

### Submit Issues
- 🐛 **Bug reports**: Include OS, Node version, error logs
- 💡 **Feature requests**: Describe use case and expected behavior
- 📖 **Documentation**: Help improve our guides and examples

## �� License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the Injective EVM ecosystem**

Start building the future of finance → `npx evmstart-injective my-dapp`
