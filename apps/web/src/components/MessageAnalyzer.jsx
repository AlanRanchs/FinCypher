import { useState } from 'react'
import { analyzeMessage } from '../api'

const tacticLabels = {
  urgency: 'Urgency',
  authority: 'Authority',
  scarcity: 'Scarcity',
  request_money: 'Request Money/Data',
  suspicious_url: 'Suspicious URL'
}

export default function MessageAnalyzer() {
  const [text, setText] = useState('AVISO URGENTE: Su cuenta será SUSPENDIDA hoy. Verifique ahora: http://bit.ly/xyz')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const onAnalyze = async () => {
    setError(''); setResult(null); setLoading(true)
    try {
      const r = await analyzeMessage(text)
      setResult(r)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h3>Message Analyzer</h3>
      <p className="subtitle">Paste a suspicious SMS/Email/DM. We detect social engineering tactics and suggest a safe action.</p>
      <textarea rows={6} value={text} onChange={e => setText(e.target.value)} placeholder="Paste message here..." />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className="button" onClick={onAnalyze} disabled={loading || !text.trim()}>{loading ? 'Analyzing…' : 'Analyze'}</button>
        <button className="button secondary" onClick={() => setText('')}>Clear</button>
      </div>
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 12 }}>
          <div className="kpi">
            <span className="pill">Risk Score: <strong>{result.risk_score}</strong></span>
            <span className="pill">Label: <strong style={{ color: result.label === 'manipulative' ? 'var(--danger)' : result.label === 'legitimate' ? 'var(--success)' : 'var(--warn)' }}>{result.label}</strong></span>
          </div>
          <div style={{ marginTop: 10 }}>
            <div className="badges">
              {result.tactics_detected?.length ? result.tactics_detected.map(t => (
                <span key={t} className={`badge ${t}`}>{tacticLabels[t] || t}</span>
              )) : <span className="subtitle">No tactics detected</span>}
            </div>
          </div>
          <p style={{ marginTop: 10 }}><strong>Why:</strong> {result.rationale}</p>
          <p><strong>Recommendation:</strong> {result.recommendation}</p>
        </div>
      )}
    </div>
  )
}
