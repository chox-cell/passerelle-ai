from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
import uuid
import os
import shutil
from ..database import get_session
from ..models import Case, Document, ExtractionResult, Task, AuditLog, Consent, Profile
from .auth import get_current_user, RoleChecker
from ..config import settings

router = APIRouter()
admin_only = RoleChecker(["admin"])
any_volunteer = RoleChecker(["admin", "volunteer"])

def verify_consent(case_id: uuid.UUID, consent_type: str, session: Session):
    statement = select(Consent).where(
        Consent.case_id == case_id,
        Consent.consent_type == consent_type,
        Consent.granted == True
    )
    result = session.exec(statement).first()
    if not result:
        raise HTTPException(
            status_code=403, 
            detail="Consentement requis avant le traitement des données."
        )
    return True

@router.post("/cases/{case_id}/consent", response_model=Consent)
async def create_consent(
    case_id: uuid.UUID, 
    consent: Consent, 
    session: Session = Depends(get_session),
    current_user: Profile = Depends(any_volunteer)
):
    case = session.get(Case, case_id)
    if not case or case.workspace_id != current_user.workspace_id:
        raise HTTPException(status_code=404, detail="Case not found")
    
    consent.case_id = case_id
    session.add(consent)
    
    # Audit Log
    audit = AuditLog(
        workspace_id=case.workspace_id,
        user_id=current_user.id,
        action="CONSENT_GRANTED" if consent.granted else "CONSENT_REFUSED",
        resource_type="consent",
        resource_id=consent.id,
        details=f"Type: {consent.consent_type}, Granted by: {consent.granted_by}"
    )
    session.add(audit)
    
    session.commit()
    session.refresh(consent)
    return consent

@router.get("/cases/{case_id}/consents", response_model=List[Consent])
async def list_consents(
    case_id: uuid.UUID, 
    session: Session = Depends(get_session),
    current_user: Profile = Depends(any_volunteer)
):
    case = session.get(Case, case_id)
    if not case or case.workspace_id != current_user.workspace_id:
        raise HTTPException(status_code=404, detail="Case not found")
        
    statement = select(Consent).where(Consent.case_id == case_id)
    return session.exec(statement).all()

@router.delete("/cases/{case_id}/delete-all")
async def delete_all_data(
    case_id: uuid.UUID, 
    session: Session = Depends(get_session),
    current_user: Profile = Depends(admin_only)
):
    case = session.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # 1. Audit Log (before deletion)
    audit = AuditLog(
        workspace_id=case.workspace_id,
        action="FULL_CASE_DELETION",
        resource_type="case",
        resource_id=case.id,
        details=f"Permanent deletion of all data for case: {case.migrant_name}"
    )
    session.add(audit)
    session.commit() # Save log before clearing related data

    # 2. Delete local files
    case_upload_dir = os.path.join(settings.UPLOAD_DIR, str(case_id))
    if os.path.exists(case_upload_dir):
        shutil.rmtree(case_upload_dir)

    # 3. Cascading delete is handled by DB relationships in schema.sql, 
    # but for SQLModel we ensure we clean up.
    
    # Delete related records
    session.exec(select(Task).where(Task.case_id == case_id)).delete()
    session.exec(select(Consent).where(Consent.case_id == case_id)).delete()
    
    # Delete documents and their extractions
    docs = session.exec(select(Document).where(Document.case_id == case_id)).all()
    for doc in docs:
        session.exec(select(ExtractionResult).where(ExtractionResult.document_id == doc.id)).delete()
        session.delete(doc)

    # 4. Delete the case
    session.delete(case)
    session.commit()

    return {"ok": True, "message": "Toutes les données associées au dossier ont été supprimées définitivement."}

@router.get("/cases/{case_id}/audit-logs", response_model=List[AuditLog])
async def get_audit_logs(
    case_id: uuid.UUID, 
    session: Session = Depends(get_session),
    current_user: Profile = Depends(any_volunteer)
):
    case = session.get(Case, case_id)
    if not case or case.workspace_id != current_user.workspace_id:
        raise HTTPException(status_code=404, detail="Case not found")

    statement = select(AuditLog).where(
        (AuditLog.workspace_id == current_user.workspace_id) &
        ((AuditLog.resource_id == case_id) | (AuditLog.resource_type == "case"))
    ).order_by(AuditLog.created_at.desc())
    return session.exec(statement).all()
