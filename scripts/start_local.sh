#!/bin/bash

# Elegant console formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}          Passerelle OS Local Launcher            ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Get the root directory of the project
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# 1. Verify Backend Virtual Environment
echo -e "\n${CYAN}[1/4] Vérification de l'environnement virtuel Backend...${NC}"
VENV_PATH="$ROOT_DIR/backend/.venv"
if [ ! -d "$VENV_PATH" ]; then
    echo -e "${RED}❌ Erreur: L'environnement virtuel n'existe pas dans backend/.venv${NC}"
    echo -e "${YELLOW}👉 Veuillez exécuter: python3 -m venv backend/.venv && ./backend/.venv/bin/pip install -r backend/requirements.txt${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Environnement virtuel backend trouvé.${NC}"

# 2. Check System Packages (Tesseract & Poppler)
echo -e "\n${CYAN}[2/4] Vérification des dépendances système...${NC}"
SYSTEM_OK=true

if which tesseract >/dev/null 2>&1; then
    TESS_VERSION=$(tesseract --version | head -n 1)
    echo -e "${GREEN}✓ Tesseract OCR disponible : $TESS_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ Attention: Tesseract OCR n'est pas détecté dans votre PATH.${NC}"
    echo -e "${YELLOW}   Le module d'extraction OCR de documents échouera.${NC}"
    SYSTEM_OK=false
fi

if which pdftoppm >/dev/null 2>&1; then
    POP_VERSION=$(pdftoppm -v 2>&1 | head -n 1)
    echo -e "${GREEN}✓ Poppler (pdftoppm) disponible : $POP_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ Attention: Poppler (pdftoppm) n'est pas détecté dans votre PATH.${NC}"
    echo -e "${YELLOW}   La conversion d'images de PDF échouera.${NC}"
    SYSTEM_OK=false
fi

if [ "$SYSTEM_OK" = false ]; then
    echo -e "${YELLOW}💡 Conseil : Installez-les via Homebrew : brew install tesseract poppler${NC}"
fi

# 3. Start Backend (Uvicorn on Port 8000)
echo -e "\n${CYAN}[3/4] Lancement du Backend sur le port 8000...${NC}"
# Check if port 8000 is already in use
if lsof -i :8000 >/dev/null 2>&1; then
    echo -e "${YELLOW}ℹ Port 8000 déjà utilisé. Le backend tourne probablement déjà.${NC}"
else
    echo -e "${BLUE}Démarrage du serveur FastAPI uvicorn...${NC}"
    export PYTHONPATH="$ROOT_DIR"
    "$VENV_PATH/bin/python" -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
    BACKEND_PID=$!
    
    # Wait a moment and check if it successfully started
    sleep 2
    if ps -p $BACKEND_PID > /dev/null; then
        echo -e "${GREEN}✓ Backend démarré avec succès (PID: $BACKEND_PID). Log: backend.log${NC}"
    else
        echo -e "${RED}❌ Erreur: Impossible de démarrer le backend. Vérifiez backend.log${NC}"
        exit 1
    fi
fi

# 4. Start Frontend (Next.js)
echo -e "\n${CYAN}[4/4] Lancement du Frontend...${NC}"
cd "$ROOT_DIR/frontend"

# Check if port 3000 is occupied, Next.js will auto fallback to 3001
PORT_3000_BUSY=false
if lsof -i :3000 >/dev/null 2>&1; then
    PORT_3000_BUSY=true
fi

echo -e "${BLUE}Démarrage du serveur Next.js en arrière-plan...${NC}"
npm run dev > "$ROOT_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

sleep 2
if ps -p $FRONTEND_PID > /dev/null; then
    if [ "$PORT_3000_BUSY" = true ]; then
        echo -e "${GREEN}✓ Frontend démarré avec succès (PID: $FRONTEND_PID) sur le port 3001. Log: frontend.log${NC}"
        FRONT_URL="http://localhost:3001"
    else
        echo -e "${GREEN}✓ Frontend démarré avec succès (PID: $FRONTEND_PID) sur le port 3000. Log: frontend.log${NC}"
        FRONT_URL="http://localhost:3000"
    fi
else
    echo -e "${RED}❌ Erreur: Le frontend n'a pas pu démarrer. Consultez frontend.log${NC}"
    # Stop backend if we just started it
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID
    fi
    exit 1
fi

# Clean exit on Ctrl+C
trap cleanup EXIT

cleanup() {
    echo -e "\n\n${YELLOW}🛑 Arrêt des serveurs Passerelle OS...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo -e "${GREEN}✓ Tous les serveurs ont été arrêtés proprement.${NC}"
}

# Display Onboarding / Admin info
echo -e "\n${BLUE}==================================================${NC}"
echo -e "${GREEN}🎉 Passerelle OS tourne localement avec succès !  ${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "\n${YELLOW}🔗 Liens d'accès :${NC}"
echo -e "🖥️  Frontend (UI Passerelle) :   ${CYAN}${FRONT_URL}${NC}"
echo -e "🩺 Santé API (Backend) :        ${CYAN}http://127.0.0.1:8000/api/v1/system/health${NC}"
echo -e "📖 Documentation API interactive : ${CYAN}http://127.0.0.1:8000/docs${NC}"

echo -e "\n${YELLOW}🔑 Identifiants Démo (Bénévole) :${NC}"
echo -e "📧 Email :    ${CYAN}demo@passerelle.ai${NC}"
echo -e "🔑 Password : ${CYAN}demo123${NC}"

echo -e "\n${YELLOW}👑 Créer un compte Fondateur (Admin complet) :${NC}"
echo -e "👉 Exécutez dans un autre terminal : ${GREEN}./backend/.venv/bin/python scripts/create_admin.py${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "Appuyez sur ${YELLOW}[Ctrl + C]${NC} à tout moment pour arrêter tous les serveurs."

# Keep script running to maintain processes
while true; do
    sleep 1
done
