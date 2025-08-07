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
    
    // Update src/index.css
    const indexCSS = `@import "tailwindcss";

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}
`;
    
    writeFileSync(join(frontendPath, 'src', 'index.css'), indexCSS);
    
    // Update App.tsx with a simple TailwindCSS example
    const appTsx = `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        <h1 className="text-4xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Injective EVM dApp
        </h1>
        
        <div className="space-y-6">
          <p className="text-gray-200 text-lg">
            Your Injective dApp is ready! 🚀
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setCount((count) => count - 1)}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              -
            </button>
            
            <span className="text-2xl font-mono text-white bg-black/20 px-4 py-2 rounded-lg">
              {count}
            </span>
            
            <button
              onClick={() => setCount((count) => count + 1)}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              +
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
              <h3 className="text-blue-300 font-semibold mb-2">Smart Contracts</h3>
              <p className="text-gray-300 text-sm">Coming in Stage 3: Foundry setup</p>
            </div>
            
            <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-4">
              <h3 className="text-purple-300 font-semibold mb-2">Web3 Integration</h3>
              <p className="text-gray-300 text-sm">Coming in Stage 4: wagmi + viem</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
`;
    
    writeFileSync(join(frontendPath, 'src', 'App.tsx'), appTsx);
    
    console.log(chalk.green('✅ TailwindCSS setup complete'));
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to setup TailwindCSS'));
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
├── contracts/                # Smart contracts (Foundry) - Coming Soon
├── frontend/                # React frontend (Vite + TypeScript + TailwindCSS)
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
- 🌟 **Beautiful gradient UI** - Ready-to-use components

### 2. Smart Contracts (Coming in Stage 3)

\`\`\`bash
cd contracts
# Coming in Stage 3: Foundry setup
forge build
forge test
\`\`\`

## Tech Stack

- **Frontend**: React + Vite + TypeScript + TailwindCSS ✅
- **Smart Contracts**: Foundry + Solidity (Coming Soon)
- **Web3**: wagmi + viem + @tanstack/react-query (Coming Soon)
- **Chain**: Injective EVM

## Next Steps

1. ✅ Start the React development server
2. 🔧 Stage 3: Foundry smart contract setup
3. 🌐 Stage 4: Web3 integration with wagmi/viem
4. 🚀 Stage 5: Deploy to Injective EVM
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
