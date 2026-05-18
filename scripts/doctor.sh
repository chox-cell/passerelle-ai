#!/bin/bash

# Elegant console formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}          Passerelle OS Local Doctor 🩺           ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Get root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

SYSTEM_ERRORS=0
SYSTEM_WARNINGS=0

# 1. Check Python Version
echo -e "\n${CYAN}[1/8] Vérification de Python...${NC}"
if which python3 >/dev/null 2>&1; then
    PY_VER=$(python3 --version)
    echo -e "${GREEN}✓ Python 3 trouvé : $PY_VER${NC}"
else
    echo -e "${RED}❌ Erreur: Python 3 n'est pas installé sur votre système.${NC}"
    SYSTEM_ERRORS=$((SYSTEM_ERRORS + 1))
fi

# 2. Check Node.js Version
echo -e "\n${CYAN}[2/8] Vérification de Node.js...${NC}"
if which node >/dev/null 2>&1; then
    NODE_VER=$(node --version)
    echo -e "${GREEN}✓ Node.js trouvé : $NODE_VER${NC}"
else
    echo -e "${RED}❌ Erreur: Node.js n'est pas installé sur votre système.${NC}"
    SYSTEM_ERRORS=$((SYSTEM_ERRORS + 1))
fi

# 3. Check PostgreSQL
echo -e "\n${CYAN}[3/8] Vérification de PostgreSQL...${NC}"
if pg_isready >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Service PostgreSQL actif et accessible.${NC}"
else
    # Check if port 5432 is listening (if pg_isready CLI is missing)
    if lsof -i :5432 >/dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL est à l'écoute sur le port 5432.${NC}"
    else
        echo -e "${RED}❌ Erreur: PostgreSQL ne semble pas tourner sur le port 5432.${NC}"
        echo -e "${YELLOW}   Veuillez démarrer PostgreSQL (ex: brew services start postgresql).${NC}"
        SYSTEM_ERRORS=$((SYSTEM_ERRORS + 1))
    fi
fi

# 4. Check Backend Virtual Env & Dependencies
echo -e "\n${CYAN}[4/8] Vérification de l'environnement Backend...${NC}"
VENV_PATH="$ROOT_DIR/backend/.venv"
if [ -d "$VENV_PATH" ]; then
    echo -e "${GREEN}✓ Dossier d'environnement virtuel backend/.venv trouvé.${NC}"
    
    # Check if we can import key dependencies
    if "$VENV_PATH/bin/python" -c "import fastapi, sqlmodel, psycopg2" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Dépendances Backend (FastAPI, SQLModel, Psycopg2) installées.${NC}"
    else
        echo -e "${RED}❌ Erreur: Des dépendances Backend importantes sont manquantes dans le venv.${NC}"
        echo -e "${YELLOW}   Exécutez : ./backend/.venv/bin/pip install -r backend/requirements.txt${NC}"
        SYSTEM_ERRORS=$((SYSTEM_ERRORS + 1))
    fi
else
    echo -e "${RED}❌ Erreur: Environnement virtuel backend/.venv absent.${NC}"
    SYSTEM_ERRORS=$((SYSTEM_ERRORS + 1))
fi

# 5. Check Frontend Dependencies
echo -e "\n${CYAN}[5/8] Vérification de l'environnement Frontend...${NC}"
if [ -d "$ROOT_DIR/frontend/node_modules" ]; then
    echo -e "${GREEN}✓ Modules de dépendances frontend installés (node_modules).${NC}"
else
    echo -e "${RED}❌ Erreur: Dépendances frontend manquantes (node_modules absent).${NC}"
    echo -e "${YELLOW}   Exécutez dans frontend/ : npm install${NC}"
    SYSTEM_ERRORS=$((SYSTEM_ERRORS + 1))
fi

# 6. Check Tesseract OCR
echo -e "\n${CYAN}[6/8] Vérification de Tesseract OCR...${NC}"
if which tesseract >/dev/null 2>&1; then
    TESS_VER=$(tesseract --version | head -n 1)
    echo -e "${GREEN}✓ Tesseract OCR installé : $TESS_VER${NC}"
else
    echo -e "${YELLOW}⚠ Warning: Tesseract OCR non trouvé. L'extraction de documents PDF/images échouera.${NC}"
    echo -e "${YELLOW}   Installez-le avec : brew install tesseract${NC}"
    SYSTEM_WARNINGS=$((SYSTEM_WARNINGS + 1))
fi

# 7. Check Poppler (PDF helper)
echo -e "\n${CYAN}[7/8] Vérification de Poppler (pdftoppm)...${NC}"
if which pdftoppm >/dev/null 2>&1; then
    POP_VER=$(pdftoppm -v 2>&1 | head -n 1)
    echo -e "${GREEN}✓ Poppler (pdftoppm) installé : $POP_VER${NC}"
else
    echo -e "${YELLOW}⚠ Warning: Poppler (pdftoppm) non trouvé. La conversion d'images de PDF échouera.${NC}"
    echo -e "${YELLOW}   Installez-le avec : brew install poppler${NC}"
    SYSTEM_WARNINGS=$((SYSTEM_WARNINGS + 1))
fi

# 8. Check Active Services Health
echo -e "\n${CYAN}[8/8] Statut des services actifs...${NC}"
# Backend port 8000
if lsof -i :8000 >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend actif (Port 8000).${NC}"
    # Try local curl health check (requires network, fallback to just port check)
    if which curl >/dev/null 2>&1; then
        HEALTH=$(curl -s http://127.0.0.1:8000/api/v1/system/health 2>/dev/null)
        if [[ $HEALTH == *"online"* ]]; then
            echo -e "${GREEN}  ✓ Réponse API Health : En ligne, Base de données connectée.${NC}"
        else
            echo -e "${YELLOW}  ⚠ Impossible de joindre l'endpoint de diagnostic santé (CORS ou isolation active).${NC}"
        fi
    fi
else
    echo -e "${YELLOW}ℹ Backend inactif (Port 8000 libre).${NC}"
fi

# Frontend port 3000 or 3001
if lsof -i :3000 >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend actif sur le port 3000.${NC}"
elif lsof -i :3001 >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend actif sur le port 3001.${NC}"
else
    echo -e "${YELLOW}ℹ Frontend inactif (Ports 3000 & 3001 libres).${NC}"
fi

# Summary
echo -e "\n${BLUE}==================================================${NC}"
if [ $SYSTEM_ERRORS -eq 0 ]; then
    if [ $SYSTEM_WARNINGS -eq 0 ]; then
        echo -e "${GREEN}💚 Excellent ! Tout est parfait et prêt pour Passerelle OS !${NC}"
    else
        echo -e "${YELLOW}💛 Prêt avec attention : $SYSTEM_WARNINGS avertissement(s) à régler pour l'OCR.${NC}"
    fi
else
    echo -e "${RED}❤️  Alerte : $SYSTEM_ERRORS erreur(s) bloquante(s) détectée(s).${NC}"
    echo -e "${RED}   Veuillez régler les erreurs ci-dessus avant de lancer la plateforme.${NC}"
fi
echo -e "${BLUE}==================================================${NC}"

exit $SYSTEM_ERRORS
