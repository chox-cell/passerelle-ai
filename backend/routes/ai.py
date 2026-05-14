from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
import uuid
import json
from datetime import datetime
from ..database import get_session
from ..models import Document, ExtractionResult, Case, AuditLog, Profile, OCRResult
from .auth import get_current_user, RoleChecker
from .privacy import verify_consent
from ..services.local_extractor import extract_structured_data_from_text

from pydantic import BaseModel

router = APIRouter()
any_member = RoleChecker(["admin", "volunteer", "reviewer", "observer"])
can_extract = RoleChecker(["admin", "volunteer"])
can_review = RoleChecker(["admin", "reviewer"])

# Request model for review
class ExtractionReviewRequest(BaseModel):
    is_verified: bool
    verified_by: Optional[uuid.UUID] = None
    corrections: Optional[dict] = None

def format_extraction(extraction: ExtractionResult) -> dict:
    """Helper to ensure proper serialization and JSON parsing"""
    try:
        parsed_json = json.loads(extraction.raw_json)
    except:
        parsed_json = extraction.raw_json
        
    return {
        "id": str(extraction.id),
        "document_id": str(extraction.document_id),
        "raw_json": parsed_json,
        "confidence_score": extraction.confidence_score,
        "is_verified": extraction.is_verified,
        "verified_by": str(extraction.verified_by) if extraction.verified_by else None,
        "created_at": extraction.created_at.isoformat()
    }

@router.post("/documents/{document_id}/mock-extract")
async def mock_extract(
    document_id: uuid.UUID, 
    session: Session = Depends(get_session),
    current_user: Profile = Depends(can_extract)
):
    # 1. Validate document exists
    doc = session.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    
    case = session.get(Case, doc.case_id)
    if not case or case.workspace_id != current_user.workspace_id:
        raise HTTPException(status_code=404, detail="Document non trouvé ou accès refusé")

    # 2. Verify Consent
    verify_consent(doc.case_id, "ai_extraction", session)

    # 3. Create realistic mock data
    mock_data = {
        "document_type": "Titre de Séjour (Récépissé)",
        "institution": "Préfecture de Police de Paris",
        "important_dates": ["2026-05-13", "2026-08-12"],
        "possible_deadline": "2026-08-12",
        "required_actions": "Renouvellement à prévoir 2 mois avant l'échéance.",
        "summary_fr": "Récépissé de demande de renouvellement de titre de séjour. Autorise le travail.",
        "confidence_score": 0.95,
        "uncertainty_notes": "Le numéro de dossier est partiellement illisible sur le bord droit.",
        "disclaimer": "Information à vérifier avec un professionnel qualifié ou une association spécialisée."
    }

    # 4. Save ExtractionResult
    extraction = ExtractionResult(
        document_id=document_id,
        raw_json=json.dumps(mock_data),
        confidence_score=0.95,
        is_verified=False
    )
    session.add(extraction)

    # 5. Audit Log
    audit = AuditLog(
        workspace_id=case.workspace_id,
        user_id=current_user.id,
        action="EXTRACTION_MOCK_GENERATED",
        resource_type="extraction",
        resource_id=extraction.id,
        details=f"Mock extraction générée pour {doc.file_name}"
    )
    session.add(audit)

    # 6. Set status
    doc.status = "human_review_required"
    session.add(doc)

    session.commit()
    session.refresh(extraction)
    
    return format_extraction(extraction)

@router.get("/documents/{document_id}/extraction")
async def get_extraction(
    document_id: uuid.UUID, 
    session: Session = Depends(get_session),
    current_user: Profile = Depends(any_member)
):
    doc = session.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    
    case = session.get(Case, doc.case_id)
    if not case or case.workspace_id != current_user.workspace_id:
        raise HTTPException(status_code=404, detail="Document non trouvé ou accès refusé")
    statement = select(ExtractionResult).where(ExtractionResult.document_id == document_id).order_by(ExtractionResult.created_at.desc())
    extraction = session.exec(statement).first()
    
    if not extraction:
        raise HTTPException(status_code=404, detail="Aucune extraction trouvée pour ce document")

    # Audit Log
    audit = AuditLog(
        workspace_id=case.workspace_id,
        user_id=current_user.id,
        action="EXTRACTION_VIEWED",
        resource_type="extraction",
        resource_id=extraction.id
    )
    session.add(audit)
    session.commit()

    return format_extraction(extraction)

@router.patch("/extractions/{extraction_id}/review")
async def review_extraction(
    extraction_id: uuid.UUID, 
    review: ExtractionReviewRequest,
    session: Session = Depends(get_session),
    current_user: Profile = Depends(can_review)
):
    extraction = session.get(ExtractionResult, extraction_id)
    if not extraction:
        raise HTTPException(status_code=404, detail="Extraction non trouvée")
    
    doc = session.get(Document, extraction.document_id)
    case = session.get(Case, doc.case_id) if doc else None
    if not case or case.workspace_id != current_user.workspace_id:
        raise HTTPException(status_code=404, detail="Extraction non trouvée ou accès refusé")

    # Update data
    extraction.is_verified = review.is_verified
    extraction.verified_by = review.verified_by
    
    if review.corrections:
        extraction.raw_json = json.dumps(review.corrections)
    
    # Update document status if approved
    if review.is_verified:
        doc = session.get(Document, extraction.document_id)
        if doc:
            doc.status = "approved"
            session.add(doc)

    # Audit Log
    audit = AuditLog(
        workspace_id=case.workspace_id,
        user_id=current_user.id,
        action="EXTRACTION_REVIEWED",
        resource_type="extraction",
        resource_id=extraction.id,
        details=f"Vérifié: {review.is_verified}"
    )
    session.add(audit)

    session.commit()
    session.refresh(extraction)
    
    return format_extraction(extraction)

@router.post("/documents/{document_id}/extract-from-reviewed-ocr")
async def extract_from_ocr(
    document_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: Profile = Depends(can_review)
):
    # 1. Validate doc and workspace
    doc = session.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    
    case = session.get(Case, doc.case_id)
    if not case or case.workspace_id != current_user.workspace_id:
        raise HTTPException(status_code=404, detail="Accès refusé")

    # 2. Verify Consent
    verify_consent(doc.case_id, "ai_extraction", session)

    # 3. Get Reviewed OCR
    ocr_statement = select(OCRResult).where(
        OCRResult.document_id == document_id,
        OCRResult.is_reviewed == True
    ).order_by(OCRResult.created_at.desc())
    ocr_result = session.exec(ocr_statement).first()

    if not ocr_result:
        raise HTTPException(
            status_code=400, 
            detail="Le texte OCR doit être validé par un humain avant l'extraction structurée."
        )

    # 4. Extract
    text_to_parse = ocr_result.corrected_text or ocr_result.extracted_text
    structured_data = extract_structured_data_from_text(text_to_parse)

    # 5. Save ExtractionResult
    extraction = ExtractionResult(
        document_id=document_id,
        raw_json=json.dumps(structured_data),
        confidence_score=structured_data["confidence_score"],
        is_verified=False
    )
    session.add(extraction)

    # 6. Audit & Status
    audit = AuditLog(
        workspace_id=case.workspace_id,
        user_id=current_user.id,
        action="OCR_STRUCTURED_EXTRACTION_GENERATED",
        resource_type="extraction",
        resource_id=extraction.id
    )
    session.add(audit)
    
    doc.status = "human_review_required"
    session.add(doc)
    
    session.commit()
    session.refresh(extraction)

    return format_extraction(extraction)
