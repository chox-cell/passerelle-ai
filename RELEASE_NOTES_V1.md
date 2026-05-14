# Notes de Version — Passerelle AI V1 (Demo-Ready)

## Introduction
Passerelle AI V1 est une preuve de concept (PoC) opérationnelle conçue pour démontrer comment une infrastructure locale-première peut transformer le traitement des dossiers migrants tout en garantissant une confidentialité absolue.

## Ce que fait la V1
- **Gestion de Dossiers**: Création et suivi de fiches usagers.
- **Import Sécurisé**: Téléchargement local avec vérification d'intégrité SHA-256 et validation de type MIME.
- **Workflow Human-in-the-Loop**: Cycle complet d'extraction, revue humaine et approbation.
- **NGO Copilot (Simulé)**: Génération de synthèses, d'e-mails et de tâches à partir de données validées.
- **Export de Rapports**: Génération de PDF consolidés incluant les avertissements légaux.
- **Contrôles RGPD**: Gestion des consentements et "bouton nucléaire" pour la suppression totale des données (Disque + DB).
- **Traçabilité**: Audit log complet de chaque action sensible.

## Philosophie Local-First
- **Souveraineté**: Aucune donnée ne quitte la machine de l'ONG.
- **Indépendance**: Fonctionne sans connexion internet (hors installation).
- **Zéro Cloud**: Pas de dépendance à Supabase, AWS ou Firebase pour cette version.

## Limitations & Éléments Simulés
- **Extractions (Mock)**: La logique d'extraction AI est simulée pour valider le workflow opérationnel sans frais d'API.
- **Authentification**: Le système utilise des placeholders; une session réelle n'est pas encore imposée.
- **OCR**: Le texte des documents n'est pas encore réellement lu (prévu pour V1.5).

## Garanties de Confidentialité
- Les fichiers sont stockés dans des dossiers isolés par dossier (`/uploads/{case_id}`).
- Les fichiers sont supprimés définitivement du disque lors de la suppression d'un dossier.
- Aucune donnée réelle de migrant n'est incluse dans le code source ou les scripts de seed.

## Prochaines Étapes (V1.5 & V2.0)
- Intégration réelle d'OpenAI pour l'OCR et l'extraction.
- Système d'authentification robuste (JWT/OAuth).
- RAG Légal (Base de données du droit des étrangers).
- Traduction vocale temps réel.
