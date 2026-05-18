# ✅ Checklist Pré-Démonstration (Live Demo)

Ce document est à vérifier impérativement avant toute présentation en direct (visioconférence ou présentiel) à une association ou une ONG.

## 🛠️ 1. Vérification Technique
- [ ] **Backend en cours d'exécution :** L'API Python tourne sans erreur sur `http://localhost:8000`.
- [ ] **Frontend en cours d'exécution :** Le serveur Next.js tourne proprement sur `http://localhost:3000`.
- [ ] **Base de données propre :** Exécuter `./scripts/demo_reset.sh` juste avant la réunion pour garantir l'absence de bugs résiduels.
- [ ] **Utilisateur Démo existant :** S'assurer de la validité de `demo@passerelle.ai` / `demo123`.
- [ ] **Dossier d'exemple prêt :** Le reset doit avoir généré le dossier factice "Jean Dupont". 
- [ ] **Document de test prêt sur le bureau :** Avoir un fichier image/PDF (`recepisse_factice.jpg` ou `.pdf`) préparé sur le bureau de l'ordinateur pour le téléchargement.

## 💻 2. Prêt pour l'Écran (Navigateur)
- [ ] Cacher la barre des favoris si elle contient des informations privées.
- [ ] Fermer tous les autres onglets non pertinents.
- [ ] Ouvrir l'URL `http://localhost:3000` et s'assurer d'être déconnecté (pour montrer l'écran de Login).

## 💬 3. Ce Qu'il Faut Dire (Éléments de Langage)
- [ ] Répéter le terme **"Local-First"** et l'expliquer ("Tout fonctionne sur *cet* ordinateur, sans envoyer l'image sur le Cloud").
- [ ] Répéter le terme **"Human-in-the-loop"** ("La machine lit, mais l'humain reste le maître absolu et valide la donnée").
- [ ] Insister sur le gain de temps administratif.
- [ ] Proposer le pilote de **2 semaines gratuites**.

## 🛑 4. Ce Qu'il Ne Faut SURTOUT PAS Promettre
- [ ] Ne **jamais** dire que l'IA va donner un avis ou un conseil juridique.
- [ ] Ne **jamais** dire que le système est "sans faille" ou "100% infaillible" sur l'OCR. (C'est pourquoi la relecture humaine est là).
- [ ] Ne **jamais** encourager l'utilisation de véritables documents d'usagers pendant un test sans qu'ils aient signé un accord de consentement RGPD interne à l'association.
