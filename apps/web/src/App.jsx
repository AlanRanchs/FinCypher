import { useEffect, useState } from 'react'
import Dashboard from './components/Dashboard'
import Transactions from './components/Transactions'
import MessageAnalyzer from './components/MessageAnalyzer'
import { health } from './api'

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [service, setService] = useState('')

  useEffect(() => {
    let mounted = true
    health().then((h) => { if (mounted) setService(h?.service || '') }).catch(() => setService(''))
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

      {service === 'fincypher-frontend-local' && (
        <div className="card" style={{ borderColor: 'var(--warn)' }}>
          <strong>Demo mode:</strong> Running frontend-only with local data and analyzer. To use the API, start FastAPI and set VITE_API_BASE.
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
