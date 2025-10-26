import { API_BASE } from './config'

async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json()
}

export async function health() {
  return handle(await fetch(`${API_BASE}/health`))
}

export async function getTransactions() {
  return handle(await fetch(`${API_BASE}/transactions`))
}

export async function seed() {
  return handle(await fetch(`${API_BASE}/seed`, { method: 'POST' }))
}

export async function analyzeMessage(message, locale = 'es', channel = 'sms') {
  return handle(await fetch(`${API_BASE}/analyze-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, locale, channel })
  }))
}
