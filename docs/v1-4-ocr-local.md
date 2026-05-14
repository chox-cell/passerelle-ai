# OCR Local & Souveraineté des Données (V1.4)

## Introduction
La version 1.4 introduit l'extraction de texte locale (OCR) pour permettre aux associations de numériser les documents papier sans jamais envoyer de données dans le cloud.

## Pile Technique (Offline)
- **Moteur** : [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)
- **Langue** : Français (fr)
- **PDF Handling** : `pdf2image` + `poppler`
- **Image Handling** : `Pillow`

## Installation (macOS)
Pour faire fonctionner l'OCR localement, vous devez installer les paquets système suivants :
```bash
brew install tesseract poppler
```

## Flux de Travail OCR
1. **Upload** : Le bénévole charge un PDF ou une image.
2. **Consentement** : L'usager doit avoir signé le consentement RGPD.
3. **Lancement** : Le bouton "Lancer OCR local" extrait le texte brut.
4. **Revue Humaine** : Un administrateur ou relecteur valide le texte extrait.
5. **Phase Suivante** : Le texte validé servira de base à l'extraction structurée par IA.

## Avantages pour la Confidentialité
- **Zéro Cloud** : Le texte est extrait sur le processeur local.
- **Transparence** : Le bénévole peut voir exactement ce que la machine a "lu" avant toute analyse.
- **Contrôle** : Possibilité de corriger le texte si l'OCR a fait des erreurs (ex: mauvaise lecture d'un nom).

## Limitations Connues
- **Qualité** : Dépend fortement de la résolution du scan.
- **Écritures manuscrites** : Tesseract est optimisé pour le texte dactylographié ; les notes manuscrites peuvent être mal lues.
- **Ressources** : L'OCR sur des PDFs longs peut être gourmand en CPU.
