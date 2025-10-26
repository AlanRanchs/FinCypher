# FinCypher (Hackathon MVP)

## About (English)
FinCypher is an AI‑powered personal finance assistant that visualizes spending patterns and detects social‑engineering (phishing) tactics in messages. It ships as a fast MVP with a React (Vite) frontend and a Python FastAPI backend using local synthetic JSON data for easy demos.

- Key features:
  - Interactive Dashboard with KPIs (income, expenses, balance, average), bar/pie/line charts, and anomaly highlights.
  - Transactions view with category breakdown, recent list, and demo-data regeneration.
  - Message Analyzer to detect tactics like urgency, authority, scarcity, suspicious URLs, and requests for money/data, returning an explainable risk score and recommendation.
- Tech stack: React + Vite + Recharts (frontend), FastAPI + Pydantic + Uvicorn (backend), JSON seed data.
- API endpoints: GET /health, GET /transactions, POST /seed, POST /analyze-message.
- Dev notes: CORS enabled for local development; message analysis falls back to local heuristics for offline demos.

---

FinCypher es un asistente financiero que analiza hábitos de gasto y detecta manipulación en mensajes (ingeniería social) con IA. Este MVP corre con:

- Frontend: React (Vite, JavaScript)
- Backend: Python (FastAPI)
- Datos: JSON sintético (seed) en `data/transactions.json`

## Cómo correr (local)

Requisitos:
- Python 3.10+
- Node.js 18+ y npm

1) Backend (FastAPI)

```powershell
# Desde la carpeta del repo
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r apps/api/requirements.txt
# Ejecutar API en http://127.0.0.1:8000
uvicorn apps.api.main:app --reload --port 8000
```

2) Frontend (React + Vite)

```powershell
cd apps/web
npm install
npm run dev
# Abre el link que salga en consola (por defecto http://127.0.0.1:5173)
```

## Endpoints clave (API)
- GET `/health` -> estado del servicio
- GET `/transactions` -> lista de transacciones demo
- POST `/seed` -> regenera datos sintéticos (opcional)
- POST `/analyze-message` -> analiza texto manipulativo

Body de ejemplo:
```json
{ "message": "AVISO URGENTE: su cuenta se suspende hoy, verifique en http://bit.ly/x" }
```

## Estructura
```
fintrack-ai/
  apps/
    api/           # FastAPI (Python)
    web/           # React (Vite)
  data/
    transactions.json
  docs/
    architecture.md
  README.md
```

## Notas
- CORS está habilitado para desarrollo local.
- Si no hay conexión a servicios externos de IA, el endpoint usa heurísticas locales para no romper la demo.
- Puedes ajustar umbrales de riesgo en `apps/api/main.py`.

## Licencia
MIT (para fines de hackathon/demo)
