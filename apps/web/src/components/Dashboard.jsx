import { useEffect, useMemo, useState } from 'react'
import { getTransactions, seed } from '../api'
import SpendingChart from './SpendingChart'
import TrendChart from './TrendChart'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

function fmt(n) {
  return (n < 0 ? '-' : '') + '$' + Math.abs(n).toFixed(2)
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57', '#83a6ed', '#8dd1e1']

export default function Dashboard() {
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

  // Calculate KPIs
  const kpis = useMemo(() => {
    let totalIncome = 0
    let totalExpenses = 0
    let transactionCount = 0

    for (const tx of items) {
      if (tx.type === 'credit') {
        totalIncome += tx.amount
      } else {
        totalExpenses += Math.abs(tx.amount)
      }
      transactionCount++
    }

    const balance = totalIncome - totalExpenses
    const avgTransaction = transactionCount > 0 ? totalExpenses / items.filter(t => t.type === 'debit').length : 0

    return { totalIncome, totalExpenses, balance, avgTransaction, transactionCount }
  }, [items])

  // Category spending for bar chart
  const byCategory = useMemo(() => {
    const map = {}
    for (const tx of items) {
      if (tx.type === 'debit') {
        map[tx.category] = (map[tx.category] || 0) + Math.abs(tx.amount)
      }
    }
    return Object.entries(map)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
  }, [items])

  // Top 5 for pie chart
  const topCategories = useMemo(() => {
    return byCategory.slice(0, 5)
  }, [byCategory])

  // Daily trend data
  const trendData = useMemo(() => {
    const dailyMap = {}
    
    for (const tx of items) {
      if (tx.type === 'debit') {
        const date = tx.date
        dailyMap[date] = (dailyMap[date] || 0) + Math.abs(tx.amount)
      }
    }

    const sorted = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30) // Last 30 days

    let cumulative = 0
    return sorted.map(([date, amount]) => {
      cumulative += amount
      return {
        date: date.slice(5), // MM-DD format
        amount,
        cumulative
      }
    })
  }, [items])

  // Alerts
  const alerts = useMemo(() => {
    return items.filter(tx => Math.abs(tx.amount) > 300 || tx.note)
  }, [items])

  const onSeed = async () => {
    try { await seed(); await load() } catch (e) { setError(e.message) }
  }

  return (
    <div>
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3>Financial Dashboard</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="button secondary" onClick={load} disabled={loading}>
            {loading ? 'Loading…' : '↻ Refresh'}
          </button>
          <button className="button" onClick={onSeed}>Regenerate Data</button>
        </div>
      </div>

      {error && <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{error}</p>}

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card income">
          <div className="kpi-label">Total Income</div>
          <div className="kpi-value">{fmt(kpis.totalIncome)}</div>
          <div className="kpi-subtitle">From {items.filter(t => t.type === 'credit').length} transactions</div>
        </div>
        <div className="kpi-card expenses">
          <div className="kpi-label">Total Expenses</div>
          <div className="kpi-value">{fmt(-kpis.totalExpenses)}</div>
          <div className="kpi-subtitle">From {items.filter(t => t.type === 'debit').length} transactions</div>
        </div>
        <div className="kpi-card balance">
          <div className="kpi-label">Net Balance</div>
          <div className="kpi-value" style={{ color: kpis.balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {fmt(kpis.balance)}
          </div>
          <div className="kpi-subtitle">{kpis.balance >= 0 ? 'Positive' : 'Negative'} cash flow</div>
        </div>
        <div className="kpi-card avg">
          <div className="kpi-label">Avg Transaction</div>
          <div className="kpi-value">{fmt(-kpis.avgTransaction)}</div>
          <div className="kpi-subtitle">Per expense transaction</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="chart-grid">
        <SpendingChart data={byCategory} title="Spending by Category" />
        <div className="card">
          <h4>🥧 Top 5 Categories</h4>
          {topCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {topCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="subtitle">No data available</p>
          )}
        </div>
      </div>

      {/* Trend Chart */}
      <TrendChart data={trendData} title="Spending Trend (Last 30 Days)" />

      {/* Alerts Table */}
      <div className="card" style={{ marginTop: 16 }}>
        <h4>Potential Anomalies ({alerts.length})</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Merchant</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {alerts.slice(0, 10).map((tx, i) => (
              <tr key={tx.id || i}>
                <td>{tx.date}</td>
                <td>{tx.merchant}</td>
                <td><span className="badge">{tx.category}</span></td>
                <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{fmt(tx.amount)}</td>
                <td>{tx.note || 'High ticket'}</td>
              </tr>
            ))}
            {alerts.length === 0 && (
              <tr><td colSpan="5" className="subtitle">No anomalies detected</td></tr>
            )}
          </tbody>
        </table>
        {alerts.length > 10 && (
          <p className="subtitle" style={{ marginTop: 8 }}>
            Showing 10 of {alerts.length} anomalies
          </p>
        )}
      </div>
    </div>
  )
}
