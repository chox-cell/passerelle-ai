# Rapport de Vérification V1.4 (Phase 2A) — Extraction Structurée Locale

Ce document certifie la fiabilité du flux de données entre l'OCR validé et l'extraction déterministe.

## Endpoints Vérifiés
- `POST /api/v1/ai/documents/{id}/extract-from-reviewed-ocr` : Extraction à partir du texte validé.
- `GET /api/v1/ai/extractions/{id}` : Récupération des données structurées.

## Statut des Tests de Rôles & Accès
| Test | Condition | Rôle | Résultat |
| :--- | :--- | :---: | :---: |
| Accès Endpoint | Sans Login | - | ❌ 401 Unauthorized |
| Accès Endpoint | Sans Consentement | Admin | ❌ 400 Bad Request |
| Accès Endpoint | OCR non validé | Admin | ❌ 400 Bad Request |
| Accès Endpoint | Hors Workspace | Admin | ❌ 404 Not Found |
| Permission | Admin / Relecteur | ✅ | ✅ 200 OK |
| Permission | Bénévole / Observateur | ❌ | ❌ 403 Forbidden |

## Tests du Moteur d'Extraction (Mots-clés & Regex)
| Input (OCR Text) | Type Détecté | Institution Détectée | Dates | Résultat |
| :--- | :--- | :--- | :--- | :---: |
| "Récépissé de Nanterre" | Récépissé | Préfecture | - | ✅ OK |
| "OQTF de Paris" | OQTF | Préfecture | - | ✅ OK |
| "Convocation OFPRA" | Convocation | OFPRA | - | ✅ OK |
| "Lettre 12/05/2026" | Inconnu | Inconnue | 12/05/2026 | ✅ OK |

## Sécurité Juridique (Hardening)
- [x] **Disclaimer** : Présent sur chaque extraction ("Ne remplace pas un conseil juridique").
- [x] **Notes d'Incertitude** : Indication claire que l'analyse est automatisée et sans valeur juridique.
- [x] **OQTF** : Langage adouci pour mentionner une "urgence potentielle" au lieu de délais légaux définitifs.

## Tests Frontend
- [x] Le bouton "Extraire du texte" n'apparaît **que si** l'OCR a été validé.
- [x] Le bouton est protégé par les rôles `admin` et `reviewer`.
- [x] Affichage clair du Type, de l'Institution et de la Synthèse.
- [x] La validation humaine finale reste obligatoire pour marquer le document comme `approved`.

---
**Statut Final : V1.4 Phase 2A — Vérifié & Sécurisé**
