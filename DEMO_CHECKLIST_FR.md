# Liste de Contrôle pour Démonstration NGO

Cette liste est destinée au présentateur de Passerelle AI lors d'une rencontre avec une association ou une ONG.

## Avant la réunion (Setup)
- [ ] Lancer PostgreSQL localement.
- [ ] Lancer le backend (`python main.py`).
- [ ] Lancer le frontend (`npm run dev`).
- [ ] Exécuter `./scripts/demo_reset.sh` pour avoir un environnement propre.
- [ ] Ouvrir le tableau de bord sur `http://localhost:3000`.
- [ ] Avoir un PDF de test (factice) prêt sur le bureau.
- [ ] Vérifier que le statut système (API, DB, Disk) est au vert.

## Pendant la démonstration (Points clés)
- **Introduction** : Insister sur le fait que l'outil est **Local-First**.
- **Consentement** : Montrer que le système bloque toute analyse tant que l'usager n'a pas donné son accord.
- **Workflow** : Suivre le script `DEMO_SCRIPT_FR.md`.
- **Souveraineté** : Expliquer que les données ne vont jamais sur le cloud.
- **Transparence** : Montrer les logs d'audit pour prouver que tout est tracé.
- **Suppression** : Finir par la suppression totale du dossier pour montrer le "Droit à l'oubli".

## Ce qu'il ne faut PAS affirmer
- ❌ *"L'IA ne se trompe jamais"* (Toujours rappeler la revue humaine).
- ❌ *"C'est prêt pour une mise en production massive"* (C'est une version V1/Pilote).
- ❌ *"Nous lisons déjà tous les types de documents"* (Préciser que c'est un mock pour la démo).
- ❌ *"C'est 100% conforme à toutes les régulations mondiales"* (C'est conforme RGPD par design local, mais nécessite une revue juridique locale).

## Questions à poser aux bénévoles
1. Est-ce que ce workflow correspond à votre réalité terrain ?
2. Quel document est le plus difficile à traiter manuellement pour vous ?
3. Seriez-vous prêts à utiliser un outil qui nécessite d'être installé sur un ordinateur de l'association ?
4. Quelle fonctionnalité manque cruellement pour un premier test réel ?

## Disclaimer de clôture
*"Toutes les suggestions de l'assistant doivent être vérifiées par un professionnel qualifié. Passerelle AI est un outil d'aide, pas un remplaçant de l'expertise sociale."*
