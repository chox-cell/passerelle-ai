# GDPR Compliance — Passerelle AI

## Data Minimization
- We only collect documents necessary for administrative processing.
- No audio is retained in V1.

## Transparency & Consent
- Explicit consent must be collected before creating a case or uploading documents.
- **Consent Tracking**: We track `ai_extraction` and `general` consent in the database.
- **Enforcement**:
  - [x] L'analyse automatique (OCR et IA) n'est lancée qu'après signature du consentement.
  - [x] Le texte extrait par OCR est accessible et corrigeable par l'usager/bénévole (Droit de rectification).
  - AI and Copilot features are blocked until consent is verified.
- Users are notified that their data is stored locally on the NGO's infrastructure.

## Individual Rights
- **Right to Erasure**: The `/delete-all` endpoint permanently removes:
  - Local files in `/uploads/{case_id}`.
  - Document metadata and SHA-256 checksums.
  - Extraction results and human review logs.
  - Generated tasks and summaries.
  - Generated PDF reports.
  - The case record itself.
- **Right to Access**: Audit logs provide a transparent record of all data processing.

## Security of Processing (Local-First)
- **Data Sovereignty**: Data never leaves the local environment (except for specific backend-to-AI calls in future phases).
- **Auditability**: All processing actions are recorded in an immutable (app-level) audit log.
- **Data Integrity**: SHA-256 checksums ensure documents haven't been modified outside the application.

## Risks in Local-First Deployment
- **Physical Security**: The host machine must be physically secured as it contains sensitive personal data.
- **Backup Strategy**: Local storage requires a robust, encrypted backup strategy to prevent data loss.
- **Access Control**: NGOs must manage physical and OS-level access to the host machine to prevent unauthorized data exposure.
