# Passerelle AI — Project State

## Current Status
**V1 Demo-Ready**. The local-first foundation is complete and hardened for demonstration to NGOs and stakeholders.

## Finished (V1)
- ✅ **Backend**: FastAPI + SQLModel + PostgreSQL (Local-first).
- ✅ **Frontend**: Next.js 14 + Tailwind (French-first UI).
- ✅ **Case Management**: Full CRUD with timeline tracking.
- ✅ **Document processing**: Secure local upload, SHA-256 integrity, MIME validation.
- ✅ **Human-in-the-loop**: Full mock extraction and review workflow.
- ✅ **NGO Copilot**: Mocked synthesis, email drafts, and task generation.
- ✅ **Reports**: Local PDF generation with legal disclaimers.
- ✅ **Privacy**: Consent management and full "Right to Erasure" deletion.
- ✅ **Harden**: Seed scripts, demo reset utilities, and system health monitoring.

## Next Phase (V1.5 & V2.0)
- **Real AI Integration**: OCR and Extraction using OpenAI (Backend-only).
- **Authentication**: JWT/Session based auth for volunteer logins.
- **Legal RAG**: Intelligent search in foreigner law databases.
- **Multi-tenancy**: Physical isolation for different NGOs.

## Final V1 Tree (Main Files)
```text
passerelle/
├── backend/
│   ├── models/             # DB Models (SQLModel)
│   ├── routes/             # API Endpoints
│   └── main.py             # App Entry
├── frontend/
│   ├── app/                # Next.js Pages
│   └── lib/                # API Client
├── docs/                   # Full Documentation
├── scripts/                # Demo & Seed Scripts
├── uploads/                # Local File Storage
└── README.md               # User Guide
```

---
*Status Update: 2026-05-14 — V1 Frozen.*
