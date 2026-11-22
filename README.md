# AIVOA.AI - Enterprise Life Sciences Complaint Management System (QMS)
### FDA 21 CFR Part 11 & EU Annex 11 Compliant | LangGraph AI Orchestration | cGMP Validated

🎯 **AIVOA.AI** is an enterprise-grade AI-powered Quality Management System (QMS) designed specifically for pharmaceutical, biotechnology, and medical device manufacturers. It automates complaint intake, standardizes medical terminology, performs structured Root Cause Analysis (5-Whys & 6M Fishbone), executes quantitative FMEA risk triage, and enforces legally binding **21 CFR Part 11 Electronic Signatures**.

---

## 🏛️ The 5 Pillars of Enterprise Life Sciences Architecture

```
                          AIVOA.AI PHARMA QMS
                                   │
      ┌──────────────┬─────────────┼─────────────┬──────────────┐
      ▼              ▼             ▼             ▼              ▼
1. Regulatory   2. Advanced   3. Structured  4. Regulatory   5. Production
   Compliance      Medical       RCA & CAPA     Submissions     Engineering
  (21 CFR 11)     Ingestion     Verification   (FDA MedWatch)   (Cloud/Docker)
```

### Pillar 1: Regulatory Compliance (FDA 21 CFR Part 11 & EU Annex 11)
* **Cryptographic Electronic Signatures**: Every milestone transition (`OPEN` ➔ `UNDER REVIEW` ➔ `INVESTIGATION` ➔ `CAPA` ➔ `VERIFICATION` ➔ `CLOSED`) enforces credential re-authentication, selection of legal "Meaning of Signature", and generates a SHA-256 cryptographic seal.
* **Role-Based Access Control (RBAC)**: Segregation of duties between `QualityAssurance (QA Manager)`, `Investigator`, `IntakeSpecialist`, and `Auditor`.
* **Immutable Audit Trail**: Permanent, chronological record of every field change, signature, and risk evaluation.

### Pillar 2: Medical Standardization (FDA NDC & MedDRA Coding)
* **FDA NDC Directory Lookup**: Auto-matches extracted products against the official FDA National Drug Code directory (Proprietary name, Active Ingredient, Strength, Dosage Form, Manufacturer).
* **MedDRA Classification**: Standardizes symptom descriptions into Medical Dictionary for Regulatory Activities (MedDRA) System Organ Class (SOC) and Preferred Terms (PT).
* **Automated 15-Day Expedited Triage**: Triggers high-priority safety flags for adverse events requiring 15-day reporting under 21 CFR 314.80.

### Pillar 3: Structured Root Cause Analysis (RCA) & CAPA Verification
* **Interactive 5-Whys Causal Chain**: Step-by-step causal investigation with a 1-click **"AI Suggest RCA"** assistant.
* **Ishikawa 6M Fishbone Matrix**: Factor analysis across *Man, Machine, Method, Material, Measurement, and Milieu*.
* **CAPA Effectiveness Verification**: Enforces scheduled post-implementation verification checks (60/90 days) with quantitative statistical criteria before record closure.

### Pillar 4: Regulatory Submissions & Inspection Dossiers
* **1-Click FDA MedWatch Form 3500A**: Generates the official FDA Form 3500A (Mandatory Reporting for Manufacturers) with Sections A, B, C, D, E, and G, formatted for instant printing or PDF export.
* **Official Compliance Inspection Dossier**: Generates a certified audit dossier package with FEI facility details, FMEA ratings, 5-Whys, CAPA effectiveness, and 21 CFR Part 11 electronic signature audit logs.

### Pillar 5: Production Engineering & Cloud Deployment
* **Containerization (`docker-compose.yml`)**: Multi-container stack with PostgreSQL 16, FastAPI backend, and Nginx reverse proxy serving the production Vite React build.
* **Zero-Config Enterprise Seed Mode**: Automatically provisions 4 realistic role personas and compliant complaint case files upon first startup.

---

## 👥 Pre-Configured Enterprise Personas (Demo Credentials)

All personas share password: `Password123`

| Persona | Role | Username | Permissions |
|---|---|---|---|
| **Dr. Elena Rostova** | QualityAssurance | `qa_lead` | QA Lead/QP: Final sign-off on CAPA and Complaint Closure |
| **Dr. Marcus Vance** | Investigator | `investigator_1` | Conducts 5-Whys, laboratory review, root cause sign-off |
| **Alex Rivera** | IntakeSpecialist | `intake_clerk` | Document intake, PDF upload, and preliminary triage |
| **Inspector Jonathan Hayes** | Auditor | `auditor_ext` | Read-only FDA/EMA regulatory audit and dossier review |

---

## ⚙️ Running Locally

### Option A: Local Development (Python + Vite)

1. **Backend**:
   ```powershell
   cd backend
   pip install -r requirements.txt
   python -m uvicorn app.main:app --reload --port 8000
   ```

2. **Frontend**:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Option B: Production Docker Deployment

Spin up the entire stack (PostgreSQL + FastAPI + React SPA + Nginx) with one command:

```powershell
docker compose up -d --build
```
* **Frontend Web App**: [http://localhost](http://localhost) (or port 80/3000)
* **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **PostgreSQL Database**: Port 5432

---

## 🧪 Automated Test Verification

Run backend integration test suite:
```powershell
python backend/test_backend.py
```
*Ran 8 tests | OK | 21 CFR Part 11 Signatures & Enterprise Data Seeded.*
