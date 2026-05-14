"""Initial migration

Revision ID: v1_initial
Revises: 
Create Date: 2026-05-13 20:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'v1_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Workspaces
    op.create_table(
        'workspace',
        sa.Column('id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Profiles
    op.create_table(
        'profile',
        sa.Column('id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column('workspace_id', sqlmodel.sql.sqltypes.GUID(), nullable=True),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspace.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_profile_email'), 'profile', ['email'], unique=True)

    # Cases
    op.create_table(
        'case',
        sa.Column('id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column('workspace_id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column('creator_id', sqlmodel.sql.sqltypes.GUID(), nullable=True),
        sa.Column('migrant_name', sa.String(), nullable=True),
        sa.Column('case_number', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('priority', sa.String(), nullable=False),
        sa.Column('summary', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['creator_id'], ['profile.id'], ),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspace.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Documents
    op.create_table(
        'document',
        sa.Column('id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column('case_id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column('file_name', sa.String(), nullable=False),
        sa.Column('storage_path', sa.String(), nullable=False),
        sa.Column('file_type', sa.String(), nullable=True),
        sa.Column('mime_type', sa.String(), nullable=True),
        sa.Column('file_size', sa.Integer(), nullable=True),
        sa.Column('checksum', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('ocr_status', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['case_id'], ['case.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Extraction Results
    op.create_table(
        'extractionresult',
        sa.Column('id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column('document_id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column('raw_json', sa.String(), nullable=False),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=False),
        sa.Column('verified_by', sqlmodel.sql.sqltypes.GUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['document_id'], ['document.id'], ),
        sa.ForeignKeyConstraint(['verified_by'], ['profile.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Tasks
    op.create_table(
        'task',
        sa.Column('id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column('case_id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('due_date', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['case_id'], ['case.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Audit Logs
    op.create_table(
        'auditlog',
        sa.Column('id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column('workspace_id', sqlmodel.sql.sqltypes.GUID(), nullable=True),
        sa.Column('user_id', sqlmodel.sql.sqltypes.GUID(), nullable=True),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('resource_type', sa.String(), nullable=False),
        sa.Column('resource_id', sqlmodel.sql.sqltypes.GUID(), nullable=True),
        sa.Column('details', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['profile.id'], ),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspace.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Consents
    op.create_table(
        'consent',
        sa.Column('id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column('case_id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column('consent_type', sa.String(), nullable=False),
        sa.Column('granted', sa.Boolean(), nullable=False),
        sa.Column('granted_by', sa.String(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['case_id'], ['case.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('consent')
    op.drop_table('auditlog')
    op.drop_table('task')
    op.drop_table('extractionresult')
    op.drop_table('document')
    op.drop_table('case')
    op.drop_index(op.f('ix_profile_email'), table_name='profile')
    op.drop_table('profile')
    op.drop_table('workspace')
