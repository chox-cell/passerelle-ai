# Plan de Test Pilote (2 semaines)

Ce document décrit la stratégie pour un premier déploiement contrôlé de Passerelle AI au sein d'une association partenaire.

## Objectifs du Pilote
1. Valider l'utilisabilité de l'interface en situation réelle.
2. Mesurer le gain de temps sur la préparation des synthèses de dossiers.
3. Identifier les documents "prioritaires" pour la future intégration OCR.

## Calendrier
- **Jour 1** : Installation locale sur l'ordinateur de l'association et formation (1h).
- **Jours 2-9** : Utilisation quotidienne sur des dossiers réels (avec données anonymisées ou consentement écrit).
- **Jour 10** : Entretien de retour et collecte du formulaire de feedback.
- **Jour 11** : Analyse des logs d'audit (avec l'équipe) et des rapports générés.
- **Jour 12** : Clôture du pilote et suppression sécurisée des données de test.

## Règles de Sécurité (Strictes)
- **Données Sensibles** : Ne jamais importer de documents originaux sans le consentement écrit de l'usager.
- **Anonymisation** : Pour ce premier pilote, il est recommandé de flouter les noms/numéros d'identité sur les scans si possible.
- **Local Uniquement** : Ne jamais tenter de connecter la base de données PostgreSQL à un réseau externe.

## Critères de Succès
- [ ] Au moins 5 dossiers complets créés et traités.
- [ ] Au moins 3 rapports PDF générés et jugés "utilisables" par le bénévole.
- [ ] Aucun bug bloquant sur le workflow de consentement.
- [ ] Score moyen d'utilité > 4/5 sur le formulaire de retour.

## Équipe Pilote
- **Référent Association** : [Nom]
- **Support Technique** : [Votre Nom/Équipe]
- **Utilisateurs** : 2 bénévoles formés.

---
*Ce plan est une base de discussion et doit être adapté aux spécificités de chaque association.*
