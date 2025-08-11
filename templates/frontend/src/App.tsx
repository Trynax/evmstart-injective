import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Web3Provider } from './Web3Provider'
import { WalletConnect } from './components/WalletConnect'
import { Counter } from './components/Counter'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Web3Provider>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <div className="container mx-auto max-w-3xl p-6">
        <div className="my-6">
          <WalletConnect />
        </div>
        <div className="my-6">
          <Counter />
        </div>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </Web3Provider>
  )
}

export default App
