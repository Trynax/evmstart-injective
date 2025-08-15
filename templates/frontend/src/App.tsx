import './App.css'
import { Web3Provider } from './Web3Provider'
import { WalletConnect } from './components/WalletConnect'
import { Counter } from './components/Counter'
import { NetworkSwitcher } from './components/NetworkSwitcher'

function App() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-slate-950">
        {/* Simple Header */}
        <header className="border-b border-slate-800/50">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EVM</span>
                </div>
                <h1 className="text-xl font-semibold text-white">Injective EVM</h1>
              </div>
              <div className="flex items-center space-x-4">
                <NetworkSwitcher />
                <WalletConnect />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              Injective EVM 
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Starter</span>
            </h2>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
              A minimal dApp starter with smart contracts and Web3 integration
            </p>
          </div>

          {/* Counter Section */}
          <div className="max-w-md mx-auto">
            <Counter />
          </div>
        </main>
      </div>
    </Web3Provider>
  )
}

export default App
