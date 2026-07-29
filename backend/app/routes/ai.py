from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app import auth, models, schemas
from app.ai_agent import analyze_complaint_document, run_heuristic_analysis, run_llm_analysis
from app.config import settings

router = APIRouter(prefix="/api/ai", tags=["AI Copilot"])

class AnalyzeRequest(BaseModel):
    file_path: str
    file_type: str
    file_name: str

class AnalyzeTextRequest(BaseModel):
    text: str

@router.post("/analyze", response_model=schemas.AIExtractionResult)
def analyze_document(
    req: AnalyzeRequest,
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        result = analyze_complaint_document(req.file_path, req.file_type, req.file_name)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI workflow execution failed: {str(e)}"
        )

@router.post("/analyze/text", response_model=schemas.AIExtractionResult)
def analyze_text(
    req: AnalyzeTextRequest,
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        # If API key is available, run real LLM analysis
        if settings.GROQ_API_KEY and len(settings.GROQ_API_KEY.strip()) > 5:
            try:
                result = run_llm_analysis(req.text)
                return result
            except Exception:
                pass
        
        # Fallback to heuristics
        result = run_heuristic_analysis(req.text)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI text analysis failed: {str(e)}"
        )
