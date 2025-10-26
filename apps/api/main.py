from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import os
import random
import datetime as dt

APP_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_PATH = os.path.join(APP_ROOT, "data", "transactions.json")

app = FastAPI(title="FinTrack AI API", version="0.1.0")

# CORS para desarrollo local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    message: str
    locale: Optional[str] = "es"
    channel: Optional[str] = "sms"  # sms | email | whatsapp

class AnalyzeResponse(BaseModel):
    risk_score: float
    label: str  # manipulative | legitimate | uncertain
    tactics_detected: List[str]
    rationale: str
    recommendation: str

# -------------------- Utilidades de datos sintéticos --------------------

CATEGORIES = [
    "Groceries", "Transport", "Subscriptions", "Eating Out",
    "Utilities", "Salary", "Travel", "Shopping"
]

MERCHANTS = {
    "Groceries": ["FreshMart", "GreenGrocer", "Daily Foods"],
    "Transport": ["City Taxi", "MetroPass", "RideNow"],
    "Subscriptions": ["Netflix", "Spotify", "iCloud"],
    "Eating Out": ["Pizza Plaza", "Sushi House", "Burger Box"],
    "Utilities": ["WaterCo", "PowerGrid", "NetFiber"],
    "Salary": ["Company Payroll"],
    "Travel": ["AirFly", "StayInn", "CityTours"],
    "Shopping": ["MegaStore", "TechHub", "XG INVEST LTD"],
}


def generate_transactions(n_days: int = 60) -> List[Dict[str, Any]]:
    today = dt.date.today()
    txs: List[Dict[str, Any]] = []

    # Salario mensual (2 meses)
    for m in range(2):
        date = (today - dt.timedelta(days=30*m + random.randint(0, 3)))
        txs.append({
            "id": f"tx-salary-{m}",
            "date": date.isoformat(),
            "merchant": "Company Payroll",
            "category": "Salary",
            "amount": round(1800 + random.randint(-100, 200), 2),
            "type": "credit"
        })

    # Suscripciones
    for m in ["Netflix", "Spotify", "iCloud"]:
        date = (today - dt.timedelta(days=random.randint(0, n_days)))
        txs.append({
            "id": f"tx-sub-{m}",
            "date": date.isoformat(),
            "merchant": m,
            "category": "Subscriptions",
            "amount": - round(8 + random.randint(0, 10), 2),
            "type": "debit"
        })

    # Gastos variables
    for i in range(60):
        cat = random.choice([c for c in CATEGORIES if c not in ["Salary"]])
        merch = random.choice(MERCHANTS[cat])
        date = (today - dt.timedelta(days=random.randint(0, n_days)))
        amt = round(random.uniform(3, 80), 2)
        if cat in ("Travel", "Shopping"):
            amt = round(random.uniform(20, 250), 2)
        txs.append({
            "id": f"tx-{i}",
            "date": date.isoformat(),
            "merchant": merch,
            "category": cat,
            "amount": -amt,
            "type": "debit"
        })

    # Anomalía: comercio nuevo/alto
    date = (today - dt.timedelta(days=random.randint(0, 20)))
    txs.append({
        "id": "tx-anomaly-1",
        "date": date.isoformat(),
        "merchant": "XG INVEST LTD",
        "category": "Shopping",
        "amount": -420.55,
        "type": "debit",
        "note": "Nuevo/alto"
    })

    # Ordenar por fecha desc
    txs.sort(key=lambda x: x["date"], reverse=True)
    return txs


def ensure_data_file():
    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
    if not os.path.exists(DATA_PATH):
        with open(DATA_PATH, "w", encoding="utf-8") as f:
            json.dump(generate_transactions(), f, indent=2)


def load_transactions() -> List[Dict[str, Any]]:
    ensure_data_file()
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_transactions(txs: List[Dict[str, Any]]):
    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(txs, f, indent=2)

# -------------------- Heurísticas NLP locales --------------------

URGENCY = ["urgente", "hoy", "ahora", "inmediato", "última oportunidad", "vence", "suspende"]
AUTHORITY = ["banco", "soporte", "verificado", "certificado", "seguridad"]
SCARCITY = ["solo hoy", "cupos", "últimos", "edición limitada"]
REQUEST_MONEY = ["transfiere", "envía", "wallet", "cript", "clave", "código", "datos"]
SUSPICIOUS_URL = ["bit.ly", "tinyurl", "goo.gl", "ow.ly"]

TACTIC_NAMES = {
    "urgency": URGENCY,
    "authority": AUTHORITY,
    "scarcity": SCARCITY,
    "request_money": REQUEST_MONEY,
    "suspicious_url": SUSPICIOUS_URL,
}


def analyze_message_text(msg: str) -> AnalyzeResponse:
    text = msg.lower()
    tactics: List[str] = []

    def has_any(words: List[str]) -> bool:
        return any(w in text for w in words)

    if has_any(URGENCY):
        tactics.append("urgency")
    if has_any(AUTHORITY):
        tactics.append("authority")
    if has_any(SCARCITY):
        tactics.append("scarcity")
    if has_any(REQUEST_MONEY):
        tactics.append("request_money")
    if has_any(SUSPICIOUS_URL) or ("http://" in text or "https://" in text):
        tactics.append("suspicious_url")

    # Score simple basado en cantidad de tácticas + señales fuertes
    base = 0.1 * len(tactics)
    if "suspende" in text or "bloqueo" in text:
        base += 0.25
    if "clave" in text or "código" in text:
        base += 0.25
    risk = min(1.0, base)

    if risk >= 0.75:
        label = "manipulative"
    elif risk <= 0.25 and len(tactics) == 0:
        label = "legitimate"
    else:
        label = "uncertain"

    rationale = "Heurísticas locales: urgencia/autoridad/enlace y solicitud de datos/pago."
    recommendation = (
        "No hagas clic ni compartas datos. Verifica por el canal oficial."
        if label != "legitimate" else
        "Sin riesgos aparentes. Mantén precaución."
    )

    return AnalyzeResponse(
        risk_score=round(risk, 2),
        label=label,
        tactics_detected=tactics,
        rationale=rationale,
        recommendation=recommendation,
    )

# -------------------- Rutas --------------------

@app.get("/health")
async def health():
    return {"status": "ok", "service": "fintrack-ai-api"}


@app.get("/transactions")
async def get_transactions():
    txs = load_transactions()
    return {"count": len(txs), "items": txs}


@app.post("/seed")
async def reseed():
    txs = generate_transactions()
    save_transactions(txs)
    return {"status": "seeded", "count": len(txs)}


@app.post("/analyze-message", response_model=AnalyzeResponse)
async def analyze_message(body: AnalyzeRequest):
    return analyze_message_text(body.message)
