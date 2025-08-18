# {{PROJECT_NAME}}

Full-stack Injective EVM dApp scaffolded from templates.

## Project Structure

```
{{PROJECT_NAME}}/
├── contracts/   # Foundry + Solidity (Counter example, tests, deploy script)
├── frontend/    # React + Vite + TailwindCSS + wagmi/viem
└── README.md
```

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Then update the following in 
1. Set a valid RPC URL for Injective EVM.
2. Set your WalletConnect projectId.
3. Set 

Open http://localhost:5173

### Contracts

```bash
cd contracts
forge install
forge build
forge test
```

Deploy the Counter script (adjust network/rpc):

```bash
forge script script/Counter.s.sol --rpc-url <rpc> --broadcast
```

After deployment, copy the deployed address into 
 (frontend) so the app points at your contract.

## Notes

- Requires Node.js >= 20.19 for Vite 7.
- The frontend includes wagmi/viem and a Counter UI wired to the contract.
