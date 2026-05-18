# Rapport de Durcissement Pilote Passerelle OS — V1.4
**Date de vérification : 17 mai 2026**
**Statut : DURCI & PRÊT POUR LE DÉPLOIEMENT PILOTE**

Ce rapport atteste de la réalisation des tâches de durcissement et de la préparation de la plateforme Passerelle OS pour les essais pilotes sur le terrain auprès des associations d'aide aux migrants.

---

## 1. Sécurisation et Durcissement Backend

### 1.1 Expiration Rigoureuse des Sessions (JWT)
- **Implémentation** : La bibliothèque `python-jose` est configurée pour valider explicitement le paramètre `"exp"` dans le jeton.
- **Réduction des Risques** : Tout jeton expiré lève une exception `ExpiredSignatureError` capturée de manière déterministe par `decode_access_token`.
- **Réponse API** : L'API retourne un code statut HTTP `401 Unauthorized` avec un message d'erreur clair et localisé en français : `"Jeton invalide ou expiré."`.

### 1.2 Blocage Immédiat des Utilisateurs Inactifs
- **Comportement de Sécurité** : Les profiles disposent du champ `is_active: bool`. Si ce champ passe à `false` sur le backend :
  - **Login** : La tentative de connexion est bloquée immédiatement avec l'erreur `"Utilisateur inactif. Veuillez contacter votre administrateur."`.
  - **Requête active** : Chaque appel API vérifié via le middleware `get_current_user` interroge la base et rejette immédiatement la requête avec un statut `401` si l'utilisateur n'est plus actif.

### 1.3 Journalisation d'Audit Authentification (AuditLog)
Les événements d'accès critiques sont désormais tracés de manière persistante dans la table `AuditLog` locale :
- `LOGIN_SUCCESS` : Enregistrement de l'association (workspace_id), de l'utilisateur (user_id) et du timestamp.
- `LOGIN_FAILED` : Enregistrement en cas d'identifiants incorrects (avec l'adresse email de tentative pour analyse forensique).
- `LOGIN_FAILED_INACTIVE` : Tentative de connexion par un compte désactivé.

---

## 2. Onboarding Espace de Travail & Expérience Utilisateur

### 2.1 Espace de Travail & Rôles Dynamiques
- **Sidebar & Dashboard** : L'interface interroge l'endpoint `/api/v1/workspace/me` et affiche de façon dynamique le nom réel de l'espace de travail créé à l'inscription (au lieu de la valeur statique "ONG France Solidarité").
- **Statut de Sécurité** : Le panneau d'onboarding sur le tableau de bord affiche fièrement le badge `"Sécurité : 100% local / Hors-ligne"` pour rassurer les bénévoles.

### 2.2 Onboarding Premium Espace Vide
Pour les nouveaux espaces de travail sans dossier enregistré :
- Affichage d'un panneau d'accueil premium avec cadre en pointillés bleu cobalt.
- Rappel clair et dynamique des rôles d'accès et du mode local.
- **Bouton d'action contextuelle** :
  - `Bénévole` & `Admin` : Bouton direct vers `"Créer un premier dossier"`.
  - `Admin` uniquement : Bouton direct vers `"Ajouter un bénévole"` (redirigeant vers la gestion des membres de l'association).

---

## 3. Navigation Sensible aux Rôles (RBAC Client)

La barre de navigation latérale filtre dynamiquement les sections affichées en fonction du rôle décodé depuis la session de l'utilisateur :
| Rôle | Tableau de bord | Dossiers actifs | File de revue | Connaissances | Paramètres |
|---|:---:|:---:|:---:|:---:|:---:|
| **Administrateur** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Bénévole** | ✅ | ✅ | ❌ | ✅ | ✅ (Limité) |
| **Relecteur** | ✅ | ❌ | ✅ | ✅ | ✅ (Limité) |
| **Observateur** | ✅ | ❌ | ❌ | ✅ | ✅ (Limité) |

---

## 4. Parcours Formulaire "Nouveau Dossier Usager"

- **Fidélité UI/UX** : Formulaire en français natif évitant tout jargon technique.
- **Validation** : Les champs obligatoires (Nom de l'usager, Numéro de dossier unique) sont validés côté client et serveur.
- **Notification premium** : Toasts intégrés en cas de succès avec redirection automatique en 1.5 seconde ou messages d'erreur détaillant les champs en échec (sans plantage React).
- **Disclaimer RGPD** : Rappel persistant en bas de formulaire assurant la nature 100% locale des données récoltées.

---

## 5. Polissage Graphique OCR & Extraction

- **Badges de Statut OCR** : États `"En attente"`, `"En cours"` (avec micro-animation pulse) et `"Terminé"` affichés dynamiquement selon `document.ocr_status`.
- **Indicateur de Confiance** : Affiche le pourcentage de réussite (`Math.round(confidence * 100)%`) avec code couleur (Vert pour confiance haute >=80%, Orange pour intermédiaire, Rouge pour critique).
- **Alerte Humaine de Revue** : Warning explicite et esthétique si la relecture humaine n'est pas encore faite sur le texte OCR ou sur les données structurées.
- **Label d'Origine** : Mention explicite `Source : OCR validé` dès que l'extraction déterministe est générée, garantissant la provenance des données.

---
**Conclusion : La v1.4 de Passerelle OS est prête pour l'installation sur site et la phase de test avec utilisateurs réels.**
