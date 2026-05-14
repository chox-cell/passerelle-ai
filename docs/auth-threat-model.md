# Modèle de Menace — Authentification Passerelle AI

Ce document analyse les vecteurs d'attaque potentiels sur le système d'accès local et propose des mesures d'atténuation.

## 1. Accès Non Autorisé
- **Menace** : Un utilisateur externe accède à l'ordinateur de l'association.
- **Impact** : Accès total aux données de tous les migrants.
- **Atténuation** : Authentification par mot de passe obligatoire au lancement. Verrouillage automatique de la session applicative.

## 2. Risque de l'Ordinateur Partagé (Shared Laptop)
- **Menace** : Un bénévole oublie de se déconnecter à la fin de sa garde. Le bénévole suivant accède à des dossiers qui ne le concernent pas.
- **Impact** : Violation de la confidentialité interne.
- **Atténuation** : Déconnexion automatique après inactivité. Affichage clair de l'identité connectée dans le header.

## 3. Vol de l'Appareil
- **Menace** : L'ordinateur portable de l'association est volé.
- **Impact** : Accès aux fichiers bruts sur le disque (`/uploads`) et à la base de données.
- **Atténuation** : L'authentification applicative ne protège pas contre l'accès physique au disque. **Recommandation forte** : Utiliser le chiffrement complet du disque (FileVault sur Mac, BitLocker sur Windows, LUKS sur Linux).

## 4. Départ d'un Bénévole
- **Menace** : Un bénévole quitte l'ONG mais connaît toujours son mot de passe et a accès à l'ordinateur.
- **Impact** : Accès persistant aux données sensibles.
- **Atténuation** : Procédure de désactivation des comptes utilisateurs par l'Admin de l'association.

## 5. Attaque par Force Brute (Local)
- **Menace** : Un utilisateur tente des milliers de combinaisons de mots de passe sur l'écran de login.
- **Impact** : Compromission d'un compte.
- **Atténuation** : Délai exponentiel entre les tentatives échouées. Verrouillage du compte après 5 échecs.

## 6. Fuite de Jetons (JWT)
- **Menace** : Le jeton JWT est volé via une attaque XSS ou via le stockage local du navigateur.
- **Impact** : Usurpation d'identité temporaire.
- **Atténuation** : Utilisation de cookies `HttpOnly` et `Secure` pour stocker le JWT. Expiration courte des jetons.

---
*Dernière mise à jour : 2026-05-14 — Analyse V1.3.*
