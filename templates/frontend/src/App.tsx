import './App.css'
import { Web3Provider } from './Web3Provider'
import { WalletConnect } from './components/WalletConnect'
import { Counter } from './components/Counter'
import { NetworkSwitcher } from './components/NetworkSwitcher'
import injLogo from './assets/injLogo.svg'

function App() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-[#0C121F] relative">
   
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 text-slate-600 text-xl">+</div>
          <div className="absolute top-40 right-20 text-slate-600 text-sm">✦</div>
          <div className="absolute top-60 left-1/4 text-slate-600 text-lg">+</div>
          <div className="absolute bottom-40 right-10 text-slate-600 text-xl">+</div>
          <div className="absolute bottom-20 left-1/3 text-slate-600 text-sm">✦</div>
          <div className="absolute top-1/3 right-1/3 text-slate-600 text-lg">+</div>
          <div className="absolute bottom-1/3 left-1/5 text-slate-600 text-sm">✦</div>
          <div className="absolute top-3/4 right-1/4 text-slate-600 text-xl">+</div>
        </div>
        
       
        <div className="relative z-10">
     
        <header className="border-b bg-[#161B26]  border-[#333741]">
          <div className="w-full px-6 py-2">
            <div className="flex items-center justify-between">
       
              <div className="flex items-center">
                <img src={injLogo} alt="Injective" className="h-16 w-auto" />
              </div>
            
              <div className="flex items-center space-x-4">
                <NetworkSwitcher />
                <WalletConnect />
              </div>
            </div>
          </div>
        </header>

        <main className="w-full px-6 py-16">
     
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              Injective EVM 
              <span className="bg-gradient-to-r from-[#0090FA] to-[#00EDFC] bg-clip-text text-transparent"> Starter</span>
            </h2>
            <p className="text-slate-400 text-xl leading-relaxed">
              A minimal dApp starter with smart contract and web3 integration
            </p>
          </div>
          <div className="flex justify-center">
            <Counter />
          </div>
        </main>
        </div>
      </div>
    </Web3Provider>
  )
}

export default App
