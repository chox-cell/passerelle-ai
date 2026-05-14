import uuid
import json
from datetime import datetime
from sqlmodel import Session, create_all, SQLModel
from backend.database import engine, init_db
from backend.models.models import Workspace, Case, Consent, Document, ExtractionResult, Task, Profile, OCRResult

def seed_demo():
    print("🌱 Seeding demo data...")
    init_db() # Ensure tables exist
    with Session(engine) as session:
        # 1. Create Workspace
        workspace = Workspace(name="ONG Demo France")
        session.add(workspace)
        session.commit()
        session.refresh(workspace)

        # 2. Create Profile
        from backend.services.auth_utils import hash_password
        profile = Profile(
            workspace_id=workspace.id,
            full_name="Bénévole Demo",
            email="demo@passerelle.ai",
            password_hash=hash_password("demo123"),
            role="volunteer"
        )
        session.add(profile)
        session.commit()
        session.refresh(profile)

        # 3. Create Case
        case = Case(
            workspace_id=workspace.id,
            creator_id=profile.id,
            migrant_name="Jean Dupont (DEMO)",
            case_number="DEMO-2026-001",
            status="open",
            summary="Usager arrivé en France en 2024. En attente de renouvellement de récépissé."
        )
        session.add(case)
        session.commit()
        session.refresh(case)

        # 4. Create Consent
        consent = Consent(
            case_id=case.id,
            consent_type="ai_extraction",
            granted=True,
            granted_by="Jean Dupont"
        )
        session.add(consent)

        # 5. Create Mock Document
        document = Document(
            case_id=case.id,
            file_name="recepisse_jean_dupont.pdf",
            storage_path="./uploads/demo/recepisse_jean_dupont.pdf",
            status="approved",
            mime_type="application/pdf",
            file_size=1024000,
            checksum="d3m0-ch3cksum"
        )
        session.add(document)
        session.commit()
        session.refresh(document)

        # 6. Create Approved Extraction
        mock_data = {
            "document_type": "Récépissé de Titre de Séjour",
            "institution": "Préfecture de Nanterre",
            "important_dates": ["2026-01-15", "2026-07-14"],
            "possible_deadline": "2026-07-14",
            "required_actions": "Déposer la demande de renouvellement avant le 14 mai 2026.",
            "summary_fr": "Récépissé autorisant le travail, valable 6 mois.",
            "disclaimer": "Information à vérifier avec un professionnel qualifié ou une association spécialisée."
        }
        extraction = ExtractionResult(
            document_id=document.id,
            raw_json=json.dumps(mock_data),
            confidence_score=0.98,
            is_verified=True,
            verified_by=profile.id
        )
        session.add(extraction)

        # 7. Create Task
        task = Task(
            case_id=case.id,
            title="Prendre RDV en préfecture",
            description="Anticiper le renouvellement du récépissé de Jean Dupont.",
            status="todo"
        )
        session.add(task)

        session.commit()
        print(f"✅ Demo case created with ID: {case.id}")
        print(f"🔑 Demo Login: demo@passerelle.ai / demo123")

if __name__ == "__main__":
    seed_demo()
