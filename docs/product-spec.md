
# Product Specification

## Users

- NGO volunteers

- Social workers

- Legal aid associations

- Migrants

## Language Policy (V1)

- **Primary Language**: French (Français).
- **Rationale**: The core users (NGOs, associations) operate in France; administrative outputs and reports must be in French.
- **UI**: 100% French (Labels, buttons, tooltips, warnings).
- **Outputs**: All generated emails, summaries, and reports must be in French.
- **Secondary Languages**: English and Arabic (planned for migrant-facing modules in later versions).
- **Technical**: Code and developer documentation remain in English.

## Main Workflow

1. Create case

2. Upload documents

3. AI extracts information

7. Volunteer reviews extraction (Human-in-the-loop)
8. Approved data updates case timeline
9. Generate actions/tasks
10. Generate report
11. Export or delete data

## Extraction Status Flow
`uploaded` → `extraction_pending` → `extraction_mocked` → `human_review_required` → `approved`

## V1 Features (Current Scope)

- **Gestion des Dossiers**: Création et suivi de dossiers migrants.
- **Import Sécurisé**: Téléchargement local de documents avec validation d'intégrité (SHA-256).
- **Extraction Simulée**: Workflow complet d'extraction (mock) pour test opérationnel.
- **Human-in-the-loop**: Système de revue et validation par les bénévoles.
- **NGO Copilot (Mock)**: Génération de synthèses, brouillons d'e-mails et tâches à partir des données validées.
- **Rapports PDF**: Export local de synthèses de dossiers formatées pour impression.
- **Traçabilité**: Audit log complet de toutes les actions sensibles.

## Future Phases (V1.5+)

- **OCR & AI Extraction**: Connexion réelle à OpenAI pour l'extraction automatique.
- **Legal RAG**: Recherche augmentée dans la base légale du droit des étrangers.
- **Voice Translation**: Traduction vocale temps réel.
- **Rapports PDF**: Génération automatique de rapports exportables.

