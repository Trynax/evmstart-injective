# Smart Contracts

**Foundry-based smart contracts for Injective EVM**

This project uses Foundry for smart contract development and includes a comprehensive Makefile for easy deployment and testing.

## 🚀 Quick Start

```bash
# Install dependencies
make install

# Build contracts
make build

# Run tests
make test

# See all available commands
make help
```

## 🔐 Secure Deployment Setup

### 1. Create a secure wallet keystore (recommended)
```bash
make setup-wallet
# Enter wallet name: injTest
# Enter private key: [your-private-key]
# Enter password: [secure-password]
```

### 2. Deploy to networks
```bash
# Deploy to testnet
make deploy-testnet WALLET=injTest

# Deploy to mainnet (with confirmation prompt)
make deploy-mainnet WALLET=injTest
```

## 🌐 Supported Networks

- **Local Anvil**: `make deploy-local`
- **Injective EVM Testnet**: `make deploy-testnet WALLET=wallet-name`
- **Injective EVM Mainnet**: `make deploy-mainnet WALLET=wallet-name`

## 📋 Available Commands

Run `make help` to see all available commands:

- **Development**: `install`, `build`, `test`, `format`, `clean`
- **Local**: `anvil`, `deploy-local`
- **Security**: `setup-wallet`
- **Deployment**: `deploy-testnet`, `deploy-mainnet`
- **Verification**: `verify-testnet`, `verify-mainnet`

## Foundry Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
