# 🎤 Script de Démonstration Live (20 Minutes)

*Avant la démo, s'assurer que la checklist `DEMO_FLOW_CHECKLIST_FR.md` est validée.*

---

## 1. Introduction (3 min)
**Objectif :** Poser le cadre et rassurer.
*   "Bonjour, merci pour votre temps. Aujourd'hui, je vais vous présenter Passerelle OS."
*   "C'est un logiciel pensé pour les ONG. Son but n'est **pas** de remplacer votre expertise juridique ni de prendre des décisions à votre place."
*   "Son but est de vous faire gagner du temps sur l'administratif pur : lire un document, copier la date d'échéance, saisir le nom de l'institution."
*   "**Important :** Durant cette démo, je n'utilise **aucune** vraie donnée d'usager. Il s'agit d'un récépissé factice nommé 'Jean Dupont'."
*   "Et surtout : ce logiciel est 'Local-First'. Aucun document n'est envoyé à ChatGPT ou sur le Cloud. Tout reste sur votre machine."

## 2. Découverte de l'Interface (2 min)
**Action :** Afficher l'écran de connexion (`/login`) et le Tableau de bord (`/`).
*   "Voici l'écran de connexion. Le système fonctionne de manière cloisonnée par association."
*   "Une fois connecté, on arrive sur le tableau de bord. C'est l'espace de travail où vous retrouvez tous les dossiers ouverts, filtrables par urgence ou par statut."

## 3. Création d'un Dossier (2 min)
**Action :** Cliquer sur "Nouveau Dossier".
*   "Nous allons simuler l'arrivée d'un nouvel usager."
*   *Saisir 'Jean Dupont', N° 'DEMO-2026', et un court résumé.*
*   "Regardez en bas de page : le logiciel rappelle constamment que l'environnement est localisé."
*   "Une étape cruciale du travail de l'association est le respect du consentement. Sans le consentement RGPD de l'usager, l'intelligence du système est bloquée."

## 4. Le Flux de Travail et l'OCR Local (5 min)
**Action :** Ouvrir le dossier créé. Importer un faux document PDF/JPG.
*   "Voici la page de dossier, divisée en deux. À gauche, la frise chronologique de traitement. À droite, l'espace d'analyse."
*   *Cliquer sur 'Consentement'.* "L'usager donne son accord pour l'analyse informatique."
*   *Importer 'recepisse_jean_dupont.pdf'.*
*   "Maintenant, je lance l'OCR (Reconnaissance Optique de Caractères)."
*   *Cliquer sur 'Lancer l'OCR local'.*
*   "En arrière-plan, le logiciel lit l'image du texte **sans connexion internet**. C'est instantané et 100% privé."

## 5. La Revue Humaine & Extraction (4 min)
**Action :** Afficher le texte extrait.
*   "La machine a lu le texte brut. Le système demande à un humain de relire ce texte brut pour s'assurer qu'il n'y a pas d'erreur de lecture. C'est le principe du 'Human-in-the-loop' : l'humain reste le maître."
*   *Cliquer sur 'Valider la lecture OCR'.*
*   "Maintenant que la lecture est vérifiée, nous pouvons générer les champs structurés."
*   *Cliquer sur 'Générer les champs'.*
*   "Le logiciel détermine automatiquement le Type de Document, l'Institution, et surtout les **Dates clés** pour éviter de rater une échéance de renouvellement."
*   "Il donne un score de confiance. Je valide en tant que relecteur."

## 6. L'Étape Rapport & Le Rappel (2 min)
**Action :** Montrer le message de Disclaimer.
*   "Si tout est validé, le système vous permet de générer un rapport PDF de synthèse (bientôt disponible)."
*   "Vous voyez ce message d'alerte en bas ? 'Les informations extraites doivent toujours être vérifiées par un professionnel'. Le logiciel n'est pas un juriste."

## 7. Clôture et Offre de Pilote (2 min)
**Objectif :** Conclure sur une proposition gratuite.
*   "Ce que vous venez de voir fonctionne totalement sur votre propre ordinateur ou serveur associatif sécurisé."
*   "Nous proposons un **Pilote gratuit de 2 semaines**."
*   "Vous testez l'outil sur des données fictives ou des archives caviardées pour évaluer le gain de temps, sans risque et sans payer."
*   "Que pensez-vous de cette approche 100% locale comparée aux logiciels Cloud habituels ?"

*(Temps d'échange et questions).*
