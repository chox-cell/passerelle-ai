# Rapport de Vérification V1.3 — Authentification & Espaces

Ce document certifie la stabilité et la sécurité du système d'authentification locale de Passerelle AI pour le déploiement pilote.

## Résumé du Statut
- **Version** : 1.3.0-verified
- **Moteur** : FastAPI + SQLModel + JWT (Local-first)
- **Modèle de Données** : Workspace isolation implémentée.
- **Rôles** : RBAC (Admin, Volunteer, Reviewer, Observer) implémenté.

## Matrice de Tests de Rôles
| Rôle | Création Dossier | Suppression (Droit à l'oubli) | Gestion Équipe | Validation IA | Résultat |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Admin** | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass | Conforme |
| **Bénévole** | ✅ Pass | ❌ Bloqué (403) | ❌ Bloqué (403) | ❌ Bloqué (403) | Conforme |
| **Relecteur** | ❌ Bloqué (403) | ❌ Bloqué (403) | ❌ Bloqué (403) | ✅ Pass | Conforme |
| **Observateur** | ❌ Bloqué (403) | ❌ Bloqué (403) | ❌ Bloqué (403) | ❌ Bloqué (403) | Conforme |

## Isolation des Espaces (Workspaces)
- [x] Un utilisateur de l'Espace A ne peut pas lister les dossiers de l'Espace B.
- [x] Un utilisateur de l'Espace A ne peut pas accéder à un dossier de l'Espace B via ID direct.
- [x] Les logs d'audit sont filtrés par Workspace.
- [x] La suppression "delete-all" est restreinte au périmètre du Workspace actuel.

## Vérification Frontend
- [x] Redirection vers `/login` si aucun jeton n'est présent.
- [x] Les boutons "Nouveau Dossier" et "Membres" sont masqués dynamiquement.
- [x] Le bouton "Générer Rapport" est visible pour tous (Lecture autorisée).
- [x] La déconnexion vide correctement le localStorage.

## Risques Résiduels
- **Force Brute** : Pas de limitation de tentatives de connexion (rate-limiting) en V1.3.
- **Chiffrement At-Rest** : Les fichiers dans `/uploads` ne sont pas encore chiffrés individuellement.
- **TLS** : Le déploiement local doit être sécurisé avec un certificat auto-signé pour protéger le JWT sur le réseau local.

## Migration & Reset
Pour appliquer la V1.3 sur une installation existante :
```bash
chmod +x scripts/demo_reset.sh
./scripts/demo_reset.sh
```
Identifiants Démo : `demo@passerelle.ai` / `demo123`

---
**Statut Final : V1.3 VÉRIFIÉ**
