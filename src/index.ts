#!/usr/bin/env node

import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';

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
      
      // Create project structure
      const projectPath = await createProjectStructure(finalProjectName);
      
      console.log(chalk.green(`\n🎉 Project created successfully!`));
      console.log(chalk.cyan(`📁 Location: ${projectPath}`));
      console.log(chalk.yellow('\n📋 Next steps:'));
      console.log(chalk.blue('🌐 Frontend:'));
      console.log(chalk.gray(`   cd ${finalProjectName}/frontend`));
      console.log(chalk.gray('   npm install'));
      console.log(chalk.gray('   npm run dev'));
      console.log(chalk.blue('\n⚒️  Smart Contracts:'));
      console.log(chalk.gray(`   cd ${finalProjectName}/contracts`));
      console.log(chalk.gray('   forge build'));
      console.log(chalk.gray('   forge test'));
      console.log(chalk.yellow('\n🌐 Frontend: http://localhost:5173'));
      console.log(chalk.yellow('⚒️  Ready for Injective EVM deployment!'));
      
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

async function createProjectStructure(projectName: string): Promise<string> {
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
    
    // Create contracts directory
    mkdirSync(join(projectPath, 'contracts'), { recursive: true });
    spinner.text = 'Created contracts directory...';
    
    // Create initial project files
    await createInitialFiles(projectPath, projectName);
    spinner.text = 'Created initial files...';
    
    // Create React frontend with Vite
    spinner.stop(); // Stop spinner to show Vite output
    await createReactFrontend(projectPath, projectName);
    
    // Setup Foundry for smart contracts
    await setupFoundry(projectPath, projectName);
    
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

async function createReactFrontend(projectPath: string, projectName: string): Promise<void> {
  console.log(chalk.blue('📦 Creating React frontend with Vite...'));
  
  try {
    // Use child_process to run npm create vite
    const { spawn } = await import('child_process');
    
    // Windows-compatible npm command
    const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    
    console.log(chalk.gray('Setting up React + TypeScript + Vite...'));
    
    await new Promise<void>((resolve, reject) => {
      const child = spawn(npmCommand, ['create', 'vite@latest', 'frontend', '--', '--template', 'react-ts'], {
        cwd: projectPath,
        stdio: 'inherit', // Show output to user
        shell: true
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Vite setup failed with code ${code}`));
        }
      });
      
      child.on('error', (error) => {
        console.error(chalk.red('Spawn error:'), error.message);
        reject(error);
      });
    });
    
    console.log(chalk.green('✅ React app created'));
    
    // Setup TailwindCSS
    await setupTailwindCSS(projectPath);
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to create React frontend'));
    if (error instanceof Error) {
      console.error(chalk.red('Error details:'), error.message);
    }
    throw error;
  }
}

async function setupTailwindCSS(projectPath: string): Promise<void> {
  console.log(chalk.blue('🎨 Setting up TailwindCSS...'));
  
  const frontendPath = join(projectPath, 'frontend');
  const { spawn } = await import('child_process');
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  
  try {
    // Install TailwindCSS
    console.log(chalk.gray('Installing TailwindCSS...'));
    await new Promise<void>((resolve, reject) => {
      const child = spawn(npmCommand, ['install', 'tailwindcss', '@tailwindcss/vite'], {
        cwd: frontendPath,
        stdio: 'inherit',
        shell: true
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`TailwindCSS installation failed with code ${code}`));
        }
      });
      
      child.on('error', (error) => {
        reject(error);
      });
    });
    
    // Update vite.config.ts
    const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
`;
    
    writeFileSync(join(frontendPath, 'vite.config.ts'), viteConfig);
    
    // Add TailwindCSS import to existing index.css
    const existingCSS = readFileSync(join(frontendPath, 'src', 'index.css'), 'utf-8');
    const updatedCSS = `@import "tailwindcss";\n\n${existingCSS}`;
    writeFileSync(join(frontendPath, 'src', 'index.css'), updatedCSS);
    
    console.log(chalk.green('✅ TailwindCSS setup complete'));
    console.log(chalk.gray('   → Added @tailwindcss/vite plugin to vite.config.ts'));
    console.log(chalk.gray('   → Added TailwindCSS import to index.css'));
    console.log(chalk.gray('   → Default Vite React app preserved with TailwindCSS available'));
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to setup TailwindCSS'));
    if (error instanceof Error) {
      console.error(chalk.red('Error details:'), error.message);
    }
    throw error;
  }
}

async function setupFoundry(projectPath: string, projectName: string): Promise<void> {
  console.log(chalk.blue('⚒️  Setting up Foundry for smart contracts...'));
  
  const contractsPath = join(projectPath, 'contracts');
  const { spawn } = await import('child_process');
  
  try {
    // Check if forge is available
    console.log(chalk.gray('Checking Foundry installation...'));
    
    const forgeCommand = process.platform === 'win32' ? 'forge.exe' : 'forge';
    
    // Test if forge is available
    const testForge = await new Promise<boolean>((resolve) => {
      const child = spawn(forgeCommand, ['--version'], {
        stdio: 'pipe',
        shell: true
      });
      
      child.on('close', (code) => {
        resolve(code === 0);
      });
      
      child.on('error', () => {
        resolve(false);
      });
    });
    
    if (!testForge) {
      console.log(chalk.yellow('⚠️  Foundry not found. Installing Foundry...'));
      
      if (process.platform === 'win32') {
        console.log(chalk.cyan('📥 Installing Foundry on Windows...'));
        
        // Use PowerShell to install Foundry on Windows
        await new Promise<void>((resolve, reject) => {
          const child = spawn('powershell', [
            '-Command',
            'irm get.scoop.sh | iex; scoop install git; scoop bucket add main; scoop install foundry'
          ], {
            stdio: 'inherit',
            shell: true
          });
          
          child.on('close', (code) => {
            if (code === 0) {
              resolve();
            } else {
              console.log(chalk.yellow('📝 Foundry auto-install failed. Please install manually:'));
              console.log(chalk.gray('   1. Install Rust: https://rustup.rs/'));
              console.log(chalk.gray('   2. Install Foundry: curl -L https://foundry.paradigm.xyz | bash'));
              console.log(chalk.gray('   3. Run: foundryup'));
              resolve(); // Continue anyway
            }
          });
          
          child.on('error', () => {
            console.log(chalk.yellow('📝 Please install Foundry manually:'));
            console.log(chalk.gray('   Windows: https://book.getfoundry.sh/getting-started/installation#windows'));
            resolve(); // Continue anyway
          });
        });
      } else {
        // Unix-like systems
        console.log(chalk.cyan('📥 Installing Foundry...'));
        await new Promise<void>((resolve, reject) => {
          const child = spawn('sh', ['-c', 'curl -L https://foundry.paradigm.xyz | bash && source ~/.bashrc && foundryup'], {
            stdio: 'inherit',
            shell: true
          });
          
          child.on('close', (code) => {
            if (code === 0) {
              resolve();
            } else {
              console.log(chalk.yellow('📝 Please install Foundry manually:'));
              console.log(chalk.gray('   curl -L https://foundry.paradigm.xyz | bash'));
              console.log(chalk.gray('   foundryup'));
              resolve(); // Continue anyway
            }
          });
          
          child.on('error', () => {
            console.log(chalk.yellow('📝 Please install Foundry manually:'));
            console.log(chalk.gray('   curl -L https://foundry.paradigm.xyz | bash'));
            resolve(); // Continue anyway
          });
        });
      }
    }
    
    // Initialize Foundry project
    console.log(chalk.gray('Initializing Foundry project...'));
    
    const forgeInitSuccess = await new Promise<boolean>((resolve) => {
      const child = spawn(forgeCommand, ['init', '.', '--force'], {
        cwd: contractsPath,
        stdio: 'inherit',
        shell: true
      });
      
      child.on('close', (code) => {
        resolve(code === 0);
      });
      
      child.on('error', () => {
        resolve(false);
      });
    });
    
    if (forgeInitSuccess) {
      console.log(chalk.green('✅ Foundry project initialized'));
      console.log(chalk.gray('   → Standard Foundry structure created'));
      console.log(chalk.gray('   → Counter.sol contract ready'));
      console.log(chalk.gray('   → Tests and scripts included'));
      
    } else {
      console.log(chalk.yellow('⚠️  Forge not available, creating basic structure manually...'));
      createFoundryStructure(contractsPath, projectName);
    }
    
    console.log(chalk.green('✅ Foundry setup complete'));
    console.log(chalk.gray('   → Smart contract development ready'));
    console.log(chalk.gray('   → Run "forge build" to compile contracts'));
    console.log(chalk.gray('   → Run "forge test" to run tests'));
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to setup Foundry'));
    if (error instanceof Error) {
      console.error(chalk.red('Error details:'), error.message);
    }
    
    // Fallback: create basic structure
    createFoundryStructure(contractsPath, projectName);
    console.log(chalk.yellow('⚠️  Created basic contract structure. Install Foundry manually for full functionality.'));
  }
}

function createFoundryStructure(contractsPath: string, projectName: string): void {
  // Create foundry.toml
  const foundryConfig = `[profile.default]
src = "src"
out = "out"
libs = ["lib"]
remappings = []

[profile.default.model_checker]
contracts = {}
engine = 'chc'
timeout = 10000

[fmt]
bracket_spacing = true
int_types = "long"
line_length = 120
multiline_func_header = "all"
number_underscore = "thousands"
quote_style = "double"
tab_width = 4
wrap_comments = true

[rpc_endpoints]
injective = "https://sentry.tm.injective.network:443"
injective-testnet = "https://testnet.sentry.tm.injective.network:443"
`;
  
  writeFileSync(join(contractsPath, 'foundry.toml'), foundryConfig);
  
  // Create src directory and sample contract
  mkdirSync(join(contractsPath, 'src'), { recursive: true });
  
  const sampleContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract ${projectName.replace(/-/g, '_').replace(/^\w/, c => c.toUpperCase())} {
    string public greeting;
    
    constructor(string memory _greeting) {
        greeting = _greeting;
    }
    
    function setGreeting(string memory _greeting) public {
        greeting = _greeting;
    }
    
    function getGreeting() public view returns (string memory) {
        return greeting;
    }
}
`;
  
  writeFileSync(join(contractsPath, 'src', `${projectName.replace(/-/g, '_')}.sol`), sampleContract);
  
  // Create test directory and sample test
  mkdirSync(join(contractsPath, 'test'), { recursive: true });
  
  const sampleTest = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/${projectName.replace(/-/g, '_')}.sol";

contract ${projectName.replace(/-/g, '_').replace(/^\w/, c => c.toUpperCase())}Test is Test {
    ${projectName.replace(/-/g, '_').replace(/^\w/, c => c.toUpperCase())} public myContract;
    
    function setUp() public {
        myContract = new ${projectName.replace(/-/g, '_').replace(/^\w/, c => c.toUpperCase())}("Hello, Injective!");
    }
    
    function testGreeting() public {
        assertEq(myContract.getGreeting(), "Hello, Injective!");
    }
    
    function testSetGreeting() public {
        myContract.setGreeting("Hello, World!");
        assertEq(myContract.getGreeting(), "Hello, World!");
    }
}
`;
  
  writeFileSync(join(contractsPath, 'test', `${projectName.replace(/-/g, '_')}.t.sol`), sampleTest);
  
  // Create script directory
  mkdirSync(join(contractsPath, 'script'), { recursive: true });
  
  const deployScript = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/${projectName.replace(/-/g, '_')}.sol";

contract Deploy${projectName.replace(/-/g, '_').replace(/^\w/, c => c.toUpperCase())} is Script {
    function run() external {
        vm.startBroadcast();
        
        ${projectName.replace(/-/g, '_').replace(/^\w/, c => c.toUpperCase())} myContract = new ${projectName.replace(/-/g, '_').replace(/^\w/, c => c.toUpperCase())}("Hello, Injective EVM!");
        
        console.log("Contract deployed at:", address(myContract));
        
        vm.stopBroadcast();
    }
}
`;
  
  writeFileSync(join(contractsPath, 'script', `Deploy.s.sol`), deployScript);
  
  // Update contracts README
  const contractsReadme = `# Smart Contracts

This directory contains the smart contracts for ${projectName} built with Foundry.

## Getting Started

### 1. Install Dependencies (if Foundry is available)

\`\`\`bash
forge install
\`\`\`

### 2. Build Contracts

\`\`\`bash
forge build
\`\`\`

### 3. Run Tests

\`\`\`bash
forge test
\`\`\`

### 4. Deploy to Injective EVM

\`\`\`bash
# Deploy to Injective testnet
forge script script/Deploy.s.sol --rpc-url injective-testnet --broadcast

# Deploy to Injective mainnet
forge script script/Deploy.s.sol --rpc-url injective --broadcast
\`\`\`

## Project Structure

\`\`\`
contracts/
├── foundry.toml           # Foundry configuration
├── src/                   # Smart contract source files
│   └── ${projectName.replace(/-/g, '_')}.sol        # Main contract
├── test/                  # Test files
│   └── ${projectName.replace(/-/g, '_')}.t.sol      # Contract tests
├── script/                # Deployment scripts
│   └── Deploy.s.sol       # Deployment script
└── README.md             # This file
\`\`\`

## Foundry Installation

If Foundry is not installed, install it manually:

### Windows
1. Install Rust: https://rustup.rs/
2. Install Foundry: \`curl -L https://foundry.paradigm.xyz | bash\`
3. Run: \`foundryup\`

### macOS/Linux
\`\`\`bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
\`\`\`

## Useful Commands

\`\`\`bash
# Format code
forge fmt

# Check gas usage
forge test --gas-report

# Run specific test
forge test --match-test testGreeting

# Generate documentation
forge doc
\`\`\`
`;
  
  writeFileSync(join(contractsPath, 'README.md'), contractsReadme);
}

async function createInitialFiles(projectPath: string, projectName: string): Promise<void> {
  // Create main README
  const readmeContent = `# ${projectName}

A full-stack dApp built with Injective EVM

## Project Structure

\`\`\`
${projectName}/
├── contracts/                # Smart contracts (Foundry + Solidity) ✅
├── frontend/                # React frontend (Vite + TypeScript + TailwindCSS) ✅
└── README.md               # This file
\`\`\`

## Getting Started

### 1. Install and Start Frontend

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Open http://localhost:5173 in your browser!

The frontend comes pre-configured with:
- ⚡ **Vite** - Lightning fast build tool
- ⚛️  **React 19** - Latest React with TypeScript
- 🎨 **TailwindCSS** - Utility-first CSS framework (new @tailwindcss/vite plugin)
- 📝 **Original Vite template** - Preserved with TailwindCSS classes available

### 2. Smart Contracts with Foundry ✅

\`\`\`bash
cd contracts

# Build contracts
forge build

# Run tests
forge test

# Deploy to Injective testnet
forge script script/Deploy.s.sol --rpc-url injective-testnet --broadcast
\`\`\`

The contracts directory includes:
- 🔨 **Foundry** - Fast Solidity testing framework
- 📝 **Sample Contract** - Ready-to-use smart contract template
- 🧪 **Tests** - Comprehensive test suite
- 🚀 **Deploy Script** - Injective EVM deployment ready

### 3. Web3 Integration (Coming in Stage 4)

\`\`\`bash
# Coming in Stage 4: Connect frontend to contracts
npm install wagmi viem @tanstack/react-query
\`\`\`

## Tech Stack

- **Frontend**: React + Vite + TypeScript + TailwindCSS ✅
- **Smart Contracts**: Foundry + Solidity ✅
- **Web3**: wagmi + viem + @tanstack/react-query (Coming Soon)
- **Chain**: Injective EVM

## Next Steps

1. ✅ Start the React development server
2. ✅ Build and test smart contracts with Foundry
3. 🌐 Stage 4: Web3 integration with wagmi/viem
4. 🚀 Stage 5: Deploy to Injective EVM

## Foundry Commands

\`\`\`bash
# In the contracts/ directory:
forge build              # Compile contracts
forge test               # Run tests
forge test --gas-report  # Gas usage report
forge fmt                # Format code
forge doc                # Generate docs
\`\`\`
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

program.parse();
