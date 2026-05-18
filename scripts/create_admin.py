import sys
import os
from sqlmodel import Session, select

# Ensure backend modules can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database import engine, init_db
from backend.models.models import Workspace, Profile
from backend.services.auth_utils import hash_password

def create_admin(email, password, name, workspace_name):
    print("🌱 Initializing local database...")
    init_db()
    
    with Session(engine) as session:
        # Check if user already exists
        existing_user = session.exec(select(Profile).where(Profile.email == email)).first()
        if existing_user:
            print(f"⚠️ User with email {email} already exists!")
            return
            
        # Get or create workspace
        workspace = session.exec(select(Workspace).where(Workspace.name == workspace_name)).first()
        if not workspace:
            workspace = Workspace(name=workspace_name)
            session.add(workspace)
            session.commit()
            session.refresh(workspace)
            print(f"✅ Created Workspace: {workspace.name}")
        else:
            print(f"ℹ️ Found existing Workspace: {workspace.name}")
            
        # Create profile with admin role
        admin_profile = Profile(
            workspace_id=workspace.id,
            full_name=name,
            email=email,
            password_hash=hash_password(password),
            role="admin",
            is_active=True
        )
        session.add(admin_profile)
        session.commit()
        session.refresh(admin_profile)
        
        print("\n🏆 Admin Account Successfully Created!")
        print("--------------------------------------")
        print(f"📧 Email:      {email}")
        print(f"🔑 Password:   {password}")
        print(f"👤 Name:       {name}")
        print(f"🏢 Workspace:  {workspace_name}")
        print(f"👑 Role:       admin (Founder/Full Access)")
        print("--------------------------------------\n")

if __name__ == "__main__":
    email = input("Enter Admin Email [admin@passerelle.ai]: ").strip() or "admin@passerelle.ai"
    password = input("Enter Admin Password [admin123]: ").strip() or "admin123"
    name = input("Enter Full Name [Administrateur Principal]: ").strip() or "Administrateur Principal"
    workspace_name = input("Enter Workspace/Association Name [Passerelle OS]: ").strip() or "Passerelle OS"
    
    create_admin(email, password, name, workspace_name)
