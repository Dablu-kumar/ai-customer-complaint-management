import os
from fastapi import APIRouter, Depends, HTTPException
from app.config import settings
from app import auth, models, schemas

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("", response_model=schemas.SettingsResponse)
def get_settings(current_user: models.User = Depends(auth.get_current_user)):
    return {
        "database_url": settings.DATABASE_URL,
        "upload_dir": settings.UPLOAD_DIR,
        "has_groq_key": len(settings.GROQ_API_KEY.strip()) > 5,
        "ai_provider": settings.AI_PROVIDER,
        "ai_model": settings.AI_MODEL,
        "temperature": settings.TEMPERATURE,
        "max_tokens": settings.MAX_TOKENS
    }

@router.post("")
def update_settings(
    req: schemas.SettingsUpdateRequest,
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        # Update settings in-memory
        if not req.groq_api_key.startswith("••"):
            settings.GROQ_API_KEY = req.groq_api_key.strip()
            
        settings.AI_PROVIDER = req.ai_provider.strip()
        settings.AI_MODEL = req.ai_model.strip()
        settings.TEMPERATURE = req.temperature
        settings.MAX_TOKENS = req.max_tokens
        
        # Write to .env file
        env_path = "C:/Users/dablu/.gemini/antigravity/scratch/aivoa-ai/backend/.env"
        
        with open(env_path, "w", encoding="utf-8") as f:
            f.write(f"GROQ_API_KEY={settings.GROQ_API_KEY}\n")
            f.write(f"AI_PROVIDER={settings.AI_PROVIDER}\n")
            f.write(f"AI_MODEL={settings.AI_MODEL}\n")
            f.write(f"TEMPERATURE={settings.TEMPERATURE}\n")
            f.write(f"MAX_TOKENS={settings.MAX_TOKENS}\n")
            
        return {
            "message": "Settings updated successfully",
            "has_groq_key": len(settings.GROQ_API_KEY.strip()) > 5,
            "ai_provider": settings.AI_PROVIDER,
            "ai_model": settings.AI_MODEL,
            "temperature": settings.TEMPERATURE,
            "max_tokens": settings.MAX_TOKENS
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save settings: {str(e)}")
