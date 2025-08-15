# 🔄 Working with Your Own Contracts

This starter comes with two example contracts:

- **Counter.sol** - Simple counter example (deployed automatically)
- **MyContract.sol** - Template for your custom contracts

## 🚀 Adding Your Own Contract

### 1. Create Your Contract
```solidity
// src/YourContract.sol
pragma solidity ^0.8.13;

contract YourContract {
    // Your contract code here
}
```

### 2. Create Deployment Script
```solidity
// script/YourContract.s.sol
import {YourContract} from "../src/YourContract.sol";

contract YourContractScript is Script {
    function run() public {
        vm.startBroadcast();
        YourContract yourContract = new YourContract();
        console.log("YourContract deployed to:", address(yourContract));
        vm.stopBroadcast();
    }
}
```

### 3. Create Tests
```solidity
// test/YourContract.t.sol
import {YourContract} from "../src/YourContract.sol";

contract YourContractTest is Test {
    YourContract public yourContract;
    
    function setUp() public {
        yourContract = new YourContract();
    }
    
    function test_YourFunction() public {
        // Your tests here
    }
}
```

### 4. Deploy Your Contract

#### Local (Anvil)
```bash
make deploy-local
# Or for custom contract:
forge script script/YourContract.s.sol --rpc-url http://localhost:8545 --private-key 0xac097... --broadcast
```

#### Testnet
```bash
make deploy-testnet WALLET=your-wallet
# Or for custom contract:
forge script script/YourContract.s.sol --rpc-url https://k8s.testnet.json-rpc.injective.network/ --account your-wallet --broadcast
```

#### Mainnet
```bash
make deploy-mainnet WALLET=your-wallet
# Or for custom contract:
forge script script/YourContract.s.sol --rpc-url https://sentry.evm-rpc.injective.network/ --account your-wallet --broadcast
```

### 5. Update Frontend

#### Generate ABI
```bash
# After deployment, run:
cd ../frontend
npm run update-contracts
```

This will:
- ✅ Extract ABIs from `contracts/out/`
- ✅ Update contract addresses in `src/wagmi.ts`
- ✅ Create ABI files in `src/abi/`

#### Create React Hook
```typescript
// src/hooks/useYourContract.ts
import { useReadContract, useWriteContract } from 'wagmi'
import { yourContractAbi } from '../abi/YourContract'
import { CONTRACT_ADDRESSES } from '../wagmi'

export function useYourContract() {
  const chainId = useChainId()
  const address = CONTRACT_ADDRESSES[chainId.toString()]?.YourContract
  
  const { data, isLoading } = useReadContract({
    address,
    abi: yourContractAbi,
    functionName: 'yourFunction',
  })
  
  const { writeContract } = useWriteContract()
  
  const yourAction = () => {
    writeContract({
      address,
      abi: yourContractAbi,
      functionName: 'yourFunction',
      args: [/* your args */]
    })
  }
  
  return { data, isLoading, yourAction }
}
```

#### Create React Component
```tsx
// src/components/YourContract.tsx
import { useYourContract } from '../hooks/useYourContract'

export function YourContract() {
  const { data, isLoading, yourAction } = useYourContract()
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white">Your Contract</h3>
      
      {isLoading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <p className="text-white">Data: {data?.toString()}</p>
      )}
      
      <button 
        onClick={yourAction}
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
      >
        Your Action
      </button>
    </div>
  )
}
```

## 🔧 Advanced: Multiple Contracts

### Update Makefile for Multiple Contracts
```makefile
# Add to Makefile
deploy-my-contract:
	forge script script/MyContract.s.sol $(NETWORK_ARGS)

deploy-all-local:
	make deploy-local
	forge script script/MyContract.s.sol --rpc-url http://localhost:8545 --private-key $(DEFAULT_ANVIL_KEY) --broadcast
```

### Update Frontend Config
```typescript
// In src/wagmi.ts
export const CONTRACT_ADDRESSES = {
  "31337": {
    "Counter": "0x...",
    "MyContract": "0x...",
    "YourContract": "0x..."
  },
  "1439": {
    "Counter": "0x...",
    "MyContract": "0x...",
    "YourContract": "0x..."
  }
}
```

## 🗑️ Removing Example Contracts

If you want to remove the Counter example:

1. **Delete files:**
   ```bash
   rm src/Counter.sol
   rm script/Counter.s.sol  
   rm test/Counter.t.sol
   ```

2. **Update frontend:**
   ```bash
   # Remove Counter from CONTRACT_ADDRESSES in wagmi.ts
   # Delete src/abi/Counter.ts
   # Remove Counter component and references
   ```

3. **Update CLI (optional):**
   - Edit `src/index.ts` to deploy your contract instead
   - Update deployment logic

## 💡 Best Practices

- ✅ **Always test locally first** with Anvil
- ✅ **Write comprehensive tests** before deployment
- ✅ **Use secure wallet keystores** for testnet/mainnet
- ✅ **Verify contracts** on block explorers
- ✅ **Keep ABIs updated** with `npm run update-contracts`
- ✅ **Use TypeScript** for type safety with ABIs

## 🆘 Common Issues

**Contract not found:** Make sure you ran `npm run update-contracts` after deployment

**Wrong network:** Check that MetaMask is on the correct network

**Transaction fails:** Ensure you have enough gas and the contract is deployed

**ABI outdated:** Run `forge build` and `npm run update-contracts`

That's it! You now have a flexible system for building any dApp on Injective EVM! 🚀
