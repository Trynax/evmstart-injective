# 🔄 Building Custom Contracts

This guide shows you how to add your own smart contracts to the evmstart-injective starter. The project comes with a **Counter** example, but you can build anything from simple tokens to complex DeFi protocols.

## 🏗️ Project Architecture

### Smart Contract Flow
```
contracts/src/YourContract.sol  →  forge build  →  frontend/src/abi/YourContract.ts
       ↓                                                    ↓
contracts/script/Deploy.s.sol  →  forge script  →  frontend/src/wagmi.ts (addresses)
       ↓                                                    ↓
contracts/test/YourContract.t.sol  →  forge test  →  frontend/src/hooks/useYourContract.ts
```

### Auto-Integration System
1. **Contract Development** → Write Solidity contracts in `contracts/src/`
2. **Testing** → Create comprehensive tests in `contracts/test/`
3. **Deployment** → Use scripts in `contracts/script/` to deploy
4. **Frontend Sync** → Run `npm run update-contracts` to auto-generate:
   - TypeScript ABIs in `frontend/src/abi/`
   - Contract addresses in `frontend/src/wagmi.ts`
   - Type-safe React hooks

## 🚀 Quick Start: Add Your First Contract

### 1. Create Smart Contract
```solidity
// contracts/src/SimpleStorage.sol
pragma solidity ^0.8.13;

contract SimpleStorage {
    uint256 private _value;
    address public owner;
    
    event ValueChanged(uint256 indexed newValue, address indexed updatedBy);
    
    constructor() {
        owner = msg.sender;
    }
    
    function setValue(uint256 newValue) public {
        _value = newValue;
        emit ValueChanged(newValue, msg.sender);
    }
    
    function getValue() public view returns (uint256) {
        return _value;
    }
    
    function reset() public {
        require(msg.sender == owner, "Only owner can reset");
        _value = 0;
        emit ValueChanged(0, msg.sender);
    }
}
```

### 2. Create Deployment Script
```solidity
// contracts/script/SimpleStorage.s.sol
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {SimpleStorage} from "../src/SimpleStorage.sol";

contract SimpleStorageScript is Script {
    function run() public {
        vm.startBroadcast();
        
        SimpleStorage simpleStorage = new SimpleStorage();
        console.log("SimpleStorage deployed to:", address(simpleStorage));
        
        vm.stopBroadcast();
    }
}
```

### 3. Write Comprehensive Tests
```solidity
// contracts/test/SimpleStorage.t.sol
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {SimpleStorage} from "../src/SimpleStorage.sol";

contract SimpleStorageTest is Test {
    SimpleStorage public simpleStorage;
    address public owner;
    address public user;

    function setUp() public {
        owner = address(this);
        user = makeAddr("user");
        simpleStorage = new SimpleStorage();
    }

    function test_InitialValue() public view {
        assertEq(simpleStorage.getValue(), 0);
        assertEq(simpleStorage.owner(), owner);
    }

    function test_SetValue() public {
        uint256 newValue = 42;
        
        vm.expectEmit(true, true, false, true);
        emit SimpleStorage.ValueChanged(newValue, address(this));
        
        simpleStorage.setValue(newValue);
        assertEq(simpleStorage.getValue(), newValue);
    }

    function test_Reset() public {
        simpleStorage.setValue(100);
        simpleStorage.reset();
        assertEq(simpleStorage.getValue(), 0);
    }

    function test_ResetOnlyOwner() public {
        vm.prank(user);
        vm.expectRevert("Only owner can reset");
        simpleStorage.reset();
    }

    function testFuzz_SetValue(uint256 value) public {
        simpleStorage.setValue(value);
        assertEq(simpleStorage.getValue(), value);
    }
}
```

### 4. Test Your Contract

```bash
cd contracts

# Run all tests
forge test

# Run with verbose output
forge test -vvv

# Test specific contract
forge test --match-contract SimpleStorageTest

# Test with gas reporting
forge test --gas-report

# Watch mode (re-run tests on file changes)
forge test --watch
```

### 5. Deploy Your Contract

#### 🏠 Local Development (Anvil)
```bash
# Option 1: Use Makefile (add your contract)
make deploy-local

# Option 2: Direct forge command
forge script script/SimpleStorage.s.sol \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
```

#### 🧪 Injective EVM Testnet
```bash
# Create secure wallet (first time only)
make setup-wallet
# Enter wallet name: testnet-wallet

# Deploy to testnet
forge script script/SimpleStorage.s.sol \
  --rpc-url https://k8s.testnet.json-rpc.injective.network/ \
  --account testnet-wallet \
  --broadcast \
  --verify
```

#### 🌍 Injective EVM Mainnet
```bash
# Create secure wallet (first time only) 
make setup-wallet
# Enter wallet name: mainnet-wallet

# Deploy to mainnet (with confirmation)
forge script script/SimpleStorage.s.sol \
  --rpc-url https://sentry.evm-rpc.injective.network/ \
  --account mainnet-wallet \
  --broadcast \
  --verify
```

### 6. Update Frontend Integration

#### Auto-Update Contracts
```bash
cd frontend
npm run update-contracts
```

This automatically:
- ✅ Extracts ABIs from `contracts/out/`
- ✅ Updates contract addresses in `src/wagmi.ts`  
- ✅ Creates TypeScript ABI files in `src/abi/`

#### Create React Hook
```typescript
// frontend/src/hooks/useSimpleStorage.ts
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { simpleStorageAbi } from '../abi/SimpleStorage'
import { CONTRACT_ADDRESSES } from '../wagmi'
import { useEffect } from 'react'

export function useSimpleStorage() {
  const chainId = useChainId()
  const address = CONTRACT_ADDRESSES[chainId.toString() as keyof typeof CONTRACT_ADDRESSES]?.SimpleStorage as `0x${string}` | undefined

  // Read current value
  const { 
    data: value, 
    isLoading: isValueLoading, 
    refetch 
  } = useReadContract({
    address,
    abi: simpleStorageAbi,
    functionName: 'getValue',
  })

  // Read owner
  const { data: owner } = useReadContract({
    address,
    abi: simpleStorageAbi,
    functionName: 'owner',
  })

  // Write functions
  const { writeContract, isPending: isWritePending, data: hash, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Refetch value after successful transaction
  useEffect(() => {
    if (isSuccess) {
      refetch()
    }
  }, [isSuccess, refetch])

  const setValue = (newValue: bigint) => {
    if (!address) return
    writeContract({ 
      address, 
      abi: simpleStorageAbi, 
      functionName: 'setValue', 
      args: [newValue] 
    })
  }

  const reset = () => {
    if (!address) return
    writeContract({ 
      address, 
      abi: simpleStorageAbi, 
      functionName: 'reset' 
    })
  }

  return { 
    value, 
    owner,
    isValueLoading, 
    setValue, 
    reset,
    isWritePending, 
    isConfirming, 
    isSuccess, 
    writeError,
    contractAddress: address
  }
}
```

#### Create React Component
```tsx
// frontend/src/components/SimpleStorage.tsx
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useSimpleStorage } from '../hooks/useSimpleStorage'

export function SimpleStorage() {
  const { isConnected } = useAccount()
  const { 
    value, 
    owner, 
    isValueLoading, 
    setValue, 
    reset, 
    isWritePending, 
    isConfirming, 
    writeError,
    contractAddress 
  } = useSimpleStorage()
  
  const [inputValue, setInputValue] = useState('')

  if (!isConnected) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔌</span>
        </div>
        <p className="text-slate-400">Connect your wallet to interact with SimpleStorage</p>
      </div>
    )
  }

  if (!contractAddress) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-red-400 font-medium mb-2">SimpleStorage not deployed</p>
        <p className="text-slate-400 text-sm">
          Deploy with: <code className="bg-slate-800 px-2 py-1 rounded">forge script script/SimpleStorage.s.sol --broadcast</code>
        </p>
      </div>
    )
  }

  const handleSetValue = () => {
    const numValue = BigInt(inputValue || '0')
    setValue(numValue)
    setInputValue('')
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
      <h3 className="text-xl font-bold text-white mb-6">Simple Storage</h3>
      
      {/* Current Value Display */}
      <div className="text-center mb-8">
        <div className="text-4xl font-bold text-white mb-2">
          {isValueLoading ? (
            <div className="animate-pulse text-slate-500">...</div>
          ) : (
            value?.toString() ?? '0'
          )}
        </div>
        <p className="text-slate-400">Stored Value</p>
        <p className="text-xs text-slate-500 mt-2">
          Owner: {owner ? `${owner.slice(0, 6)}...${owner.slice(-4)}` : 'Unknown'}
        </p>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400"
            disabled={isWritePending || isConfirming}
          />
          <button
            onClick={handleSetValue}
            disabled={!inputValue || isWritePending || isConfirming}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
          >
            {isWritePending || isConfirming ? 'Setting...' : 'Set Value'}
          </button>
        </div>

        <button
          onClick={reset}
          disabled={isWritePending || isConfirming}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
        >
          {isWritePending || isConfirming ? 'Resetting...' : 'Reset to 0'}
        </button>

        {/* Error Display */}
        {writeError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-sm">{writeError.message}</p>
          </div>
        )}

        {/* Contract Info */}
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-xs text-slate-400">
            Contract: {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
          </p>
        </div>
      </div>
    </div>
  )
}
```

## 🏭 Advanced Examples

### ERC-20 Token Contract

```solidity
// contracts/src/MyToken.sol
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18;
    
    constructor() ERC20("MyToken", "MTK") Ownable(msg.sender) {
        _mint(msg.sender, 100_000 * 10**18); // Initial supply
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
```

### Multi-Contract System

```solidity
// contracts/src/Vault.sol
pragma solidity ^0.8.13;

import "./MyToken.sol";

contract Vault {
    MyToken public immutable token;
    mapping(address => uint256) public deposits;
    uint256 public totalDeposits;
    
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    
    constructor(address _token) {
        token = MyToken(_token);
    }
    
    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        deposits[msg.sender] += amount;
        totalDeposits += amount;
        
        emit Deposited(msg.sender, amount);
    }
    
    function withdraw(uint256 amount) external {
        require(deposits[msg.sender] >= amount, "Insufficient balance");
        
        deposits[msg.sender] -= amount;
        totalDeposits -= amount;
        
        require(token.transfer(msg.sender, amount), "Transfer failed");
        
        emit Withdrawn(msg.sender, amount);
    }
    
    function getBalance(address user) external view returns (uint256) {
        return deposits[user];
    }
}
```

### Advanced Deployment Script

```solidity
// contracts/script/DeploySystem.s.sol
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {MyToken} from "../src/MyToken.sol";
import {Vault} from "../src/Vault.sol";

contract DeploySystemScript is Script {
    function run() public {
        vm.startBroadcast();
        
        // Deploy token first
        MyToken token = new MyToken();
        console.log("MyToken deployed to:", address(token));
        
        // Deploy vault with token address
        Vault vault = new Vault(address(token));
        console.log("Vault deployed to:", address(vault));
        
        // Initial setup
        token.mint(address(vault), 50_000 * 10**18); // Mint tokens to vault
        console.log("Minted 50,000 tokens to vault");
        
        vm.stopBroadcast();
    }
}
```

### Enhanced Makefile for Multiple Contracts

```makefile
# Add to contracts/Makefile

# Deploy specific contracts
deploy-token-local:
	forge script script/MyToken.s.sol \
		--rpc-url http://localhost:8545 \
		--private-key $(DEFAULT_ANVIL_KEY) \
		--broadcast

deploy-system-local:
	forge script script/DeploySystem.s.sol \
		--rpc-url http://localhost:8545 \
		--private-key $(DEFAULT_ANVIL_KEY) \
		--broadcast

deploy-system-testnet:
	@if [ -z "$(WALLET)" ]; then echo "Usage: make deploy-system-testnet WALLET=name"; exit 1; fi
	forge script script/DeploySystem.s.sol \
		--rpc-url https://k8s.testnet.json-rpc.injective.network/ \
		--account $(WALLET) \
		--broadcast \
		--verify

# Install OpenZeppelin contracts
install-oz:
	forge install OpenZeppelin/openzeppelin-contracts

# Flatten contracts for verification
flatten:
	forge flatten src/MyToken.sol --output flattened/MyToken.sol
	forge flatten src/Vault.sol --output flattened/Vault.sol
```

## 🔧 Managing Multiple Contracts

### Enhanced Frontend Configuration

After deploying multiple contracts, your `wagmi.ts` will auto-update to:

```typescript
// frontend/src/wagmi.ts (auto-generated)
export const CONTRACT_ADDRESSES = {
  "31337": {
    "Counter": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "MyToken": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", 
    "Vault": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
  },
  "1439": {
    "Counter": "0x...",
    "MyToken": "0x...",
    "Vault": "0x..."
  }
} as const
```

### Multi-Contract React Hook

```typescript
// frontend/src/hooks/useTokenVault.ts
import { useMyToken } from './useMyToken'
import { useVault } from './useVault'

export function useTokenVault() {
  const token = useMyToken()
  const vault = useVault()
  
  const depositToVault = async (amount: bigint) => {
    // First approve token
    await token.approve(vault.contractAddress, amount)
    // Then deposit
    await vault.deposit(amount)
  }
  
  return {
    token,
    vault,
    depositToVault,
    // Combined loading states
    isLoading: token.isLoading || vault.isLoading,
  }
}
```

## �️ Removing Example Contracts

If you want to remove the Counter example and start fresh:

### 1. Clean Contract Files
```bash
cd contracts

# Remove Counter files
rm src/Counter.sol
rm script/Counter.s.sol  
rm test/Counter.t.sol

# Clean build artifacts
forge clean
```

### 2. Update Frontend
```bash
cd frontend

# Remove Counter from App.tsx
# Delete src/abi/Counter.ts (if exists)
# Remove Counter import and component usage
```

### 3. Update Deployment (Optional)
If you want the CLI to deploy your contract instead:

```typescript
// src/index.ts (in evmstart-injective repo)
// Change the deployment script name:
const deployCmd = spawn('forge', [
  'script', 'script/YourContract.s.sol', // Change this line
  '--rpc-url', 'http://127.0.0.1:8545', 
  '--broadcast', 
  '--private-key', '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
]);
```

## 💡 Best Practices & Patterns

### Smart Contract Security

```solidity
// Use OpenZeppelin for battle-tested components
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract SecureContract is ReentrancyGuard, Pausable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    function sensitiveFunction() 
        external 
        nonReentrant 
        whenNotPaused 
        onlyRole(ADMIN_ROLE) 
    {
        // Your logic here
    }
}
```

### Gas Optimization

```solidity
contract GasOptimized {
    // Pack structs to fit in single storage slots
    struct User {
        uint128 balance;  // 16 bytes
        uint64 lastAction; // 8 bytes  
        uint32 tier;      // 4 bytes
        bool active;      // 1 byte
        // Total: 29 bytes = 1 storage slot (32 bytes)
    }
    
    // Use immutable for values set in constructor
    uint256 public immutable CREATION_TIME;
    
    // Use events for off-chain indexing instead of storage
    event UserAction(address indexed user, uint256 indexed action, uint256 timestamp);
    
    constructor() {
        CREATION_TIME = block.timestamp;
    }
}
```

### Testing Patterns

```solidity
// contracts/test/helpers/TestSetup.sol
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {MyToken} from "../../src/MyToken.sol";
import {Vault} from "../../src/Vault.sol";

contract TestSetup is Test {
    MyToken public token;
    Vault public vault;
    
    address public admin = makeAddr("admin");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");
    
    function setUp() public virtual {
        vm.startPrank(admin);
        token = new MyToken();
        vault = new Vault(address(token));
        vm.stopPrank();
        
        // Setup initial balances
        vm.prank(admin);
        token.mint(user1, 1000 * 10**18);
        vm.prank(admin);
        token.mint(user2, 1000 * 10**18);
    }
    
    function _approveAndDeposit(address user, uint256 amount) internal {
        vm.startPrank(user);
        token.approve(address(vault), amount);
        vault.deposit(amount);
        vm.stopPrank();
    }
}
```

### Frontend Error Handling

```typescript
// frontend/src/hooks/useErrorHandler.ts
import { useCallback } from 'react'

export function useErrorHandler() {
  const handleError = useCallback((error: any, context: string) => {
    console.error(`Error in ${context}:`, error)
    
    if (error.name === 'UserRejectedRequestError') {
      return 'Transaction was rejected by user'
    }
    
    if (error.message?.includes('insufficient funds')) {
      return 'Insufficient funds for transaction'
    }
    
    if (error.message?.includes('execution reverted')) {
      const reason = error.message.match(/execution reverted: (.*)/)?.[1]
      return reason ? `Transaction failed: ${reason}` : 'Transaction failed'
    }
    
    return `Unexpected error: ${error.message || 'Unknown error'}`
  }, [])
  
  return { handleError }
}
```

## 🆘 Troubleshooting Guide

### Common Issues & Solutions

**❌ Contract compilation fails**
```bash
# Check Solidity version in foundry.toml
[profile.default]
solc_version = "0.8.13"

# Update dependencies
forge update

# Clean and rebuild
forge clean && forge build
```

**❌ Deployment script fails**
```bash
# Verify RPC URL is accessible
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://k8s.testnet.json-rpc.injective.network/

# Check wallet has funds
cast balance 0xYourWalletAddress --rpc-url https://k8s.testnet.json-rpc.injective.network/

# Run with verbose output
forge script script/YourContract.s.sol --rpc-url URL --account WALLET --broadcast -vvv
```

**❌ Frontend can't find contract**
```bash
# Ensure deployment was successful
ls contracts/broadcast/YourContract.s.sol/

# Update frontend
cd frontend && npm run update-contracts

# Check wagmi.ts has correct addresses
cat src/wagmi.ts | grep -A 10 CONTRACT_ADDRESSES
```

**❌ Transaction reverts**
```solidity
// Add detailed error messages
require(condition, "Detailed error message");

// Use custom errors (gas efficient)
error InsufficientBalance(uint256 requested, uint256 available);

if (balance < amount) {
    revert InsufficientBalance(amount, balance);
}
```

**❌ Gas estimation fails**
```typescript
// Add gas limit to transactions
writeContract({
  address,
  abi,
  functionName: 'yourFunction',
  args: [arg1, arg2],
  gas: 100000n // Add explicit gas limit
})
```

### Debug Commands

```bash
# View transaction details
cast tx 0xTransactionHash --rpc-url YOUR_RPC_URL

# Simulate transaction before sending
forge script script/YourContract.s.sol --rpc-url URL --sender YOUR_ADDRESS

# Check contract verification
cast code 0xContractAddress --rpc-url YOUR_RPC_URL

# Analyze gas usage
forge test --gas-report --match-contract YourContractTest
```

## 🎯 Production Checklist

Before deploying to mainnet:

### Smart Contracts
- [ ] **Comprehensive tests** with >90% coverage
- [ ] **Security audit** (manual review + tools like Slither)
- [ ] **Gas optimization** review
- [ ] **Access control** properly implemented
- [ ] **Emergency pause** mechanism if needed
- [ ] **Upgrade path** considered (proxy patterns)

### Frontend
- [ ] **Error handling** for all edge cases
- [ ] **Loading states** for all async operations
- [ ] **Transaction confirmations** with proper UX
- [ ] **Network detection** and switching
- [ ] **Wallet connection** fallbacks
- [ ] **Mobile responsiveness** tested

### Deployment
- [ ] **Testnet deployment** thoroughly tested
- [ ] **Contract verification** on block explorer
- [ ] **Documentation** updated
- [ ] **Environment variables** properly configured
- [ ] **Backup deployment** scripts ready
- [ ] **Monitoring** setup for contract events

---

## 🚀 Ready to Build?

You now have everything needed to build sophisticated dApps on Injective EVM! 

### Quick Start Your Next Contract:
```bash
# Create your project
npx evmstart-injective my-defi-app

# Add your contracts
cd my-defi-app/contracts/src
# Create YourContract.sol

# Test and deploy
forge test && make deploy-testnet WALLET=my-wallet

# Update frontend
cd ../frontend && npm run update-contracts && npm run dev
```

**Need help?** Check the [main README](README.md) or [open an issue](https://github.com/Trynax/evmstart-injective/issues) 

**Building something cool?** Share it with the community! 🌟
