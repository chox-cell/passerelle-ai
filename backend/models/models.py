from typing import List, Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
import uuid

class Workspace(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    profiles: List["Profile"] = Relationship(back_populates="workspace")
    cases: List["Case"] = Relationship(back_populates="workspace")

class Profile(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    workspace_id: Optional[uuid.UUID] = Field(default=None, foreign_key="workspace.id")
    full_name: str
    email: str = Field(index=True, unique=True)
    role: str # admin, volunteer, social_worker
    created_at: datetime = Field(default_factory=datetime.utcnow)

    workspace: Optional[Workspace] = Relationship(back_populates="profiles")
    created_cases: List["Case"] = Relationship(back_populates="creator")

class Case(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    workspace_id: uuid.UUID = Field(foreign_key="workspace.id")
    creator_id: Optional[uuid.UUID] = Field(default=None, foreign_key="profile.id")
    migrant_name: Optional[str] = None
    case_number: Optional[str] = None
    status: str = Field(default="open")
    priority: str = Field(default="normal")
    summary: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    workspace: Workspace = Relationship(back_populates="cases")
    creator: Optional[Profile] = Relationship(back_populates="created_cases")
    documents: List["Document"] = Relationship(back_populates="case")
    tasks: List["Task"] = Relationship(back_populates="case")

class Document(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    case_id: uuid.UUID = Field(foreign_key="case.id")
    file_name: str
    storage_path: str
    file_type: Optional[str] = None # Original Content-Type from header
    mime_type: Optional[str] = None # Validated MIME type
    file_size: Optional[int] = None # Size in bytes
    checksum: Optional[str] = None  # SHA-256
    status: str = Field(default="uploaded") # uploaded | pending_review | approved | deleted
    ocr_status: str = Field(default="pending")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    case: Case = Relationship(back_populates="documents")
    extractions: List["ExtractionResult"] = Relationship(back_populates="document")

class ExtractionResult(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    document_id: uuid.UUID = Field(foreign_key="document.id")
    raw_json: str # Store as JSON string or use SaType
    confidence_score: Optional[float] = None
    is_verified: bool = Field(default=False)
    verified_by: Optional[uuid.UUID] = Field(default=None, foreign_key="profile.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    document: Document = Relationship(back_populates="extractions")

class Task(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    case_id: uuid.UUID = Field(foreign_key="case.id")
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: str = Field(default="todo")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    case: Case = Relationship(back_populates="tasks")

class AuditLog(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    workspace_id: Optional[uuid.UUID] = Field(default=None, foreign_key="workspace.id")
    user_id: Optional[uuid.UUID] = Field(default=None, foreign_key="profile.id")
    action: str
    resource_type: str
    resource_id: Optional[uuid.UUID] = None
    details: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Consent(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    case_id: uuid.UUID = Field(foreign_key="case.id")
    consent_type: str # general, ai_extraction, institutional_sharing
    granted: bool = Field(default=False)
    granted_by: Optional[str] = None # Name of migrant or representative
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Report(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    case_id: uuid.UUID = Field(foreign_key="case.id")
    report_type: str = Field(default="case_summary")
    file_path: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
