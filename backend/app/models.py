import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="User")  # Admin, Investigator, QualityAssurance, User
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    audit_logs = relationship("AuditLog", back_populates="user")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    product_name = Column(String, nullable=True)
    batch_number = Column(String, nullable=True)
    complaint_type = Column(String, nullable=True)  # Safety/Adverse Event, Product Quality, Packaging/Labeling, Efficacy
    description = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    severity = Column(String, default="Minor")  # Minor, Major, Critical
    risk_level = Column(String, default="Low")   # Low, Medium, High
    capa = Column(Text, nullable=True)            # Corrective & Preventive Action recommendation
    status = Column(String, default="OPEN")       # OPEN, UNDER REVIEW, INVESTIGATION, CAPA, VERIFICATION, CLOSED
    assigned_to = Column(String, nullable=True)
    priority = Column(String, default="Low")       # Low, Medium, High
    root_cause = Column(Text, nullable=True)
    suggested_investigation = Column(Text, nullable=True)
    recommended_department = Column(String, nullable=True)
    summary_confidence = Column(Integer, default=95)
    risk_confidence = Column(Integer, default=95)
    extraction_confidence = Column(Integer, default=95)
    complaint_date = Column(String, nullable=True)
    mfg_date = Column(String, nullable=True)
    exp_date = Column(String, nullable=True)
    country = Column(String, nullable=True)
    attachment_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    documents = relationship("ComplaintDocument", back_populates="complaint", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="complaint", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="complaint", cascade="all, delete-orphan")

class ComplaintDocument(Base):
    __tablename__ = "complaint_documents"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # pdf, image, email
    file_name = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    complaint = relationship("Complaint", back_populates="documents")

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)
    severity_score = Column(Integer, default=1)   # 1 (Minor) to 5 (Critical)
    probability_score = Column(Integer, default=1)  # 1 (Unlikely) to 5 (Frequent)
    risk_priority_number = Column(Integer, default=1)  # severity * probability
    rationale = Column(Text, nullable=True)
    assessed_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    complaint = relationship("Complaint", back_populates="risk_assessments")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False)       # Create, Update, Delete, Risk Assessed, CAPA Suggestion, Closed
    description = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    complaint = relationship("Complaint", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")
