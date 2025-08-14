#!/usr/bin/env node

import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { readFileSync, existsSync, mkdirSync, writeFileSync, cpSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf-8')
);

const program = new Command();

program
  .name('evmstart-injective')
  .description('Kickstart your Injective EVM dApp with one command (Foundry + React)')
  .version(packageJson.version)
  .argument('[project-name]', 'Name of the project to create')
  .action(async (projectName?: string) => {
    console.log(chalk.blue.bold('🚀 Welcome to evmstart-injective!'));
    console.log(chalk.gray('Bootstrap your Injective EVM dApp in seconds\n'));

    try {
      const finalProjectName = await getProjectName(projectName);
      
      console.log(chalk.green(`\n✅ Project name: ${finalProjectName}`));
      
      // Create project from templates
      const projectPath = await createProjectFromTemplates(finalProjectName);
      console.log(chalk.green(`\n🎉 Project created successfully!`));
      console.log(chalk.cyan(`📁 Location: ${projectPath}`));

      // Start Anvil (local chain)
      console.log(chalk.blue('\n🚦 Starting Anvil (local blockchain)...'));
      const { spawn } = await import('child_process');
      const anvilProcess = spawn('anvil', ['--silent'], {
        cwd: join(projectPath, 'contracts'),
        shell: true,
        detached: true,
        stdio: 'ignore',
      });
      // Wait a moment for Anvil to start
      await new Promise(res => setTimeout(res, 2000));


      // Deploy Counter contract
      console.log(chalk.blue('🚀 Deploying Counter contract to Anvil...'));
      const deployCmd = spawn('forge', [
        'script', 'script/Counter.s.sol', 
        '--rpc-url', 'http://127.0.0.1:8545', 
        '--broadcast', 
        '--private-key', '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
      ], {
        cwd: join(projectPath, 'contracts'),
        shell: true,
      });

      let deployOutput = '';
      for await (const chunk of deployCmd.stdout) {
        deployOutput += chunk.toString();
      }
      for await (const chunk of deployCmd.stderr) {
        deployOutput += chunk.toString();
      }

      // Wait for transaction to be mined
      console.log(chalk.blue('⏳ Waiting for transaction to be mined...'));
      await new Promise(res => setTimeout(res, 3000));

      // After deployment, read broadcast/run-latest.json for Anvil chainId 31337
      const broadcastDir = join(projectPath, 'contracts', 'broadcast', 'Counter.s.sol', '31337');
      const latestJsonPath = join(broadcastDir, 'run-latest.json');
      let deployedAddress = null;
      try {
        if (existsSync(latestJsonPath)) {
          const latestJson = JSON.parse(readFileSync(latestJsonPath, 'utf-8'));
          // Find contract address for Counter
          if (latestJson && latestJson.transactions) {
            for (const tx of latestJson.transactions) {
              if (tx.contractName === 'Counter' && tx.contractAddress) {
                deployedAddress = tx.contractAddress;
                break;
              }
            }
          }
        }
      } catch (err) {
        console.log(chalk.red('Error reading broadcast/run-latest.json:'), err);
      }

      if (deployedAddress) {
        console.log(chalk.green(`✅ Counter deployed at: ${deployedAddress}`));
        await updateFrontendContractAddress(join(projectPath, 'frontend', 'src', 'wagmi.ts'), deployedAddress);
        console.log(chalk.green('🔗 Frontend config updated with deployed address.'));
      } else {
        console.log(chalk.red('❌ Could not find deployed contract address in broadcast/run-latest.json. Please update frontend manually.'));
      }

      console.log(chalk.yellow('\n📋 Next steps:'));
      console.log(chalk.blue('🌐 Frontend:'));
      console.log(chalk.gray(`   cd ${finalProjectName}/frontend`));
      console.log(chalk.gray('   npm install'));
      console.log(chalk.gray('   npm run dev'));
      console.log(chalk.blue('\n⚒️  Smart Contracts:'));
      console.log(chalk.gray(`   cd ${finalProjectName}/contracts`));
      console.log(chalk.gray('   make help           # See all available commands'));
      console.log(chalk.gray('   make test           # Run contract tests'));
      console.log(chalk.gray('   make setup-wallet   # Create secure keystore'));
      console.log(chalk.gray('   make deploy-testnet WALLET=your-wallet'));
      console.log(chalk.yellow('\n🌐 Frontend: http://localhost:5173'));
      console.log(chalk.cyan('🔐 Security: Use keystores instead of plain private keys!'));
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('❌ Error:'), error.message);
      }
      process.exit(1);
    }
  });

async function getProjectName(providedName?: string): Promise<string> {
  if (providedName) {
    if (!isValidProjectName(providedName)) {
      throw new Error('Invalid project name. Use lowercase letters, numbers, and hyphens only.');
    }
    return providedName;
  }

  const response = await prompts({
    type: 'text',
    name: 'projectName',
    message: 'What is your project name?',
    initial: 'my-injective-dapp',
    validate: (value: string) => {
      if (!value.trim()) {
        return 'Project name cannot be empty';
      }
      if (!isValidProjectName(value)) {
        return 'Use lowercase letters, numbers, and hyphens only';
      }
      return true;
    }
  });

  if (!response.projectName) {
    throw new Error('Project creation cancelled');
  }

  return response.projectName;
}

function isValidProjectName(name: string): boolean {
  return /^[a-z0-9-]+$/.test(name) && !name.startsWith('-') && !name.endsWith('-');
}

async function createProjectFromTemplates(projectName: string): Promise<string> {
  const projectPath = resolve(process.cwd(), projectName);
  
  // Check if directory already exists
  if (existsSync(projectPath)) {
    throw new Error(`Directory "${projectName}" already exists. Please choose a different name.`);
  }

  const spinner = ora('Creating project structure...').start();

  try {
    // Create main project directory
    mkdirSync(projectPath, { recursive: true });
    spinner.text = 'Created main directory...';
 
    // Paths to templates
    const templatesRoot = join(__dirname, '..', 'templates');
    const frontendTemplate = join(templatesRoot, 'frontend');
    const contractsTemplate = join(templatesRoot, 'contracts');

    // Copy frontend template
    spinner.text = 'Copying frontend template...';
    cpSync(frontendTemplate, join(projectPath, 'frontend'), {
      recursive: true,
      filter: (src) => !/\\node_modules(\\|$)/.test(src) && !/\\.git(\\|$)/.test(src),
    });

    // Copy contracts template
    spinner.text = 'Copying contracts template...';
    cpSync(contractsTemplate, join(projectPath, 'contracts'), {
      recursive: true,
      filter: (src) => !/\\node_modules(\\|$)/.test(src) && !/\\.git(\\|$)/.test(src),
    });

    // Create initial project files (root README, .gitignore)
    await createInitialFiles(projectPath, projectName);
    spinner.text = 'Wrote project README and .gitignore...';

    spinner.succeed('Templates copied');
    console.log(chalk.green('✅ Project structure created'));
    return projectPath;
    
  } catch (error) {
    spinner.fail('Failed to create project structure');
    console.error(chalk.red('❌ Detailed error:'));
    if (error instanceof Error) {
      console.error(chalk.red('Error message:'), error.message);
      if (error.stack) {
        console.error(chalk.gray('Stack trace:'), error.stack);
      }
    }
    throw error;
  }
}

async function createInitialFiles(projectPath: string, projectName: string): Promise<void> {
  // Create main README
  const readmeContent = `# ${projectName}

Full-stack Injective EVM dApp scaffolded from templates.

## Project Structure

\`\`\`
${projectName}/
├── contracts/   # Foundry + Solidity (Counter example, tests, deploy script)
├── frontend/    # React + Vite + TailwindCSS + wagmi/viem
└── README.md
\`\`\`

## Quick Start

### Frontend

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Then update the following in 
1. Set a valid RPC URL for Injective EVM.
2. Set your WalletConnect projectId.
3. Set 

Open http://localhost:5173

### Contracts

\`\`\`bash
cd contracts
forge install
forge build
forge test
\`\`\`

Deploy the Counter script (adjust network/rpc):

\`\`\`bash
forge script script/Counter.s.sol --rpc-url <rpc> --broadcast
\`\`\`

After deployment, copy the deployed address into 
 (frontend) so the app points at your contract.

## Notes

- Requires Node.js >= 20.19 for Vite 7.
- The frontend includes wagmi/viem and a Counter UI wired to the contract.
`;

  writeFileSync(join(projectPath, 'README.md'), readmeContent);

  // Create .gitignore
  const gitignoreContent = `# Dependencies
node_modules/

# Build outputs
dist/
build/
out/

# Environment variables
.env
.env.local
.env.production

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Foundry
cache/
broadcast/

# Logs
*.log
`;

  writeFileSync(join(projectPath, '.gitignore'), gitignoreContent);

  // Create contracts README
  const contractsReadme = `# Smart Contracts

This directory contains the smart contracts for ${projectName}.

## Getting Started

\`\`\`bash
# Initialize Foundry (coming in Stage 3)
forge init

# Build contracts
forge build

# Run tests
forge test
\`\`\`
`;

  writeFileSync(join(projectPath, 'contracts', 'README.md'), contractsReadme);
}

// Update frontend wagmi.ts with deployed contract address
async function updateFrontendContractAddress(wagmiPath: string, address: string) {
  let wagmiContent = readFileSync(wagmiPath, 'utf-8');
  wagmiContent = wagmiContent.replace(/Counter: '0x[a-fA-F0-9]{40}'/, `Counter: '${address}'`);
  writeFileSync(wagmiPath, wagmiContent);
}

program.parse();
