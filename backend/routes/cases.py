from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List
from ..database import get_session
from ..models import Case
import uuid

router = APIRouter()

@router.post("/", response_model=Case)
async def create_case(case: Case, session: Session = Depends(get_session)):
    session.add(case)
    session.commit()
    session.refresh(case)
    return case

@router.get("/", response_model=List[Case])
async def list_cases(
    offset: int = 0,
    limit: int = Query(default=100, lte=100),
    session: Session = Depends(get_session)
):
    cases = session.exec(select(Case).offset(offset).limit(limit)).all()
    return cases

@router.get("/{case_id}", response_model=Case)
async def get_case(case_id: uuid.UUID, session: Session = Depends(get_session)):
    case = session.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@router.patch("/{case_id}", response_model=Case)
async def update_case(case_id: uuid.UUID, case_update: dict, session: Session = Depends(get_session)):
    db_case = session.get(Case, case_id)
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    case_data = case_update
    for key, value in case_data.items():
        setattr(db_case, key, value)
    
    session.add(db_case)
    session.commit()
    session.refresh(db_case)
    return db_case

@router.delete("/{case_id}")
async def delete_case(case_id: uuid.UUID, session: Session = Depends(get_session)):
    case = session.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    session.delete(case)
    session.commit()
    return {"ok": True}
