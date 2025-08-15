import './App.css'
import { Web3Provider } from './Web3Provider'
import { WalletConnect } from './components/WalletConnect'
import { Counter } from './components/Counter'
import { NetworkSwitcher } from './components/NetworkSwitcher'

function App() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EVM</span>
                </div>
                <h1 className="text-xl font-bold text-white">Injective EVM dApp</h1>
              </div>
              <WalletConnect />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Welcome to Your
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Injective EVM </span>
                Starter
              </h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                A modern full-stack dApp boilerplate with Foundry smart contracts, React frontend, and seamless Web3 integration.
              </p>
            </div>

            {/* Cards Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Network Card */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Network
                </h3>
                <NetworkSwitcher />
              </div>

              {/* Smart Contract Card */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Smart Contract
                </h3>
                <Counter />
              </div>
            </div>

            {/* Getting Started */}
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">🚀 Getting Started</h3>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-2xl">⚒️</span>
                  </div>
                  <h4 className="font-semibold text-white">Smart Contracts</h4>
                  <p className="text-sm text-slate-400">
                    Edit contracts in <code className="bg-slate-700 px-2 py-1 rounded">contracts/src/</code>
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-2xl">🌐</span>
                  </div>
                  <h4 className="font-semibold text-white">Frontend</h4>
                  <p className="text-sm text-slate-400">
                    Customize UI in <code className="bg-slate-700 px-2 py-1 rounded">src/components/</code>
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h4 className="font-semibold text-white">Deploy</h4>
                  <p className="text-sm text-slate-400">
                    Use <code className="bg-slate-700 px-2 py-1 rounded">make deploy-testnet</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm mt-12">
          <div className="container mx-auto px-6 py-6 text-center">
            <p className="text-slate-400">
              Built with ❤️ using <span className="text-purple-400">evmstart-injective</span>
            </p>
          </div>
        </footer>
      </div>
    </Web3Provider>
  )
}

export default App
