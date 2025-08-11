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
      console.log(chalk.yellow('\n📋 Next steps:'));
  console.log(chalk.blue('🌐 Frontend:'));
  console.log(chalk.gray(`   cd ${finalProjectName}/frontend`));
  console.log(chalk.gray('   npm install'));
  console.log(chalk.gray('   npm run dev'));
  console.log(chalk.gray('   # Update src/wagmi.ts RPC URL, WalletConnect projectId, and contract address'));
  console.log(chalk.blue('\n⚒️  Smart Contracts:'));
  console.log(chalk.gray(`   cd ${finalProjectName}/contracts`));
  console.log(chalk.gray('   forge install')); 
  console.log(chalk.gray('   forge build'));
  console.log(chalk.gray('   forge test'));
  console.log(chalk.gray('   # Deploy script: script/Counter.s.sol'));
  console.log(chalk.yellow('\n🌐 Frontend: http://localhost:5173'));
  console.log(chalk.yellow('🔗 After deploy, set CONTRACT_ADDRESSES.Counter in frontend/src/wagmi.ts'));
      
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

program.parse();
