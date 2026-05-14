# Rapport de Vérification V1.4 (Phase 1) — OCR Local

Ce document certifie le fonctionnement de l'extraction de texte locale (Offline OCR) et son intégration sécurisée dans Passerelle AI.

## Dépendances Système Requises
- **Tesseract OCR** (`tesseract`) : Moteur d'extraction.
- **Poppler** (`poppler`) : Conversion PDF vers images.
- **Bibliothèques Python** : `pytesseract`, `pdf2image`, `pillow`.

## Statut des Tests de Rôles (RBAC)
| Action | Admin | Bénévole | Relecteur | Observateur | Résultat |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Lancer l'OCR | ✅ Pass | ✅ Pass | ❌ Bloqué | ❌ Bloqué | Conforme |
| Voir le texte OCR | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass | Conforme |
| Valider le texte OCR | ✅ Pass | ❌ Bloqué | ✅ Pass | ❌ Bloqué | Conforme |

## Tests de Sécurité & Isolation
- [x] **Consentement** : L'OCR échoue si le consentement `ai_extraction` n'est pas accordé par l'usager (Vérifié via `verify_consent`).
- [x] **Workspace Isolation** : Impossible de lancer l'OCR sur un document appartenant à une autre association (Vérifié via `workspace_id`).
- [x] **Audit** : Chaque extraction OCR et chaque revue humaine est enregistrée dans les logs d'audit.

## Tests Frontend
- [x] Le bouton "Lancer OCR local" n'apparaît que pour les Admins et Bénévoles.
- [x] Le bouton "Valider le texte OCR" n'apparaît que pour les Admins et Relecteurs.
- [x] Le panel de texte affiche un état de chargement pendant le traitement.
- [x] La validation par un humain change le statut du document en `human_review_required`.

## Limitations de l'OCR Local (Tesseract)
- **Qualité des scans** : Les documents flous ou peu contrastés réduisent la précision.
- **Handwriting** : Très faible précision sur les écritures manuscrites.
- **Performance** : Le traitement est effectué sur le processeur local ; les documents de plus de 10 pages peuvent prendre plusieurs secondes.

## Risques de Confidentialité
- **Fichiers temporaires** : `pdf2image` peut créer des fichiers temporaires. Ils sont gérés par le système mais un nettoyage explicite est recommandé dans une future phase.

---
**Statut Final : V1.4 Phase 1 — Implémenté & Vérifié (Stabilité Locale)**
