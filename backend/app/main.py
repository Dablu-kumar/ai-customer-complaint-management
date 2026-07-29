import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base, SessionLocal
from app.config import settings
from app.routes import auth, complaints, dashboard, upload, ai, settings as settings_route
from app import models, auth as auth_utils

# Create tables on startup
Base.metadata.create_all(bind=engine)

# Create a default user if none exists
def seed_default_user():
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.username == "qa_lead").first()
        if not user:
            hashed_pwd = auth_utils.get_password_hash("Password123")
            default_user = models.User(
                username="qa_lead",
                hashed_password=hashed_pwd,
                role="QualityAssurance",
                full_name="QA Lead Investigator"
            )
            db.add(default_user)
            db.commit()
    finally:
        db.close()

seed_default_user()

app = FastAPI(
    title="AIVOA.AI Customer Complaint Management System API",
    description="Backend services for AI-powered Customer Complaint Management System",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend origin
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

@app.get("/")
def read_root():
    return {"status": "AIVOA.AI QMS Backend API running"}
