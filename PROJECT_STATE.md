# Passerelle AI — Project State

## Current Status
**V1.3 Authentification & RBAC VÉRIFIÉ**. La plateforme est sécurisée pour un usage multi-utilisateur par association.

## Finished (V1.3)
- ✅ **Local Auth**: Hachage Bcrypt, JWT local, Session persistence.
- ✅ **Workspaces**: Isolation stricte des données entre organisations.
- ✅ **RBAC**: Rôles Admin, Bénévole, Relecteur, Observateur implémentés et vérifiés.
- ✅ **Hardening**: Protection de tous les endpoints (PDF, AI, Copilot, Documents).
- ✅ **Audit Logs**: Traçabilité des actions par utilisateur et workspace.

## Next Phase (V1.4 - OCR Offline)
- **OCR**: Intégration de Tesseract ou DocTR pour l'extraction locale sans cloud.
- **Privacy**: Amélioration du nettoyage des fichiers temporaires.

## Roadmap Highlights
1. **V1.3** - Auth & Workspaces (VÉRIFIÉ)
2. **V1.4** - Offline OCR Integration
3. **V1.5** - Optional OpenAI Extraction
4. **V2.0** - Voice Translation & Legal RAG

---
*Status Update: 2026-05-14 — V1.3 Auth & RBAC Hardened and Verified.*
