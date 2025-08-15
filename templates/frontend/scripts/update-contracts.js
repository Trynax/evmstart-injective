#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const contractsDir = join(projectRoot, '..', 'contracts');

console.log('🔍 Scanning for latest contract deployments...');

// Find latest contract addresses from broadcast
function getLatestContractAddresses() {
  const addresses = {};
  const broadcastDir = join(contractsDir, 'broadcast');
  
  if (!existsSync(broadcastDir)) {
    console.log('⚠️  No broadcast directory found');
    return addresses;
  }

  try {
    const scriptDirs = readdirSync(broadcastDir);
    
    for (const scriptDir of scriptDirs) {
      const scriptPath = join(broadcastDir, scriptDir);
      const chainDirs = readdirSync(scriptPath);
      
      for (const chainId of chainDirs) {
        const latestJsonPath = join(scriptPath, chainId, 'run-latest.json');
        
        if (existsSync(latestJsonPath)) {
          const latestData = JSON.parse(readFileSync(latestJsonPath, 'utf-8'));
          
          if (latestData.transactions) {
            for (const tx of latestData.transactions) {
              if (tx.contractName && tx.contractAddress) {
                if (!addresses[chainId]) addresses[chainId] = {};
                addresses[chainId][tx.contractName] = tx.contractAddress;
                console.log(`✅ Found ${tx.contractName} on chain ${chainId}: ${tx.contractAddress}`);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.log('❌ Error reading broadcast data:', error.message);
  }

  return addresses;
}

// Get ABI from Foundry artifacts
function getContractABI(contractName) {
  const artifactPath = join(contractsDir, 'out', `${contractName}.sol`, `${contractName}.json`);
  
  if (!existsSync(artifactPath)) {
    console.log(`⚠️  No artifact found for ${contractName}`);
    return null;
  }

  try {
    const artifact = JSON.parse(readFileSync(artifactPath, 'utf-8'));
    return artifact.abi;
  } catch (error) {
    console.log(`❌ Error reading ABI for ${contractName}:`, error.message);
    return null;
  }
}

// Update wagmi.ts with latest addresses
function updateWagmiConfig(addresses) {
  const wagmiPath = join(projectRoot, 'src', 'wagmi.ts');
  
  if (!existsSync(wagmiPath)) {
    console.log('⚠️  wagmi.ts not found');
    return;
  }

  let wagmiContent = readFileSync(wagmiPath, 'utf-8');
  
  // Build the new CONTRACT_ADDRESSES object with all chains
  const contractAddressesObj = {};
  
  for (const [chainId, contracts] of Object.entries(addresses)) {
    contractAddressesObj[chainId] = contracts;
  }
  
  // Replace the CONTRACT_ADDRESSES export
  const addressesRegex = /export const CONTRACT_ADDRESSES = \{[\s\S]*?\} as const/;
  const newAddresses = `export const CONTRACT_ADDRESSES = ${JSON.stringify(contractAddressesObj, null, 2)} as const`;
  
  wagmiContent = wagmiContent.replace(addressesRegex, newAddresses);
  
  console.log(`🔗 Updated CONTRACT_ADDRESSES with all chain deployments`);
  writeFileSync(wagmiPath, wagmiContent);
}

// Update ABI files
function updateABI(contractName, abi) {
  const abiPath = join(projectRoot, 'src', 'abi', `${contractName}.ts`);
  
  const abiContent = `export const contractAbi = ${JSON.stringify(abi, null, 2)} as const\n`;
  
  writeFileSync(abiPath, abiContent);
  console.log(`📋 Updated ${contractName} ABI`);
}

// Main execution
async function main() {
  const addresses = getLatestContractAddresses();
  
  if (Object.keys(addresses).length > 0) {
    updateWagmiConfig(addresses);
  }

  // Update ABIs for known contracts
  const contracts = ['Counter']; // Add more contracts here as needed
  
  for (const contractName of contracts) {
    const abi = getContractABI(contractName);
    if (abi) {
      updateABI(contractName, abi);
    }
  }

  console.log('✅ Contract update complete!');
}

main().catch(console.error);
