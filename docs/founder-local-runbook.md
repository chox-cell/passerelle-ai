# 📖 Passerelle OS — Guide d'utilisation Fondateur (Local)

Bienvenue dans le guide opérationnel de **Passerelle OS**. Ce document est conçu pour vous (fondateur ou administrateur) afin de lancer, tester et faire des démonstrations de la plateforme en toute fluidité, sans friction technique.

---

## 🚀 1. Démarrage Rapide

Pour lancer l'ensemble de la plateforme en local, exécutez simplement la commande suivante à la racine du projet :

```bash
./scripts/start_local.sh
```

### Ce que fait ce script :
1. Vérifie la présence de votre environnement virtuel Python backend (`backend/.venv`).
2. Vérifie la disponibilité des packages système (`Tesseract` et `Poppler`) requis pour l'OCR.
3. Démarre le serveur API **FastAPI** en arrière-plan sur le port `8000`.
4. Démarre le serveur **Next.js** en arrière-plan sur le port disponible (`3000` ou `3001` si le port 3000 is déjà occupé).
5. Affiche tous les liens d'accès de démonstration et les identifiants dans votre console.

> **Pour tout arrêter :** Appuyez simplement sur `[Ctrl + C]` dans le terminal du script. Il arrêtera proprement et instantanément les serveurs frontend et backend.

---

## 🩺 2. Diagnostic Système (Le Doctor Script)

En cas de doute sur votre configuration système, lancez le script de diagnostic :

```bash
./scripts/doctor.sh
```

Il inspecte votre version de Python/Node.js, l'accessibilité de PostgreSQL, la présence de vos dépendances `node_modules` et `pip` locales, et valide que les binaires de traitement de documents (Tesseract OCR et Poppler) sont pleinement fonctionnels.

---

## 🗄️ 3. Réinitialiser la Base de Démo

Si vous avez importé de nombreux fichiers de test et que vous souhaitez remettre la plateforme dans un état propre pour une démonstration officielle, lancez :

```bash
./scripts/demo_reset.sh
```

*   **Action** : Supprime la base PostgreSQL `passerelle`, la recrée proprement, vide les dossiers d'uploads temporaires et insère un dossier de démonstration complet (*Jean Dupont*, avec son récépissé de séjour pré-généré).
*   **Identifiants de Démo (Bénévole)** :
    *   **Email** : `demo@passerelle.ai`
    *   **Mot de passe** : `demo123`

---

## 👑 4. Créer un Compte Administrateur (Fondateur)

Pour tester la plateforme avec les droits absolus (supprimer des dossiers, inviter des membres, valider les relectures), vous pouvez créer votre propre compte Admin en une commande :

```bash
./backend/.venv/bin/python scripts/create_admin.py
```

Le script interactif vous demandera :
1. Votre email de connexion (ex: `fondateur@monong.org`)
2. Votre mot de passe sécurisé
3. Votre nom complet
4. Le nom de votre Association (Workspace)

Une fois créé, vous pourrez vous connecter directement sur `http://localhost:3001/login`.

---

## 📄 5. Scénario de Test Recommandé (Démo OCR & Extraction)

Voici le parcours idéal pour une démonstration fluide de la puissance locale de Passerelle OS :

### Étape 1 : Connexion
*   Connectez-vous avec votre compte **Admin** ou le compte bénévole (`demo@passerelle.ai`).

### Étape 2 : Créer un dossier
1. Cliquez sur **Nouveau Dossier** en haut à droite.
2. Saisissez le nom de l'usager, son numéro de dossier (ex: `OS-2026-99`) et un court résumé.
3. Cochez la case obligatoire de consentement (RGPD conforme).
4. Enregistrez. Le dossier est créé instantanément hors-ligne.

### Étape 3 : Importer un document & Lancer l'OCR local
1. Sur la page du dossier, cliquez sur **Ajouter un Document**.
2. Sélectionnez une image ou un PDF (ex : un récépissé ou un titre de séjour).
3. Cliquez sur **Lancer la lecture OCR**.
4. L'OCR local (Tesseract) lit le texte en quelques secondes de manière 100% autonome.

### Étape 4 : Relecture & Extraction Structurée
1. Une fois l'OCR terminé, examinez le texte brut extrait.
2. Si vous êtes connecté en tant qu'**Admin** ou **Reviewer**, vous pouvez modifier le texte si nécessaire et cliquer sur **Valider la lecture**.
3. Une fois validé, le bouton **Générer les champs** apparaît dans la section *Données Structurées*.
4. Cliquez dessus : notre extracteur déterministe local analyse le texte validé et en extrait instantanément le type de document, l'institution (ex : Préfecture), les dates limites clés, et le score de confiance correspondant.
5. Cochez les validations manuelles pour finaliser la fiche.

---

## ⚠️ 6. Résolution des Erreurs Fréquentes

### 🚫 Port 3000 déjà occupé
*   **Symptôme** : Au lancement du frontend, le terminal indique `Port 3000 is in use`.
*   **Cause** : Une autre application ou un ancien serveur Next.js tourne en arrière-plan.
*   **Résolution** : Pas de panique ! Next.js est configuré pour basculer automatiquement sur le port **`3001`**. Ouvrez simplement `http://localhost:3001` dans votre navigateur.

### 🚫 Port 8000 déjà occupé (Backend hors-ligne)
*   **Symptôme** : Le frontend affiche une alerte rouge indiquant `Impossible de se connecter au backend`.
*   **Cause** : Un processus uvicorn tourne déjà en tâche de fond sur le port 8000.
*   **Résolution** :
    1. Si le backend tourne déjà, vous pouvez simplement utiliser la plateforme normalement.
    2. Pour forcer l'arrêt du serveur bloquant :
       ```bash
       lsof -t -i:8000 | xargs kill -9
       ```
       Puis relancez `./scripts/start_local.sh`.

### 🚫 Pytesseract / PDF2Image manquant
*   **Symptôme** : Le backend crashe lors du traitement de l'OCR.
*   **Cause** : Les outils système ne sont pas installés sur votre Mac.
*   **Résolution** :
    ```bash
    brew install tesseract poppler
    ```

### ⚡ Cache Next.js corrompu (.next)
*   **Symptôme** : Erreurs `MODULE_NOT_FOUND` ou pages non stylisées (brutes) dans le navigateur.
*   **Cause** : Conflit entre les builds de production et de développement.
*   **Résolution** :
    ```bash
    rm -rf frontend/.next
    ```
    Puis relancez `./scripts/start_local.sh`.

### 🗄️ Réparer une base locale obsolète
*   **Symptôme** : Messages d'erreur SQL indiquant qu'une colonne (ex: `profile.password_hash`) ou une table (ex: `ocrresult`) n'existe pas.
*   **Cause** : La structure des tables dans PostgreSQL a changé dans le code, mais votre base locale utilise toujours un ancien schéma périmé.
*   **Résolution** :
    1. Lancez le script de diagnostic de schéma :
       ```bash
       ./backend/.venv/bin/python scripts/check_schema.py
       ```
    2. Si le script indique que le schéma est obsolète, réinitialisez la base de données proprement avec :
       ```bash
       ./scripts/demo_reset.sh
       ```
       *Ce script va débloquer le port 8000, couper toutes les connexions actives dans Postgres, supprimer et recréer la base 'passerelle' proprement et ré-injecter la graine de démo.*
