from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# --- Auth Schemas ---
class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: Optional[str] = None
    role: Optional[str] = "User"

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    full_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None

# --- Document Schemas ---
class DocumentResponse(BaseModel):
    id: int
    complaint_id: int
    file_path: str
    file_type: str
    file_name: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

# --- Risk Assessment Schemas ---
class RiskAssessmentCreate(BaseModel):
    severity_score: int = Field(..., ge=1, le=5)
    probability_score: int = Field(..., ge=1, le=5)
    rationale: Optional[str] = None

class RiskAssessmentResponse(BaseModel):
    id: int
    complaint_id: int
    severity_score: int
    probability_score: int
    risk_priority_number: int
    rationale: Optional[str]
    assessed_at: datetime

    class Config:
        from_attributes = True

# --- Audit Log Schemas ---
class AuditLogResponse(BaseModel):
    id: int
    complaint_id: Optional[int]
    user_id: Optional[int]
    action: str
    description: Optional[str]
    timestamp: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True

# --- Complaint Schemas ---
class ComplaintCreate(BaseModel):
    customer_name: Optional[str] = None
    company_name: Optional[str] = None
    product_name: Optional[str] = None
    batch_number: Optional[str] = None
    complaint_type: Optional[str] = None
    description: Optional[str] = None
    summary: Optional[str] = None
    severity: Optional[str] = "Minor"
    risk_level: Optional[str] = "Low"
    capa: Optional[str] = None
    status: Optional[str] = "OPEN"
    assigned_to: Optional[str] = None
    priority: Optional[str] = "Low"
    root_cause: Optional[str] = None
    suggested_investigation: Optional[str] = None
    recommended_department: Optional[str] = None
    summary_confidence: Optional[int] = 95
    risk_confidence: Optional[int] = 95
    extraction_confidence: Optional[int] = 95
    complaint_date: Optional[str] = None
    mfg_date: Optional[str] = None
    exp_date: Optional[str] = None
    country: Optional[str] = None
    attachment_name: Optional[str] = None

class ComplaintUpdate(BaseModel):
    customer_name: Optional[str] = None
    company_name: Optional[str] = None
    product_name: Optional[str] = None
    batch_number: Optional[str] = None
    complaint_type: Optional[str] = None
    description: Optional[str] = None
    summary: Optional[str] = None
    severity: Optional[str] = None
    risk_level: Optional[str] = None
    capa: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: Optional[str] = None
    root_cause: Optional[str] = None
    suggested_investigation: Optional[str] = None
    recommended_department: Optional[str] = None
    complaint_date: Optional[str] = None
    mfg_date: Optional[str] = None
    exp_date: Optional[str] = None
    country: Optional[str] = None
    attachment_name: Optional[str] = None

class ComplaintResponse(BaseModel):
    id: int
    customer_name: Optional[str]
    company_name: Optional[str]
    product_name: Optional[str]
    batch_number: Optional[str]
    complaint_type: Optional[str]
    description: Optional[str]
    summary: Optional[str]
    severity: str
    risk_level: str
    capa: Optional[str]
    status: str
    assigned_to: Optional[str]
    priority: str
    root_cause: Optional[str]
    suggested_investigation: Optional[str]
    recommended_department: Optional[str]
    summary_confidence: int
    risk_confidence: int
    extraction_confidence: int
    complaint_date: Optional[str] = None
    mfg_date: Optional[str] = None
    exp_date: Optional[str] = None
    country: Optional[str] = None
    attachment_name: Optional[str] = None
    duplicate_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime
    documents: List[DocumentResponse] = []
    risk_assessments: List[RiskAssessmentResponse] = []
    audit_logs: List[AuditLogResponse] = []

    class Config:
        from_attributes = True

# --- Dashboard Stats Schemas ---
class RiskDistribution(BaseModel):
    high: int
    medium: int
    low: int

class StatusDistribution(BaseModel):
    open: int
    under_review: int
    investigation: int
    capa: int
    verification: int
    closed: int

class MonthlyTrend(BaseModel):
    month: str
    count: int

class DashboardStatsResponse(BaseModel):
    total_complaints: int
    open_complaints: int
    closed_complaints: int
    risk_distribution: RiskDistribution
    status_distribution: StatusDistribution
    recent_complaints: List[ComplaintResponse]
    monthly_trends: List[MonthlyTrend]

# --- AI Extracted Response ---
class AIExtractionResult(BaseModel):
    customer_name: Optional[str] = None
    company_name: Optional[str] = None
    product_name: Optional[str] = None
    batch_number: Optional[str] = None
    complaint_type: Optional[str] = None
    description: Optional[str] = None
    summary: Optional[str] = None
    complaint_date: Optional[str] = None
    mfg_date: Optional[str] = None
    exp_date: Optional[str] = None
    country: Optional[str] = None
    attachment_name: Optional[str] = None
    severity: Optional[str] = "Minor"
    risk_level: Optional[str] = "Low"
    priority: Optional[str] = "Low"
    severity_score: Optional[int] = 1
    probability_score: Optional[int] = 1
    rationale: Optional[str] = None
    capa: Optional[str] = None
    root_cause: Optional[str] = None
    suggested_investigation: Optional[str] = None
    recommended_department: Optional[str] = None
    summary_confidence: Optional[int] = 98
    risk_confidence: Optional[int] = 96
    extraction_confidence: Optional[int] = 99

# --- Settings Schemas ---
class SettingsResponse(BaseModel):
    database_url: str
    upload_dir: str
    has_groq_key: bool
    ai_provider: str
    ai_model: str
    temperature: float
    max_tokens: int

class SettingsUpdateRequest(BaseModel):
    groq_api_key: str
    ai_provider: str
    ai_model: str
    temperature: float
    max_tokens: int
