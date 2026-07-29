# AIVOA.AI - Customer Complaint Management System
Pharmaceutical Quality QMS with AI Copilot & LangGraph

🎯 **AIVOA.AI** is an AI-powered QMS (Quality Management System) customer complaint registry and lifecycle management tool designed specifically for pharmaceutical companies. It helps QA teams automatically intake, parse, risk-classify, and formulate CAPA (Corrective and Preventive Actions) from PDFs, emails, and images.

---

## 🚀 Key Features

1. **AI Copilot Doc Extraction**: Drag & drop complaint letters (PDFs), scanned boxes (images), or email logs (.txt / .eml).
2. **LangGraph Agentic Workflow**: Executes text cleaning, field parsing, executive summarization, FMEA risk classification, and CAPA formulation through structured node transitions.
3. **FMEA Risk Matrix**: Interactive risk calculation. Severity (1-5) $\times$ Probability (1-5) = RPN (Risk Priority Number), automatically assigning High/Medium/Low risk.
4. **Audit Trail**: Every action (create, update, risk rating, status transition) is logged in a tamper-proof timeline in accordance with FDA 21 CFR Part 11.
5. **Glassmorphic Futuristic UI**: Stunning dark-mode styling with radial glows, frosted glass cards, custom charts, and smooth micro-animations.

---

## 🛠️ Technology Stack

* **Frontend**: React, Redux Toolkit, React Router, Axios, Lucide Icons, Vanilla CSS variables.
* **Backend**: FastAPI, SQLAlchemy, SQLite, Pydantic, PyJWT, bcrypt.
* **AI Agent**: LangGraph, Groq API (Gemma2-9B-IT) with heuristic rule-based fallback if no API key is provided.

---

## 📂 Project Structure

```
aivoa-ai/
├── backend/                # FastAPI application
│   ├── app/
│   │   ├── routes/         # API Routers (auth, complaints, dashboard, upload, ai, settings)
│   │   ├── config.py       # Configuration and env loading
│   │   ├── database.py     # SQLAlchemy DB connection
│   │   ├── models.py       # SQLAlchemy tables
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── auth.py         # JWT tokens & Password hashing
│   │   ├── ai_agent.py     # LangGraph workflow implementation
│   │   └── main.py         # FastAPI App Entrypoint
│   ├── requirements.txt    # Python requirements
│   └── test_backend.py     # API unit tests
├── frontend/               # React client app
│   ├── src/
│   │   ├── components/     # UI elements (Sidebar, Navbar, Toasts)
│   │   ├── pages/          # Login, Dashboard, Registry, Log Form, Copilot, Settings
│   │   ├── store/          # Redux toolkit store & slices
│   │   ├── index.css       # Core styling & glassmorphic system
│   │   ├── main.jsx        # Entry point
│   │   └── App.jsx         # App router
│   ├── package.json
│   └── index.html
├── database/               # Local SQLite database files
└── uploads/                # Document upload directories (pdf, images, emails)
```

---

## ⚙️ Running Locally

### Prerequisites
* Python 3.10+
* Node.js v18+

### 1. Setup & Start Backend
Navigate to the `backend/` directory:
```bash
cd backend
python -m pip install -r requirements.txt
```
To run the automated test suite:
```bash
python test_backend.py
```
To start the development server:
```bash
python -m uvicorn app.main:app --reload --port 8000
```
The API documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Setup & Start Frontend
Navigate to the `frontend/` directory:
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Login Credentials

The database is seeded automatically with a QA investigator on startup:
* **Username**: `qa_lead`
* **Password**: `Password123`
* **Role**: `QualityAssurance`
* **Name**: `QA Lead Investigator`

---

## 🤖 AI Heuristics Fallback

If you don't configure a `GROQ_API_KEY`, the application will seamlessly fall back to a **regex-based heuristic parser** that mimics the LangGraph node logic. To test real LLM parsing, paste your key in the **Settings** page inside the UI, and the system will automatically write to your `.env` file and use the `Gemma2-9B-IT` model on Groq.
