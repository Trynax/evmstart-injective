-include .env

.PHONY: all test clean deploy help install format anvil setup-wallet

# Default Anvil key for local development
DEFAULT_ANVIL_KEY := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

help:
	@echo "Usage:"
	@echo "  make install          Install dependencies"
	@echo "  make build            Build contracts"
	@echo "  make test             Run tests"
	@echo "  make setup-wallet     Create secure keystore"
	@echo "  make deploy-local     Deploy to Anvil"
	@echo "  make deploy-testnet WALLET=name"
	@echo "  make deploy-mainnet WALLET=name"

all: install build

install:
	forge install

build:
	forge build

test:
	forge test

format:
	forge fmt

clean:
	forge clean

anvil:
	anvil

setup-wallet:
	@read -p "Enter wallet name: " wallet_name; \
	cast wallet import $$wallet_name --interactive

deploy-local:
	forge script script/Counter.s.sol \
		--rpc-url http://localhost:8545 \
		--private-key $(DEFAULT_ANVIL_KEY) \
		--broadcast

deploy-testnet:
	@if [ -z "$(WALLET)" ]; then echo "Usage: make deploy-testnet WALLET=name"; exit 1; fi
	forge script script/Counter.s.sol \
		--rpc-url https://k8s.testnet.json-rpc.injective.network/ \
		--account $(WALLET) \
		--broadcast

deploy-mainnet:
	@if [ -z "$(WALLET)" ]; then echo "Usage: make deploy-mainnet WALLET=name"; exit 1; fi
	@echo "WARNING: Deploying to MAINNET!"
	@read -p "Continue? (y/N): " confirm && [ "$$confirm" = "y" ]
	forge script script/Counter.s.sol \
		--rpc-url https://sentry.evm-rpc.injective.network/ \
		--account $(WALLET) \
		--broadcast
