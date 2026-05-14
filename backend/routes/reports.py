from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlmodel import Session, select
from typing import List
import uuid
import os
import json
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

from ..database import get_session
from ..models import Case, Document, ExtractionResult, Task, AuditLog, Consent, Report, Profile
from .auth import get_current_user, RoleChecker
from ..config import settings

router = APIRouter()
any_member = RoleChecker(["admin", "volunteer", "reviewer", "observer"])
can_generate = RoleChecker(["admin", "volunteer", "reviewer"])

DISCLAIMER = "Information à vérifier avec un professionnel qualifié ou une association spécialisée."

@router.post("/cases/{case_id}/generate", response_model=Report)
async def generate_report(
    case_id: uuid.UUID, 
    session: Session = Depends(get_session),
    current_user: Profile = Depends(can_generate)
):
    case = session.get(Case, case_id)
    if not case or case.workspace_id != current_user.workspace_id:
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    # 1. Gather Data
    docs = session.exec(select(Document).where(Document.case_id == case_id)).all()
    tasks = session.exec(select(Task).where(Task.case_id == case_id)).all()
    consents = session.exec(select(Consent).where(Consent.case_id == case_id)).all()
    
    # 2. Prepare File Path
    report_id = uuid.uuid4()
    case_reports_dir = os.path.join(settings.UPLOAD_DIR, str(case_id), "reports")
    os.makedirs(case_reports_dir, exist_ok=True)
    
    file_name = f"{report_id}.pdf"
    file_path = os.path.join(case_reports_dir, file_name)

    # 3. Generate PDF
    doc_template = SimpleDocTemplate(file_path, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    story.append(Paragraph(f"Rapport de Dossier : {case.migrant_name}", styles['Title']))
    story.append(Spacer(1, 12))
    
    # Metadata
    story.append(Paragraph(f"Date de génération : {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles['Normal']))
    story.append(Paragraph(f"ID Dossier : {case_id}", styles['Normal']))
    story.append(Spacer(1, 12))

    # Disclaimer
    story.append(Paragraph(f"<b>AVERTISSEMENT :</b> {DISCLAIMER}", styles['Italic']))
    story.append(Spacer(1, 12))

    # Consent
    story.append(Paragraph("Statut du Consentement", styles['Heading2']))
    for c in consents:
        status = "Accordé" if c.granted else "Refusé"
        story.append(Paragraph(f"- {c.consent_type} : {status} (par {c.granted_by})", styles['Normal']))
    story.append(Spacer(1, 12))

    # Copilot Summary
    if case.summary:
        story.append(Paragraph("Synthèse NGO Copilot", styles['Heading2']))
        story.append(Paragraph(case.summary, styles['Normal']))
        story.append(Spacer(1, 12))

    # Extractions
    story.append(Paragraph("Données Extraites (Validées)", styles['Heading2']))
    for doc in docs:
        ext = session.exec(select(ExtractionResult).where(
            ExtractionResult.document_id == doc.id,
            ExtractionResult.is_verified == True
        )).first()
        if ext:
            data = json.loads(ext.raw_json)
            story.append(Paragraph(f"Document : {doc.file_name}", styles['Heading3']))
            story.append(Paragraph(f"Type : {data.get('document_type')}", styles['Normal']))
            story.append(Paragraph(f"Institution : {data.get('institution')}", styles['Normal']))
            story.append(Paragraph(f"Résumé : {data.get('summary_fr')}", styles['Normal']))
            story.append(Spacer(1, 6))

    # Tasks
    if tasks:
        story.append(Paragraph("Tâches et Suivi", styles['Heading2']))
        for t in tasks:
            story.append(Paragraph(f"- [{t.status}] {t.title}: {t.description}", styles['Normal']))
        story.append(Spacer(1, 12))

    # Build PDF
    doc_template.build(story)

    # 4. Save Metadata
    new_report = Report(
        id=report_id,
        case_id=case_id,
        file_path=file_path
    )
    session.add(new_report)
    
    # 5. Audit Log
    audit = AuditLog(
        workspace_id=case.workspace_id,
        user_id=current_user.id,
        action="REPORT_GENERATED",
        resource_type="report",
        resource_id=new_report.id,
        details=f"PDF report generated for {case.migrant_name}"
    )
    session.add(audit)
    
    session.commit()
    session.refresh(new_report)
    
    return new_report

@router.get("/cases/{case_id}", response_model=List[Report])
async def list_reports(
    case_id: uuid.UUID, 
    session: Session = Depends(get_session),
    current_user: Profile = Depends(any_member)
):
    case = session.get(Case, case_id)
    if not case or case.workspace_id != current_user.workspace_id:
        raise HTTPException(status_code=404, detail="Case not found or access denied")
        
    return session.exec(select(Report).where(Report.case_id == case_id)).all()

@router.get("/{report_id}/download")
async def download_report(
    report_id: uuid.UUID, 
    session: Session = Depends(get_session),
    current_user: Profile = Depends(any_member)
):
    report = session.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="Physical file not found")

    # Audit Log
    audit = AuditLog(
        workspace_id=case.workspace_id if case else None,
        user_id=current_user.id,
        action="REPORT_DOWNLOADED",
        resource_type="report",
        resource_id=report.id
    )
    session.add(audit)
    session.commit()

    return FileResponse(
        report.file_path, 
        filename=f"Rapport_Passerelle_{report.id.hex[:8]}.pdf",
        media_type="application/pdf"
    )
