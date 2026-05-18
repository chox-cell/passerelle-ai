# Passerelle AI — Project State

## Current Status
**V1.4 Pilot Hardening (VÉRIFIÉ & DURCI)**. La plateforme Passerelle OS a été durcie pour le déploiement pilote : session/login sécurisés avec audit logs, onboarding premium d'espace de travail, création de dossier usager locale et re-polissage de l'interface OCR et données structurées.

## Finished (V1.4 - Pilot Hardening)
- ✅ **Sécurisation Session Backend** : JWT expiration vérifiée rigoureusement, blocage des utilisateurs inactifs, audit logs pour connexions réussies et échouées.
- ✅ **Onboarding Espace de travail** : Banner d'onboarding premium avec nom de l'espace, statut de sécurité locale 100% hors-ligne, rôle d'accès et suggestions d'actions.
- ✅ **Navigation Sensible au Rôle** : Sidebar adaptative qui masque/affiche les onglets (dossiers, revue, paramètres) en fonction du rôle exact.
- ✅ **Fiche Création Dossier** : Traduction intégrale en français, validation de formulaire et disclaimers de sécurité locale intégrés.
- ✅ **Polissage UI OCR/Extraction** : Indicateurs de statut OCR, badges de niveau de confiance d'extraction, labels de provenance "source: OCR validé" et disclaimers de conformité.

## Next Phase (V1.5 - Optionnel Raccordement RAG/Cloud ou règles déterministes additionnelles)

## Roadmap Highlights
1. **V1.3** - Auth & Workspaces (VÉRIFIÉ)
2. **V1.4** - Offline OCR & Pilot Hardening (DURCI)
3. **V1.5** - Optional Cloud/OpenAI Extraction
4. **V2.0** - Voice Translation & Legal RAG

---
*Status Update: 2026-05-17 — V1.4 Pilot Hardening completed, fully offline, verified, and hardened.*
