from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from pydantic import BaseModel
from app.pharma_data import FDA_NDC_CATALOG, MEDDRA_TERMS_CATALOG, find_ndc_for_product, detect_meddra_terms
from app import auth, models

router = APIRouter(prefix="/api/pharma", tags=["Pharma Standardization"])

class StandardizeRequest(BaseModel):
    product_name: Optional[str] = None
    narrative: Optional[str] = None

class StandardizeResponse(BaseModel):
    ndc_match: Optional[dict] = None
    meddra_terms: List[str] = []
    adverse_event_flag: int = 0
    regulatory_alert: Optional[str] = None

@router.get("/ndc-catalog")
def get_ndc_catalog(current_user: models.User = Depends(auth.get_current_user)):
    return FDA_NDC_CATALOG

@router.get("/ndc-lookup")
def lookup_ndc(query: str = Query(..., min_length=2), current_user: models.User = Depends(auth.get_current_user)):
    q = query.lower()
    results = [
        item for item in FDA_NDC_CATALOG
        if q in item["product_name"].lower() or q in item["active_ingredient"].lower() or q in item["ndc_code"].lower()
    ]
    return results

@router.get("/meddra-catalog")
def get_meddra_catalog(current_user: models.User = Depends(auth.get_current_user)):
    return MEDDRA_TERMS_CATALOG

@router.get("/meddra-lookup")
def lookup_meddra(query: str = Query(..., min_length=2), current_user: models.User = Depends(auth.get_current_user)):
    q = query.lower()
    results = []
    for item in MEDDRA_TERMS_CATALOG:
        if q in item["pt"].lower() or q in item["soc"].lower() or any(q in kw for kw in item["keywords"]):
            results.append(item)
    return results

@router.post("/standardize", response_model=StandardizeResponse)
def standardize_complaint(req: StandardizeRequest, current_user: models.User = Depends(auth.get_current_user)):
    ndc_match = find_ndc_for_product(req.product_name) if req.product_name else None
    meddra_terms = detect_meddra_terms(req.narrative) if req.narrative else []
    
    # Check if adverse event
    is_ae = 0
    alert = None
    if req.narrative:
        narrative_lower = req.narrative.lower()
        if any(w in narrative_lower for w in ["adverse", "hospital", "died", "death", "severe", "anaphylaxis", "emergency", "reaction"]):
            is_ae = 1
            alert = "CRITICAL: Serious Adverse Event detected. 15-Day FDA MedWatch 3500A expedited reporting clock active under 21 CFR 314.80."
        elif len(meddra_terms) > 0 and any("disorder" in t for t in meddra_terms):
            is_ae = 1
            alert = "Adverse Drug Reaction identified. Document MedDRA preferred terms for safety surveillance."

    return {
        "ndc_match": ndc_match,
        "meddra_terms": meddra_terms,
        "adverse_event_flag": is_ae,
        "regulatory_alert": alert
    }
