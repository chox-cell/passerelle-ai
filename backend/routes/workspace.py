from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select
from typing import List, Optional
import uuid
from ..database import get_session
from ..models.models import Profile, Workspace
from .auth import get_current_user, RoleChecker, throw_auth_error
from ..services.auth_utils import hash_password

router = APIRouter(prefix="/workspace", tags=["workspace"])
admin_only = RoleChecker(["admin"])

class MemberCreate(BaseModel):
    email: EmailStr
    full_name: str
    role: str # admin, volunteer, reviewer, observer
    password: str

@router.get("/me", response_model=Workspace)
async def get_workspace_me(
    current_user: Profile = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    workspace = session.get(Workspace, current_user.workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace

@router.get("/members", response_model=List[Profile])
async def list_members(
    current_user: Profile = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    statement = select(Profile).where(Profile.workspace_id == current_user.workspace_id)
    return session.exec(statement).all()

@router.post("/members", response_model=Profile)
async def add_member(
    member_data: MemberCreate,
    current_user: Profile = Depends(admin_only),
    session: Session = Depends(get_session)
):
    # 1. Check if email already exists
    existing = session.exec(select(Profile).where(Profile.email == member_data.email)).first()
    if existing:
        throw_auth_error("Cet email est déjà utilisé.")

    # 2. Validate role
    allowed_roles = ["admin", "volunteer", "reviewer", "observer"]
    if member_data.role not in allowed_roles:
        raise HTTPException(status_code=400, detail=f"Rôle invalide. Choisir parmi : {allowed_roles}")

    # 3. Create Profile
    new_profile = Profile(
        email=member_data.email,
        password_hash=hash_password(member_data.password),
        full_name=member_data.full_name,
        role=member_data.role,
        workspace_id=current_user.workspace_id
    )
    session.add(new_profile)
    session.commit()
    session.refresh(new_profile)
    return new_profile
