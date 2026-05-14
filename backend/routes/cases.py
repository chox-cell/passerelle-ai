from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List
from ..database import get_session
from ..models import Case, Profile
from .auth import get_current_user, RoleChecker
import uuid

router = APIRouter()
any_volunteer = RoleChecker(["admin", "volunteer"])
any_member = RoleChecker(["admin", "volunteer", "reviewer", "observer"])
admin_only = RoleChecker(["admin"])

@router.post("/", response_model=Case)
async def create_case(
    case: Case, 
    session: Session = Depends(get_session),
    current_user: Profile = Depends(any_volunteer)
):
    session.add(case)
    session.commit()
    session.refresh(case)
    return case

@router.get("/", response_model=List[Case])
async def list_cases(
    offset: int = 0,
    limit: int = Query(default=100, lte=100),
    session: Session = Depends(get_session),
    current_user: Profile = Depends(any_member)
):
    # Only list cases for current workspace
    cases = session.exec(
        select(Case)
        .where(Case.workspace_id == current_user.workspace_id)
        .offset(offset)
        .limit(limit)
    ).all()
    return cases

@router.get("/{case_id}", response_model=Case)
async def get_case(
    case_id: uuid.UUID, 
    session: Session = Depends(get_session),
    current_user: Profile = Depends(any_member)
):
    case = session.get(Case, case_id)
    if not case or case.workspace_id != current_user.workspace_id:
        raise HTTPException(status_code=404, detail="Case not found or access denied")
    return case

@router.patch("/{case_id}", response_model=Case)
async def update_case(
    case_id: uuid.UUID, 
    case_update: dict, 
    session: Session = Depends(get_session),
    current_user: Profile = Depends(any_volunteer)
):
    db_case = session.get(Case, case_id)
    if not db_case or db_case.workspace_id != current_user.workspace_id:
        raise HTTPException(status_code=404, detail="Case not found or access denied")
    
    # ... update logic ...
    for key, value in case_update.items():
        setattr(db_case, key, value)
    
    session.add(db_case)
    session.commit()
    session.refresh(db_case)
    return db_case

@router.delete("/{case_id}")
async def delete_case(
    case_id: uuid.UUID, 
    session: Session = Depends(get_session),
    current_user: Profile = Depends(admin_only)
):
    case = session.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    session.delete(case)
    session.commit()
    return {"ok": True}
