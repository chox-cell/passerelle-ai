# Technical Stack Summary — Passerelle AI V1

## Overview
Passerelle AI is built using a modern, decoupled architecture designed for high performance and local data sovereignty.

## Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks (Native)
- **API Client**: Fetch API (Standard)

## Backend Stack
- **Framework**: FastAPI (Python 3.12+)
- **ORM**: SQLModel (SQLAlchemy based)
- **Validation**: Pydantic v2
- **PDF Generation**: ReportLab
- **Integrity**: Python-Magic (MIME) + hashlib (SHA-256)

## Database & Storage
- **Database**: Local PostgreSQL
- **Migrations**: Alembic
- **File Storage**: Local Filesystem (isolated subdirectories per case)
- **Audit**: Native AuditLog table tracking all sensitive state changes.

## Security Model
- **Local-First**: No data sent to external servers in V1.
- **Privacy**: Explicit consent model blocking AI processing without user approval.
- **Data Erasure**: Deep deletion routine (Disk + DB cascading).
- **Auditability**: Permanent record of data access and modifications.

## Future AI Integration Path (V1.5+)
- **Engine**: OpenAI (Backend-to-Backend integration).
- **Privacy**: Prompt engineering with PII scrubbing.
- **OCR**: Real-time document reading using GPT-4o or self-hosted Tesseract.
- **Search**: Vector Database (Chroma/Pinecone) for legal RAG.
