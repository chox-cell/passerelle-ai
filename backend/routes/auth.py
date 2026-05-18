from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select
from typing import Optional
import uuid
from backend.database import get_session
from backend.models.models import Profile, Workspace, AuditLog
from backend.services.auth_utils import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    workspace_name: Optional[str] = "Défaut"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    workspace_id: str
    role: str

@router.post("/register", response_model=Token)
async def register(user_data: UserRegister, session: Session = Depends(get_session)):
    # 1. Check if user exists
    existing_user = session.exec(select(Profile).where(Profile.email == user_data.email)).first()
    if existing_user:
        throw_auth_error("Cet email est déjà utilisé.")

    # 2. Create or get Workspace
    workspace = session.exec(select(Workspace).where(Workspace.name == user_data.workspace_name)).first()
    if not workspace:
        workspace = Workspace(name=user_data.workspace_name)
        session.add(workspace)
        session.commit()
        session.refresh(workspace)

    # 3. Create Profile
    existing_profiles = session.exec(select(Profile).where(Profile.workspace_id == workspace.id)).first()
    assigned_role = "admin" if not existing_profiles else "volunteer"

    new_profile = Profile(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        full_name=user_data.full_name,
        role=assigned_role,
        workspace_id=workspace.id
    )
    session.add(new_profile)
    session.commit()
    session.refresh(new_profile)

    # 4. Generate Token
    token_data = {
        "sub": str(new_profile.id),
        "workspace_id": str(workspace.id),
        "role": new_profile.role
    }
    access_token = create_access_token(user.id, user.workspace_id, user.role)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(new_profile.id),
        "workspace_id": str(workspace.id),
        "role": new_profile.role
    }

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, session: Session = Depends(get_session)):
    user = session.exec(select(Profile).where(Profile.email == user_data.email)).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        # Audit failed login attempt
        failed_audit = AuditLog(
            action="LOGIN_FAILED",
            resource_type="auth",
            details=f"Email: {user_data.email}"
        )
        session.add(failed_audit)
        session.commit()
        throw_auth_error("Email ou mot de passe incorrect.")

    if not user.is_active:
        # Audit inactive login attempt
        failed_audit = AuditLog(
            workspace_id=user.workspace_id,
            user_id=user.id,
            action="LOGIN_FAILED_INACTIVE",
            resource_type="auth",
            details=f"Email: {user_data.email}"
        )
        session.add(failed_audit)
        session.commit()
        throw_auth_error("Utilisateur inactif. Veuillez contacter votre administrateur.")

    token_data = {
        "sub": str(user.id),
        "workspace_id": str(user.workspace_id),
        "role": user.role
    }
    access_token = create_access_token(user.id, user.workspace_id, user.role)

    # Audit successful login
    success_audit = AuditLog(
        workspace_id=user.workspace_id,
        user_id=user.id,
        action="LOGIN_SUCCESS",
        resource_type="auth"
    )
    session.add(success_audit)
    session.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user.id),
        "workspace_id": str(user.workspace_id),
        "role": user.role
    }

from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    from backend.services.auth_utils import decode_access_token
    payload = decode_access_token(token)
    if not payload:
        throw_auth_error("Jeton invalide ou expiré.")
    
    user_id = payload.get("sub")
    if not user_id:
        throw_auth_error("Jeton malformé.")
    
    # Handle both string and UUID types
    try:
        if isinstance(user_id, str):
            user_id = uuid.UUID(user_id)
    except ValueError:
        throw_auth_error("ID utilisateur invalide dans le jeton.")

    user = session.get(Profile, user_id)
    if not user:
        throw_auth_error("Utilisateur non trouvé.")
    
    if not user.is_active:
        throw_auth_error("Utilisateur inactif. Veuillez contacter votre administrateur.")
        
    return user

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: Profile = Depends(get_current_user)):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action réservée aux rôles : {', '.join(self.allowed_roles)}."
            )
        return user

@router.get("/me")
async def get_me(current_user: Profile = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "workspace_id": str(current_user.workspace_id)
    }

def throw_auth_error(detail: str):
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )
