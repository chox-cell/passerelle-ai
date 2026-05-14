# Plan d'implémentation — V1.3 Authentification & Espaces de Travail

## Introduction
L'authentification est l'étape critique avant tout déploiement pilote réel. Elle permet de distinguer les actions des bénévoles et de restreindre l'accès aux données sensibles par rôle et par organisation.

## Stratégie Local-First (Implémentée ✅)
- **Pas de Cloud** : L'authentification est gérée localement par la base de données PostgreSQL de l'ONG.
- **Session Persistante** : Utilisation de JWT (JSON Web Tokens) stockés localement.
- **Hachage** : Utilisation de `bcrypt` pour sécuriser les mots de passe.

## Matrice des Rôles & Permissions
| Fonctionnalité | Admin | Bénévole | Relecteur | Observateur |
| :--- | :---: | :---: | :---: | :---: |
| Créer un dossier | ✅ | ✅ | ❌ | ❌ |
| Modifier un dossier | ✅ | ✅ | ❌ | ❌ |
| Voir les dossiers | ✅ | ✅ | ✅ | ✅ |
| Upload documents | ✅ | ✅ | ❌ | ❌ |
| Approuver extraction | ✅ | ❌ | ✅ | ❌ |
| Générer rapports | ✅ | ✅ | ✅ | ✅ |
| Ajouter membres | ✅ | ❌ | ❌ | ❌ |
| Suppression totale | ✅ | ❌ | ❌ | ❌ |

## Modèle Workspace (Espace Association)
1. **Enregistrement** : Le premier utilisateur crée l'espace de l'association et devient automatiquement **Administrateur**.
2. **Ajout de membres** : L'administrateur peut inviter d'autres bénévoles en créant leur profil avec un mot de passe temporaire.
3. **Isolation** : Un membre ne peut voir que les dossiers liés à son `workspace_id`.

## Flux de Travail NGO Typique
1. **Admin** s'inscrit et crée l'espace "Association Solidarité".
2. **Admin** ajoute **Bénévole Alice** et **Relecteur Bob**.
3. **Alice** crée un dossier usager et importe les documents.
4. **Bob** vérifie les extractions de l'IA et les valide.
5. **Alice** ou **Bob** génère le rapport PDF final pour l'usager.
