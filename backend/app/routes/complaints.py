from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import List, Optional
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

@router.post("", response_model=schemas.ComplaintResponse)
def create_complaint(
    complaint_in: schemas.ComplaintCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    complaint = models.Complaint(**complaint_in.model_dump())
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    
    # Create audit log
    audit_log = models.AuditLog(
        complaint_id=complaint.id,
        user_id=current_user.id,
        action="Create",
        description=f"Complaint created by {current_user.username}."
    )
    db.add(audit_log)
    db.commit()
    
    # If Critical or Adverse Event, send mock email alert
    if complaint.severity == "Critical" or complaint.complaint_type == "Safety/Adverse Event":
        email_log = models.AuditLog(
            complaint_id=complaint.id,
            user_id=current_user.id,
            action="Email Alert",
            description=f"SMTP: Critical Quality Warning email notification automatically dispatched to pv-safety@aivoa.com & manufacturing-vp@aivoa.com for batch {complaint.batch_number}."
        )
        db.add(email_log)
        db.commit()
        
    db.refresh(complaint)
    complaint.duplicate_count = db.query(models.Complaint).filter(
        models.Complaint.batch_number == complaint.batch_number, 
        models.Complaint.id != complaint.id
    ).count()
    return complaint

@router.get("", response_model=List[schemas.ComplaintResponse])
def get_complaints(
    search: Optional[str] = None,
    complaint_type: Optional[str] = None,
    severity: Optional[str] = None,
    risk_level: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Complaint)
    
    if search:
        query = query.filter(
            or_(
                models.Complaint.customer_name.ilike(f"%{search}%"),
                models.Complaint.company_name.ilike(f"%{search}%"),
                models.Complaint.product_name.ilike(f"%{search}%"),
                models.Complaint.batch_number.ilike(f"%{search}%"),
                models.Complaint.description.ilike(f"%{search}%"),
            )
        )
        
    if complaint_type:
        query = query.filter(models.Complaint.complaint_type == complaint_type)
    if severity:
        query = query.filter(models.Complaint.severity == severity)
    if risk_level:
        query = query.filter(models.Complaint.risk_level == risk_level)
    if status:
        query = query.filter(models.Complaint.status == status)
        
    # Order by newest
    query = query.order_by(desc(models.Complaint.created_at))
    
    complaints = query.offset(skip).limit(limit).all()
    for c in complaints:
        c.duplicate_count = db.query(models.Complaint).filter(
            models.Complaint.batch_number == c.batch_number, 
            models.Complaint.id != c.id
        ).count()
        
    return complaints

@router.get("/{id}", response_model=schemas.ComplaintResponse)
def get_complaint(
    id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    # Populate auditor names in logs to make it user-friendly
    for log in complaint.audit_logs:
        if log.user:
            log.user_name = log.user.full_name or log.user.username
        else:
            log.user_name = "System"
            
    complaint.duplicate_count = db.query(models.Complaint).filter(
        models.Complaint.batch_number == complaint.batch_number, 
        models.Complaint.id != complaint.id
    ).count()
    return complaint

@router.put("/{id}", response_model=schemas.ComplaintResponse)
def update_complaint(
    id: int, 
    complaint_in: schemas.ComplaintUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    update_data = complaint_in.model_dump(exclude_unset=True)
    
    changes = []
    for key, value in update_data.items():
        old_val = getattr(complaint, key)
        if old_val != value:
            setattr(complaint, key, value)
            changes.append(f"{key}: '{old_val}' -> '{value}'")
            
    if changes:
        db.commit()
        db.refresh(complaint)
        
        # Create audit log
        audit_log = models.AuditLog(
            complaint_id=complaint.id,
            user_id=current_user.id,
            action="Update",
            description=f"Updated properties: {', '.join(changes)}"
        )
        db.add(audit_log)
        db.commit()
        db.refresh(complaint)
        
    complaint.duplicate_count = db.query(models.Complaint).filter(
        models.Complaint.batch_number == complaint.batch_number, 
        models.Complaint.id != complaint.id
    ).count()
    return complaint

@router.delete("/{id}")
def delete_complaint(
    id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    # Create system audit log
    audit_log = models.AuditLog(
        complaint_id=None,
        user_id=current_user.id,
        action="Delete",
        description=f"Deleted complaint ID {id} ({complaint.product_name}, Batch {complaint.batch_number})."
    )
    db.add(audit_log)
    db.delete(complaint)
    db.commit()
    return {"message": "Complaint successfully deleted"}

@router.post("/{id}/risk", response_model=schemas.RiskAssessmentResponse)
def add_risk_assessment(
    id: int, 
    risk_in: schemas.RiskAssessmentCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    rpn = risk_in.severity_score * risk_in.probability_score
    
    # Classify risk level
    risk_level = "Low"
    if rpn >= 15:
        risk_level = "High"
    elif rpn >= 8:
        risk_level = "Medium"
        
    # Map severity score to category
    severity_map = {1: "Negligible", 2: "Minor", 3: "Moderate", 4: "Major", 5: "Critical"}
    severity_label = severity_map.get(risk_in.severity_score, "Minor")
    
    risk_assessment = models.RiskAssessment(
        complaint_id=id,
        severity_score=risk_in.severity_score,
        probability_score=risk_in.probability_score,
        risk_priority_number=rpn,
        rationale=risk_in.rationale
    )
    db.add(risk_assessment)
    
    # Update main complaint risk level and severity
    complaint.risk_level = risk_level
    # Map RPN or severity label
    if risk_in.severity_score >= 4:
        complaint.severity = "Critical" if risk_in.severity_score == 5 else "Major"
    else:
        complaint.severity = "Minor"

    # Create audit log
    audit_log = models.AuditLog(
        complaint_id=id,
        user_id=current_user.id,
        action="Risk Assessed",
        description=f"Risk Assessed: Severity={risk_in.severity_score}, Prob={risk_in.probability_score}, RPN={rpn}. Level set to {risk_level}."
    )
    db.add(audit_log)
    db.commit()
    db.refresh(risk_assessment)
    return risk_assessment
