# Check-list Sécurité — Passerelle AI V1

## Gestion des Secrets
- [x] Aucun `.env` n'est commité dans le dépôt.
- [x] La `SECRET_KEY` dans `.env.example` est une valeur factice.
- [x] Aucune clé API réelle (OpenAI) n'est présente dans le code.

## Authentification & Accès (V1.3)
- [x] Hachage des mots de passe avec `Bcrypt`.
- [x] Génération et validation de jetons `JWT` locaux.
- [x] Endpoints `/register` et `/login` implémentés.
- [x] Matrice de rôles implémentée (Admin, Volunteer, Reviewer, Observer).
- [x] Isolation stricte des données par `workspace_id`.
- [x] Ajout de membres restreint aux Administrateurs.

## Protection des Données (Local-First)
- [x] Le dossier `/uploads` est ignoré par Git.
- [x] Les fichiers de base de données (`.db`, `.sqlite`) sont ignorés.
- [x] Les scripts de seed n'utilisent que des données fictives ("Jean Dupont").

## Intégrité & Validation
- [x] Validation systématique du type MIME par `python-magic`.
- [x] Calcul et stockage du checksum SHA-256 pour chaque fichier.
- [x] Isolation des fichiers par `case_id` sur le système de fichiers.

## Conformité RGPD
- [x] Modèle de consentement explicite implémenté.
- [x] Blocage des fonctionnalités AI sans consentement.
- [x] Audit log des actions sensibles (accès, téléchargement, suppression).
- [x] Suppression physique des fichiers lors de la suppression d'un dossier.

## Points de Vigilance (V1.3+)
- [ ] Le chiffrement des fichiers au repos (At-Rest) n'est pas géré par l'application (doit être géré au niveau OS/FDE).
- [ ] TLS/SSL doit être configuré lors du déploiement (même en local).
- [ ] Protection des routes par rôle (RBAC) non encore activée (Phase 2).
