from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
import uuid
import json
from ..database import get_session
from ..models import Case, Document, ExtractionResult, AuditLog, Task, Profile
from .auth import get_current_user, RoleChecker
from .privacy import verify_consent

router = APIRouter()
can_generate = RoleChecker(["admin", "volunteer"])

DISCLAIMER = "Information à vérifier avec un professionnel qualifié ou une association spécialisée."

def get_approved_extraction(case_id: uuid.UUID, session: Session):
    # Verify consent before proceeding
    verify_consent(case_id, "ai_extraction", session)
    
    # Find documents for this case
    docs_statement = select(Document).where(Document.case_id == case_id)
    documents = session.exec(docs_statement).all()
    
    if not documents:
        return None
    
    # Find latest approved extraction for these documents
    doc_ids = [doc.id for doc in documents]
    ext_statement = select(ExtractionResult).where(
        ExtractionResult.document_id.in_(doc_ids),
        ExtractionResult.is_verified == True
    ).order_by(ExtractionResult.created_at.desc())
    
    return session.exec(ext_statement).first()

@router.post("/cases/{case_id}/mock-summary")
async def mock_summary(
    case_id: uuid.UUID, 
    session: Session = Depends(get_session),
    current_user: Profile = Depends(can_generate)
):
    case = session.get(Case, case_id)
    if not case or case.workspace_id != current_user.workspace_id:
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    extraction = get_approved_extraction(case_id, session)
    if not extraction:
        raise HTTPException(
            status_code=400, 
            detail="Aucune extraction validée disponible. Veuillez faire vérifier le document par un bénévole."
        )

    data = json.loads(extraction.raw_json)
    
    summary = f"Synthèse du dossier pour {case.migrant_name or 'Usager'}.\n"
    summary += f"Document validé : {data.get('document_type')}.\n"
    summary += f"Institution : {data.get('institution')}.\n"
    summary += f"Résumé : {data.get('summary_fr')}\n\n{DISCLAIMER}"

    # Store in case summary
    case.summary = summary
    session.add(case)
    
    # Audit Log
    audit = AuditLog(
        workspace_id=case.workspace_id,
        user_id=current_user.id,
        action="COPILOT_SUMMARY_GENERATED",
        resource_type="case",
        resource_id=case.id,
        details="Mock summary generated from approved extraction."
    )
    session.add(audit)
    session.commit()

    return {"summary": summary}

@router.post("/cases/{case_id}/mock-email")
async def mock_email(
    case_id: uuid.UUID, 
    session: Session = Depends(get_session),
    current_user: Profile = Depends(can_generate)
):
    case = session.get(Case, case_id)
    if not case or case.workspace_id != current_user.workspace_id:
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    extraction = get_approved_extraction(case_id, session)
    if not extraction:
        raise HTTPException(
            status_code=400, 
            detail="Aucune extraction validée disponible. Veuillez faire vérifier le document par un bénévole."
        )

    data = json.loads(extraction.raw_json)
    
    email_body = f"Objet : Demande concernant le dossier de {case.migrant_name or 'M./Mme'}\n\n"
    email_body += f"Madame, Monsieur,\n\nJe vous contacte concernant le document '{data.get('document_type')}' "
    email_body += f"émis par {data.get('institution')}.\n\n"
    email_body += f"Actions prévues : {data.get('required_actions')}\n\nCordialement,\nLe bénévole Passerelle AI\n\n{DISCLAIMER}"

    # TODO: Store email in a dedicated table if needed later
    
    # Audit Log
    audit = AuditLog(
        workspace_id=case.workspace_id,
        user_id=current_user.id,
        action="COPILOT_EMAIL_GENERATED",
        resource_type="case",
        resource_id=case.id,
        details="Mock email draft generated."
    )
    session.add(audit)
    session.commit()

    return {"email": email_body}

@router.post("/cases/{case_id}/mock-tasks")
async def mock_tasks(
    case_id: uuid.UUID, 
    session: Session = Depends(get_session),
    current_user: Profile = Depends(can_generate)
):
    case = session.get(Case, case_id)
    if not case or case.workspace_id != current_user.workspace_id:
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    extraction = get_approved_extraction(case_id, session)
    if not extraction:
        raise HTTPException(
            status_code=400, 
            detail="Aucune extraction validée disponible. Veuillez faire vérifier le document par un bénévole."
        )

    data = json.loads(extraction.raw_json)
    
    # Create a mock task
    new_task = Task(
        case_id=case_id,
        title=f"Suivi : {data.get('document_type')}",
        description=f"Action requise : {data.get('required_actions')}. {DISCLAIMER}",
        status="todo"
    )
    session.add(new_task)
    
    # Audit Log
    audit = AuditLog(
        workspace_id=case.workspace_id,
        user_id=current_user.id,
        action="COPILOT_TASKS_GENERATED",
        resource_type="case",
        resource_id=case.id,
        details="Mock task created from extraction."
    )
    session.add(audit)
    session.commit()
    session.refresh(new_task)

    return {"tasks": [new_task]}
