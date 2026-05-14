from fastapi import APIRouter, Depends
from sqlmodel import Session, select
import os
from ..database import get_session, engine
from ..config import settings
from ..models import Case

router = APIRouter()

@router.get("/health")
async def health_check(session: Session = Depends(get_session)):
    # 1. DB Check
    db_ok = False
    try:
        session.exec(select(Case)).first()
        db_ok = True
    except Exception:
        db_ok = False

    # 2. Storage Check
    storage_ok = os.access(settings.UPLOAD_DIR, os.W_OK)

    return {
        "status": "online" if db_ok and storage_ok else "degraded",
        "database": "OK" if db_ok else "Error",
        "storage": "OK" if storage_ok else "Error",
        "upload_dir": settings.UPLOAD_DIR,
        "version": "1.0.0",
        "environment": "development"
    }
