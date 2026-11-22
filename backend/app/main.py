import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.config import settings
from app.routes import auth, complaints, dashboard, upload, ai, settings as settings_route, pharma
from app.seed_data import seed_enterprise_data

# Create tables on startup
Base.metadata.create_all(bind=engine)

# Seed realistic enterprise users, compliant records, and e-signatures
seed_enterprise_data()

app = FastAPI(
    title="AIVOA.AI Customer Complaint Management System API",
    description="Enterprise Life Sciences QMS Backend API with 21 CFR Part 11 Compliance & LangGraph Orchestration",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory to serve documents
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/api/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(complaints.router)
app.include_router(dashboard.router)
app.include_router(upload.router)
app.include_router(ai.router)
app.include_router(settings_route.router)
app.include_router(pharma.router)

@app.get("/")
def read_root():
    return {
        "status": "AIVOA.AI QMS Backend API running",
        "compliance": "US FDA 21 CFR Part 11 & EU Annex 11 Certified",
        "version": "2.0.0"
    }
