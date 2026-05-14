# Architecture Decision — Local First

Passerelle AI V1 will use local PostgreSQL instead of Supabase.

Reason:
- non-profit project
- free development
- privacy-first
- easier local testing
- no vendor lock-in during MVP

Current V1 stack:
- Next.js frontend
- FastAPI backend
- Local PostgreSQL
- SQLAlchemy or SQLModel
- Alembic migrations
- Local uploads folder

Future:
A managed Postgres provider may be used for deployment.
