from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session, select
from typing import List
import os
import shutil
import uuid
import hashlib
import magic
from ..database import get_session
from ..models import Document, Case, AuditLog, Profile
from .auth import get_current_user, RoleChecker
from ..config import settings

router = APIRouter()
any_member = RoleChecker(["admin", "volunteer", "reviewer", "observer"])
can_modify = RoleChecker(["admin", "volunteer"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
ALLOWED_MIME_TYPES = {"application/pdf", "image/png", "image/jpeg"}

@router.post("/upload/{case_id}", response_model=Document)
async def upload_document(
    case_id: uuid.UUID,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: Profile = Depends(can_modify)
):
    # 1. Validate case exists
    case = session.get(Case, case_id)
    if not case or case.workspace_id != current_user.workspace_id:
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    # 2. Basic extension validation
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="File extension not allowed")

    # 3. Read content for validation
    content = await file.read()
    file_size = len(content)
    
    # 4. Validate file size
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max size 10MB.")

    # 5. MIME Type Validation (Magic)
    mime_type = magic.from_buffer(content, mime=True)
    if mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid MIME type: {mime_type}")

    # 6. Checksum (SHA-256)
    checksum = hashlib.sha256(content).hexdigest()

    # 7. Prepare storage path (Per-case folder)
    file_id = uuid.uuid4()
    case_upload_dir = os.path.join(settings.UPLOAD_DIR, str(case_id))
    os.makedirs(case_upload_dir, exist_ok=True)
    
    safe_filename = f"{file_id}{file_ext}"
    storage_path = os.path.join(case_upload_dir, safe_filename)

    # 8. Save file locally
    with open(storage_path, "wb") as buffer:
        buffer.write(content)

    # 9. Save metadata to DB
    new_doc = Document(
        id=file_id,
        case_id=case_id,
        file_name=file.filename,
        storage_path=storage_path,
        file_type=file.content_type,
        mime_type=mime_type,
        file_size=file_size,
        checksum=checksum,
        status="uploaded"
    )
    session.add(new_doc)
    
    # 10. Audit Log
    audit = AuditLog(
        workspace_id=case.workspace_id,
        user_id=current_user.id,
        action="DOCUMENT_UPLOAD",
        resource_type="document",
        resource_id=new_doc.id,
        details=f"Uploaded: {file.filename}, Size: {file_size}, Checksum: {checksum}"
    )
    session.add(audit)
    
    session.commit()
    session.refresh(new_doc)
    
    return new_doc

@router.get("/{document_id}/metadata", response_model=Document)
async def get_document_metadata(
    document_id: uuid.UUID, 
    session: Session = Depends(get_session),
    current_user: Profile = Depends(any_member)
):
    doc = session.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    case = session.get(Case, doc.case_id)
    if not case or case.workspace_id != current_user.workspace_id:
        raise HTTPException(status_code=404, detail="Document not found or access denied")
    
    # Audit Log
    audit = AuditLog(
        workspace_id=case.workspace_id,
        user_id=current_user.id,
        action="DOCUMENT_METADATA_READ",
        resource_type="document",
        resource_id=doc.id
    )
    session.add(audit)
    session.commit()
    
    return doc

@router.get("/case/{case_id}", response_model=List[Document])
async def list_case_documents(
    case_id: uuid.UUID, 
    session: Session = Depends(get_session),
    current_user: Profile = Depends(any_member)
):
    case = session.get(Case, case_id)
    if not case or case.workspace_id != current_user.workspace_id:
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    documents = session.exec(select(Document).where(Document.case_id == case_id)).all()
    return documents

@router.delete("/{document_id}")
async def delete_document(
    document_id: uuid.UUID, 
    session: Session = Depends(get_session),
    current_user: Profile = Depends(can_modify)
):
    doc = session.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    case = session.get(Case, doc.case_id)
    if not case or case.workspace_id != current_user.workspace_id:
        raise HTTPException(status_code=404, detail="Document not found or access denied")

    # 1. Remove local file
    if os.path.exists(doc.storage_path):
        os.remove(doc.storage_path)

    # 2. Add Audit Log
    audit = AuditLog(
        workspace_id=case.workspace_id,
        user_id=current_user.id,
        action="DOCUMENT_DELETE",
        resource_type="document",
        resource_id=doc.id,
        details=f"Deleted file: {doc.file_name}"
    )
    session.add(audit)

    # 3. Delete DB record
    session.delete(doc)
    session.commit()
    
    return {"ok": True, "message": f"Document {doc.file_name} deleted successfully"}
