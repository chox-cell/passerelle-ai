from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
import uuid
from typing import Optional
from pydantic import BaseModel

from ..database import get_session
from ..models import Document, OCRResult, Case, AuditLog, Profile
from .auth import get_current_user, RoleChecker
from ..services.ocr_service import extract_text
from .privacy import verify_consent

router = APIRouter()

# RBAC
can_extract = RoleChecker(["admin", "volunteer"])
can_review = RoleChecker(["admin", "reviewer"])
any_member = RoleChecker(["admin", "volunteer", "reviewer", "observer"])

class OCRReviewRequest(BaseModel):
    is_reviewed: bool
    corrected_text: Optional[str] = None

@router.post("/documents/{document_id}/extract", response_model=OCRResult)
async def run_ocr(
    document_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: Profile = Depends(can_extract)
):
    # 1. Validate document and workspace
    doc = session.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    
    case = session.get(Case, doc.case_id)
    if not case or case.workspace_id != current_user.workspace_id:
        raise HTTPException(status_code=404, detail="Document non trouvé ou accès refusé")

    # 2. Verify Consent
    verify_consent(doc.case_id, "ai_extraction", session)

    # 3. Update status
    doc.ocr_status = "processing"
    session.add(doc)
    session.commit()

    # 4. Run OCR
    try:
        ocr_data = extract_text(doc.storage_path, doc.mime_type)
        if "error" in ocr_data:
            doc.ocr_status = "failed"
            session.add(doc)
            session.commit()
            raise HTTPException(status_code=400, detail=ocr_data["error"])

        # 5. Save Result
        ocr_result = OCRResult(
            document_id=document_id,
            extracted_text=ocr_data["text"],
            engine=ocr_data["engine"],
            pages_processed=ocr_data["pages_processed"]
        )
        session.add(ocr_result)

        # 6. Finalize doc status
        doc.ocr_status = "completed"
        doc.status = "ocr_completed"
        session.add(doc)

        # 7. Audit
        audit = AuditLog(
            workspace_id=case.workspace_id,
            user_id=current_user.id,
            action="OCR_PERFORMED",
            resource_type="document",
            resource_id=doc.id,
            details=f"OCR engine: {ocr_data['engine']}, pages: {ocr_data['pages_processed']}"
        )
        session.add(audit)
        
        session.commit()
        session.refresh(ocr_result)
        return ocr_result

    except Exception as e:
        doc.ocr_status = "failed"
        session.add(doc)
        session.commit()
        raise HTTPException(status_code=500, detail=f"Erreur OCR: {str(e)}")

@router.get("/documents/{document_id}", response_model=Optional[OCRResult])
async def get_ocr_result(
    document_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: Profile = Depends(any_member)
):
    doc = session.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    
    case = session.get(Case, doc.case_id)
    if not case or case.workspace_id != current_user.workspace_id:
        raise HTTPException(status_code=404, detail="Accès refusé")

    statement = select(OCRResult).where(OCRResult.document_id == document_id).order_by(OCRResult.created_at.desc())
    return session.exec(statement).first()

@router.patch("/{ocr_result_id}/review", response_model=OCRResult)
async def review_ocr(
    ocr_result_id: uuid.UUID,
    review: OCRReviewRequest,
    session: Session = Depends(get_session),
    current_user: Profile = Depends(can_review)
):
    ocr_result = session.get(OCRResult, ocr_result_id)
    if not ocr_result:
        raise HTTPException(status_code=404, detail="Résultat OCR non trouvé")

    doc = session.get(Document, ocr_result.document_id)
    case = session.get(Case, doc.case_id)
    if not case or case.workspace_id != current_user.workspace_id:
        raise HTTPException(status_code=404, detail="Accès refusé")

    ocr_result.is_reviewed = review.is_reviewed
    ocr_result.reviewed_by = current_user.id
    if review.corrected_text:
        ocr_result.corrected_text = review.corrected_text

    # Update doc status
    if review.is_reviewed:
        doc.status = "human_review_required" # Ready for V1.4 Phase 2 (AI Extraction)
        session.add(doc)

    audit = AuditLog(
        workspace_id=case.workspace_id,
        user_id=current_user.id,
        action="OCR_REVIEWED",
        resource_type="ocr_result",
        resource_id=ocr_result.id
    )
    session.add(audit)
    
    session.commit()
    session.refresh(ocr_result)
    return ocr_result
