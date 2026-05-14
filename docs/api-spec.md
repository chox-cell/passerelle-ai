# API Specification (V1)

## Cases
- `POST /api/v1/cases/`: Create a new case.
- `GET /api/v1/cases/`: List cases.
- `GET /api/v1/cases/{id}`: Get case details.
- `PATCH /api/v1/cases/{id}`: Update case details.
- `DELETE /api/v1/cases/{id}`: Delete a case.

## Documents
- `POST /api/v1/documents/upload/{case_id}`: Upload a document (Local storage).
- `GET /api/v1/documents/case/{case_id}`: List documents for a case.
- `GET /api/v1/documents/{id}/metadata`: Get document metadata (integrity check).
- `DELETE /api/v1/documents/{id}`: Delete a document.

## Extraction & AI (Mocked V1)
- `POST /api/v1/ai/documents/{document_id}/mock-extract`: Generate a mock extraction for testing.
- `PATCH /api/v1/ai/extractions/{extraction_id}/review`: Approve or correct an extraction (Human-in-the-loop).

## Reports
- `POST /api/v1/reports/cases/{case_id}/generate`: Generate a PDF report for a case.
- `GET /api/v1/reports/cases/{case_id}`: List all reports for a case.
- `GET /api/v1/reports/{report_id}/download`: Download a generated PDF report.

## NGO Copilot (Mocked V1)
- `POST /api/v1/copilot/cases/{case_id}/mock-summary`: Generate a case summary from validated data.
- `POST /api/v1/copilot/cases/{case_id}/mock-email`: Draft an institutional follow-up email.
- `POST /api/v1/copilot/cases/{case_id}/mock-tasks`: Create follow-up tasks from document deadlines.

## Privacy & GDPR
- `POST /api/v1/privacy/cases/{case_id}/consent`: Register user consent for data processing.
- `GET /api/v1/privacy/cases/{case_id}/consents`: List all consents for a case.
- `DELETE /api/v1/privacy/cases/{case_id}/delete-all`: Permanently delete all data related to a case (files and DB records).
- `GET /api/v1/privacy/cases/{case_id}/audit-logs`: Retrieve the audit trail for a case.
