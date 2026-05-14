# Passerelle AI (V1)

Infrastructure opérationnelle pour les ONG aidant les migrants en France. 
**Local-first, Privacy-first, French-first.**

## Prérequis
- **Python 3.12+**
- **Node.js 18+**
- **PostgreSQL 15+**

## Installation Rapide (Demo)

### 1. Configuration Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
```

### 2. Initialisation Base de Données
Assurez-vous que PostgreSQL est lancé, puis :
```bash
createdb passerelle
```

### 3. Reset & Seed Demo (Recommandé)
Cette commande réinitialise la base de données locale et injecte un dossier de démonstration complet.
```bash
./scripts/demo_reset.sh
```

### 4. Lancement
**Backend:**
```bash
cd backend
python main.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Fonctionnalités V1
- ✅ Gestion des dossiers migrants (CRUD)
- ✅ Import sécurisé de documents (Local Storage)
- ✅ Validation d'intégrité (SHA-256 / MIME Magic)
- ✅ Workflow Human-in-the-loop (Revue d'extraction)
- ✅ Consentement RGPD explicite
- ✅ NGO Copilot : Synthèse et Tâches (Mock)
- ✅ Export de rapports PDF consolidés
- ✅ Audit Log complet et Droit à l'oubli (Nuclear Delete)

## Sécurité & Confidentialité
- **Zéro Cloud**: Toutes les données restent sur votre machine.
- **Zéro AI Externe**: Dans cette version V1, aucune donnée n'est envoyée à OpenAI ou des tiers.
- **Souveraineté**: Vous avez le contrôle total sur la suppression des données.

## Limitations Connues
- Authentification non implémentée (V1.5+)
- Multi-ténacité logique mais non isolée
- Extraction AI simulée (Mock) pour validation opérationnelle
- Pas de RAG légal (V2.0)

---
*Information à vérifier avec un professionnel qualifié ou une association spécialisée.*
