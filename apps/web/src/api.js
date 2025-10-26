import { API_BASE } from './config'
import { localHealth, localGetTransactions, localSeed, localAnalyzeMessage } from './localMode'

async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json()
}

export async function health() {
  if (!API_BASE) return localHealth()
  try { return await handle(await fetch(`${API_BASE}/health`)) } catch { return localHealth() }
}

export async function getTransactions() {
  if (!API_BASE) return localGetTransactions()
  try { return await handle(await fetch(`${API_BASE}/transactions`)) } catch { return localGetTransactions() }
}

export async function seed() {
  if (!API_BASE) return localSeed()
  try { return await handle(await fetch(`${API_BASE}/seed`, { method: 'POST' })) } catch { return localSeed() }
}

export async function analyzeMessage(message, locale = 'es', channel = 'sms') {
  if (!API_BASE) return localAnalyzeMessage(message, locale, channel)
  try {
    return await handle(await fetch(`${API_BASE}/analyze-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, locale, channel })
    }))
  } catch {
    return localAnalyzeMessage(message, locale, channel)
  }
}
