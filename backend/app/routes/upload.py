import os
import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.config import settings
from app import auth, models

router = APIRouter(prefix="/api/upload", tags=["Upload"])

@router.post("")
async def upload_document(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user)
):
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    
    # Determine type and subdirectory
    if ext == ".pdf":
        subfolder = "pdf"
        file_type = "pdf"
    elif ext in [".png", ".jpg", ".jpeg"]:
        subfolder = "images"
        file_type = "image"
    elif ext in [".txt", ".eml"]:
        subfolder = "emails"
        file_type = "email"
    else:
        # Fallback to email/text folder for generic text files
        subfolder = "emails"
        file_type = "email"
        
    # Generate unique filename to avoid duplicates
    unique_filename = f"{uuid.uuid4()}{ext}"
    dest_path = os.path.join(settings.UPLOAD_DIR, subfolder, unique_filename)
    
    try:
        with open(dest_path, "wb") as f:
            content = await file.read()
            f.write(content)
            
        return {
            "file_name": filename,
            "saved_name": unique_filename,
            "file_path": dest_path,
            "file_type": file_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
