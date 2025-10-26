import { useEffect, useMemo, useState } from 'react'
import { getTransactions, seed } from '../api'

function fmt(n) {
  return (n < 0 ? '-' : '') + '$' + Math.abs(n).toFixed(2)
}

export default function Transactions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])

  const load = async () => {
    setError(''); setLoading(true)
    try {
      const r = await getTransactions()
      setItems(r.items || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const byCategory = useMemo(() => {
    const map = {}
    for (const tx of items) {
      if (tx.type === 'debit') {
        map[tx.category] = (map[tx.category] || 0) + tx.amount
      }
    }
    // values are negative for debits; convert to absolute spend
    return Object.entries(map).map(([k, v]) => ({category: k, total: Math.abs(v)})).sort((a,b) => b.total - a.total)
  }, [items])

  const alerts = useMemo(() => {
    return items.filter(tx => Math.abs(tx.amount) > 300 || tx.note)
  }, [items])

  const onSeed = async () => {
    try { await seed(); await load() } catch (e) { setError(e.message) }
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Spending & Alerts</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="button secondary" onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
          <button className="button" onClick={onSeed}>Regenerate Demo Data</button>
        </div>
      </div>

      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

      <div className="grid" style={{ marginTop: 8 }}>
        <div className="card">
          <h4>Top categories (this period)</h4>
          <table className="table">
            <thead>
              <tr><th>Category</th><th>Total</th></tr>
            </thead>
            <tbody>
              {byCategory.map(row => (
                <tr key={row.category}><td>{row.category}</td><td>{fmt(-row.total)}</td></tr>
              ))}
              {!byCategory.length && <tr><td colSpan="2" className="subtitle">No data</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h4>Potential anomalies</h4>
          <table className="table">
            <thead>
              <tr><th>Date</th><th>Merchant</th><th>Amount</th><th>Note</th></tr>
            </thead>
            <tbody>
              {alerts.map((tx, i) => (
                <tr key={tx.id || i}>
                  <td>{tx.date}</td>
                  <td>{tx.merchant}</td>
                  <td style={{ color: 'var(--danger)' }}>{fmt(tx.amount)}</td>
                  <td>{tx.note || 'High ticket'}</td>
                </tr>
              ))}
              {!alerts.length && <tr><td colSpan="4" className="subtitle">No anomalies detected</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h4>Recent transactions</h4>
        <table className="table">
          <thead>
            <tr><th>Date</th><th>Merchant</th><th>Category</th><th>Type</th><th>Amount</th></tr>
          </thead>
          <tbody>
            {items.map((tx, i) => (
              <tr key={tx.id || i}>
                <td>{tx.date}</td>
                <td>{tx.merchant}</td>
                <td>{tx.category}</td>
                <td>{tx.type}</td>
                <td style={{ color: tx.type === 'debit' ? 'var(--danger)' : 'var(--success)' }}>{fmt(tx.amount)}</td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan="5" className="subtitle">No data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
