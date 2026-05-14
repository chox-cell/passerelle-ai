# Security Architecture

## Current V1 Implementation (Local-First)

### Data Storage
- **Database**: Local PostgreSQL instance.
- **Files**: Local `/uploads` directory on the server/host machine.
- **Organization**: Documents are stored in per-case subdirectories: `/uploads/{case_id}/{document_uuid}.ext`.

### Document Security
- **MIME Validation**: Verified using `python-magic` (binary inspection), not just file extensions.
- **Integrity**: SHA-256 checksums are calculated and stored for every upload to detect tampering.
- **Tracking**: Every document has a status (`uploaded`, `pending_review`, `approved`, `deleted`).
- **Audit Logging**: Every access (upload, metadata read, deletion) is logged in the `audit_logs` table.

## Security Risks & Mitigations

### 1. Local Filesystem Access
- **Risk**: Files are stored unencrypted in the `/uploads` folder. Anyone with OS-level access to the machine can read sensitive migrant data.
- **Mitigation**: Use Full Disk Encryption (FDE) like LUKS (Linux) or FileVault (Mac) on the host machine. Ensure the `/uploads` folder has restricted Unix permissions (`700`).

### 2. Forensic Data Recovery
- **Risk**: Standard deletion only unlinks the file. Data may remain recoverable from physical sectors.
- **Mitigation**: Implement secure wiping (shredding) if the host hardware supports it, or rely on disk-level encryption.

### 3. Metadata Leakage
- **Risk**: Documents may contain EXIF data (GPS, author info).
- **Mitigation**: (Planned) Implement metadata stripping before storage in future versions.

### 4. Database Security
- **Risk**: Local PostgreSQL without strong authentication or network isolation.
- **Mitigation**: Bind PostgreSQL to `localhost` only. Use strong passwords in `.env`.

### 5. Exported PDF Reports
- **Risk**: Reports contain consolidated sensitive data and are often printed or shared via insecure channels (email).
- **Mitigation**: Add mandatory French disclaimer to every page. Advise users on secure sharing practices. Delete reports when no longer needed via `/delete-all`.
