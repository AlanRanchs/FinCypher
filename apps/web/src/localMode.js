// Frontend-only mode: local data and heuristics

const STORAGE_KEY = 'fincypher.transactions.v1'

const CATEGORIES = [
  'Groceries','Transport','Subscriptions','Eating Out',
  'Utilities','Salary','Travel','Shopping'
]

const MERCHANTS = {
  Groceries: ['FreshMart','GreenGrocer','Daily Foods'],
  Transport: ['City Taxi','MetroPass','RideNow'],
  Subscriptions: ['Netflix','Spotify','iCloud'],
  'Eating Out': ['Pizza Plaza','Sushi House','Burger Box'],
  Utilities: ['WaterCo','PowerGrid','NetFiber'],
  Salary: ['Company Payroll'],
  Travel: ['AirFly','StayInn','CityTours'],
  Shopping: ['MegaStore','TechHub','XG INVEST LTD']
}

export function generateTransactions(nDays = 60) {
  const today = new Date()
  const txs = []

  // Salary (2 months)
  for (let m = 0; m < 2; m++) {
    const d = new Date(today)
    d.setDate(d.getDate() - (30 * m + Math.floor(Math.random() * 4)))
    txs.push({
      id: `tx-salary-${m}`,
      date: d.toISOString().slice(0,10),
      merchant: 'Company Payroll',
      category: 'Salary',
      amount: +(1800 + (Math.floor(Math.random()*301) - 100)).toFixed(2),
      type: 'credit'
    })
  }

  // Subscriptions
  for (const m of ['Netflix','Spotify','iCloud']) {
    const d = new Date(today)
    d.setDate(d.getDate() - Math.floor(Math.random()*nDays))
    txs.push({
      id: `tx-sub-${m}`,
      date: d.toISOString().slice(0,10),
      merchant: m,
      category: 'Subscriptions',
      amount: - (8 + Math.floor(Math.random()*11)),
      type: 'debit'
    })
  }

  // Variable expenses
  for (let i = 0; i < 60; i++) {
    const cats = CATEGORIES.filter(c => c !== 'Salary')
    const cat = cats[Math.floor(Math.random()*cats.length)]
    const merchs = MERCHANTS[cat]
    const merch = merchs[Math.floor(Math.random()*merchs.length)]
    const d = new Date(today)
    d.setDate(d.getDate() - Math.floor(Math.random()*nDays))
    let amt = +(Math.random() * 77 + 3).toFixed(2)
    if (cat === 'Travel' || cat === 'Shopping') amt = +(Math.random()*230 + 20).toFixed(2)
    txs.push({
      id: `tx-${i}`,
      date: d.toISOString().slice(0,10),
      merchant: merch,
      category: cat,
      amount: -amt,
      type: 'debit'
    })
  }

  // Anomaly
  const d = new Date(today)
  d.setDate(d.getDate() - Math.floor(Math.random()*20))
  txs.push({
    id: 'tx-anomaly-1',
    date: d.toISOString().slice(0,10),
    merchant: 'XG INVEST LTD',
    category: 'Shopping',
    amount: -420.55,
    type: 'debit',
    note: 'Nuevo/alto'
  })

  // Sort desc
  txs.sort((a,b) => b.date.localeCompare(a.date))
  return txs
}

export function loadLocalTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  const seed = generateTransactions()
  saveLocalTransactions(seed)
  return seed
}

export function saveLocalTransactions(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
}

// Heuristics (ported from backend)
const URGENCY = ['urgente','hoy','ahora','inmediato','última oportunidad','vence','suspende']
const AUTHORITY = ['banco','soporte','verificado','certificado','seguridad']
const SCARCITY = ['solo hoy','cupos','últimos','edición limitada']
const REQUEST_MONEY = ['transfiere','envía','wallet','cript','clave','código','datos']
const SUSPICIOUS_URL = ['bit.ly','tinyurl','goo.gl','ow.ly']

export function analyzeMessageLocal(msg) {
  const text = (msg || '').toLowerCase()
  const tactics = []
  const hasAny = (arr) => arr.some(w => text.includes(w))

  if (hasAny(URGENCY)) tactics.push('urgency')
  if (hasAny(AUTHORITY)) tactics.push('authority')
  if (hasAny(SCARCITY)) tactics.push('scarcity')
  if (hasAny(REQUEST_MONEY)) tactics.push('request_money')
  if (hasAny(SUSPICIOUS_URL) || text.includes('http://') || text.includes('https://')) tactics.push('suspicious_url')

  let base = 0.1 * tactics.length
  if (text.includes('suspende') || text.includes('bloqueo')) base += 0.25
  if (text.includes('clave') || text.includes('código')) base += 0.25
  const risk = Math.min(1, base)

  let label = 'uncertain'
  if (risk >= 0.75) label = 'manipulative'
  else if (risk <= 0.25 && tactics.length === 0) label = 'legitimate'

  return {
    risk_score: +risk.toFixed(2),
    label,
    tactics_detected: tactics,
    rationale: 'Local heuristics: urgency/authority/link, request for data/payment.',
    recommendation: label !== 'legitimate'
      ? 'Do not click or share data. Verify via official channel.'
      : 'No apparent risks. Stay cautious.'
  }
}

// Local API surface
export function localHealth() { return Promise.resolve({ status: 'ok', service: 'fincypher-frontend-local' }) }
export function localGetTransactions() { return Promise.resolve({ count: loadLocalTransactions().length, items: loadLocalTransactions() }) }
export function localSeed() {
  const txs = generateTransactions()
  saveLocalTransactions(txs)
  return Promise.resolve({ status: 'seeded', count: txs.length })
}
export function localAnalyzeMessage(message, locale='es', channel='sms') {
  return Promise.resolve(analyzeMessageLocal(message || ''))
}
