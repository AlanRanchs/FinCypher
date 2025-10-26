import { useEffect, useState } from 'react'
import Dashboard from './components/Dashboard'
import Transactions from './components/Transactions'
import MessageAnalyzer from './components/MessageAnalyzer'
import { health } from './api'

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [apiOk, setApiOk] = useState(false)

  useEffect(() => {
    let mounted = true
    health().then(() => { if (mounted) setApiOk(true) }).catch(() => setApiOk(false))
    return () => { mounted = false }
  }, [])

  return (
    <div className="container">
      <div className="header">
        <div>
          <div className="brand">FinCypher</div>
        </div>
        <div className="nav">
          <button className={`tab ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>Dashboard</button>
          <button className={`tab ${tab === 'transactions' ? 'active' : ''}`} onClick={() => setTab('transactions')}>Transactions</button>
          <button className={`tab ${tab === 'analyzer' ? 'active' : ''}`} onClick={() => setTab('analyzer')}>Analyzer</button>
        </div>
      </div>

      {!apiOk && (
        <div className="card" style={{ borderColor: 'var(--warn)' }}>
          <strong>Note:</strong> Backend not reachable. Start FastAPI at http://127.0.0.1:8000 or set VITE_API_BASE.
        </div>
      )}

      {tab === 'dashboard' && <Dashboard />}
      {tab === 'transactions' && <Transactions />}
      {tab === 'analyzer' && <MessageAnalyzer />}

      <div className="subtitle" style={{ marginTop: 16 }}>
        MVP for Hackathon demo — Local data, explainable alerts.
      </div>
    </div>
  )
}
