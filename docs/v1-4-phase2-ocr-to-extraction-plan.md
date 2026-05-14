# Plan d'implémentation V1.4 Phase 2 — OCR vers Extraction Structurée

## Introduction
Ce document détaille le plan pour transformer le texte brut extrait localement par l'OCR en données structurées exploitables (dates, type de document, institution) sans dépendre du cloud.

## Pipeline Opérationnel (VÉRIFIÉ V1.4-2A)
1. **Upload** : Import du document (PDF/Image).
2. **OCR Local** : Extraction du texte brut via Tesseract.
3. **Revue OCR (Mandatoire)** : Le bénévole/relecteur valide que le texte extrait est fidèle à l'image. (VÉRIFIÉ)
4. **Extraction Déterministe** : Analyse du texte validé par un moteur de règles local (Regex/Mots-clés). (VÉRIFIÉ)
5. **Revue d'Extraction** : Validation humaine des champs extraits. (VÉRIFIÉ)
6. **Exploitation** : Utilisation des données pour les synthèses Copilot et les rapports PDF.

## Règles de Sécurité & Confidentialité
- **Source Unique** : Seul le texte OCR ayant le statut `is_reviewed=True` peut alimenter l'extracteur.
- **Zéro Cloud** : Pas d'utilisation d'OpenAI ou d'API externe dans cette phase.
- **Pas de Conseil Juridique** : Le système ne doit pas tirer de conclusions juridiques automatiques.
- **Disclaimer** : L'avertissement standard doit être présent sur chaque écran d'extraction.

## Moteur d'Extraction Déterministe (Phase 2A)
Un extracteur basé sur des expressions régulières (Regex) et des dictionnaires de mots-clés :
- **Type de Document** : Détection via mots-clés (ex: "Récépissé", "Titre de séjour", "OQTF").
- **Institution** : Recherche de noms de préfectures, mairies ou tribunaux.
- **Dates** : Extraction des formats standard (JJ/MM/AAAA).
- **Échéances** : Identification des mots "valable jusqu'au", "expire le".
- **Confiance** : Score calculé selon le nombre de mots-clés correspondants.

## Proposition d'Endpoint
**`POST /api/v1/ai/documents/{document_id}/extract-from-reviewed-ocr`**
- **Accès** : `admin`, `reviewer`.
- **Logique** :
  - Vérifie que l'OCR est validé.
  - Applique les règles déterministes sur `ocr_result.corrected_text` (ou `extracted_text`).
  - Crée un `ExtractionResult` avec le statut `is_verified=False`.

## Interface Utilisateur (Frontend)
- **Nouveau Bouton** : "Extraire les données (Moteur Local)".
- **Visualisation** : Comparaison côte à côte du texte source et des champs extraits.
- **Édition** : Possibilité de corriger manuellement chaque champ structuré.

## Risques & Atténuations
| Risque | Impact | Atténuation |
| :--- | :--- | :--- |
| Erreur OCR persistante | Données fausses | Revue humaine obligatoire de l'OCR avant extraction. |
| Faux positifs (Dates) | Échéance erronée | Validation humaine de l'extraction avant rapport. |
| Ambiguité juridique | Mauvaise orientation | Disclaimer permanent : "A vérifier avec un expert". |

## Étapes de Développement
- **Phase 2A** : Implémentation du moteur de règles Regex simple.
- **Phase 2B** : Enrichissement des dictionnaires de mots-clés (Préfectures, Types de visa).
- **Phase 2C** : Intégration optionnelle d'OpenAI (si l'usager active le mode Cloud).
