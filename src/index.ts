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
      console.log(chalk.gray(`   cd ${finalProjectName}/frontend`));
      console.log(chalk.gray('   npm install'));
      console.log(chalk.gray('   npm run dev'));
      console.log(chalk.yellow('\n🌐 Then open http://localhost:5173 in your browser!'));
      
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
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to create React frontend'));
    if (error instanceof Error) {
      console.error(chalk.red('Error details:'), error.message);
    }
    throw error;
  }
}

async function createInitialFiles(projectPath: string, projectName: string): Promise<void> {
  // Create main README
  const readmeContent = `# ${projectName}

A full-stack dApp built with Injective EVM

## Project Structure

\`\`\`
${projectName}/
├── contracts/                # Smart contracts (Foundry)
├── frontend/                # React frontend (Vite + TypeScript)
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

### 2. Smart Contracts (Coming Soon)

\`\`\`bash
cd contracts
# Coming in Stage 3: Foundry setup
forge build
forge test
\`\`\`

## Tech Stack

- **Smart Contracts**: Foundry + Solidity (Coming Soon)
- **Frontend**: React + Vite + TypeScript
- **Web3**: wagmi + viem + @tanstack/react-query (Coming Soon)
- **Chain**: Injective EVM

## Next Steps

1. Start the React development server
2. Stage 3: Foundry smart contract setup
3. Stage 4: Web3 integration with wagmi/viem
4. Stage 5: TailwindCSS styling
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
