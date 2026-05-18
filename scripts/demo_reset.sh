#!/usr/bin/env bash
set -e

echo "=================================================="
echo "        Passerelle OS Local DB Reset 🗄️           "
echo "=================================================="

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo ""
echo "[1/5] Nettoyage des fichiers temporaires..."
rm -rf uploads/*
mkdir -p uploads
echo "✓ Dossier d'uploads nettoyé."

echo ""
echo "[2/5] Libération du port 8000..."
PIDS="$(lsof -t -i:8000 2>/dev/null || true)"
if [ -n "$PIDS" ]; then
  echo "$PIDS" | xargs kill -9 2>/dev/null || true
  echo "✓ Process backend arrêté."
else
  echo "✓ Aucun process sur le port 8000."
fi

echo ""
echo "[3/5] Réinitialisation PostgreSQL..."
psql postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='passerelle' AND pid <> pg_backend_pid();" >/dev/null 2>&1 || true
dropdb passerelle 2>/dev/null || true
createdb passerelle
echo "✓ Base passerelle recréée."

echo ""
echo "[4/5] Seed demo..."
PYTHONPATH=. ./backend/.venv/bin/python scripts/seed_demo.py
echo "✓ Données de démo créées."

echo ""
echo "[5/5] Vérification utilisateur demo..."
psql postgresql://passerelle:passerelle@localhost:5432/passerelle -c "SELECT email, role, is_active FROM profile;"

echo ""
echo "=================================================="
echo "✅ Reset terminé."
echo "Frontend: http://localhost:3000 ou 3001"
echo "Backend:  http://127.0.0.1:8000"
echo "Login demo: demo@passerelle.ai / demo123"
echo "Créer admin: PYTHONPATH=. ./backend/.venv/bin/python scripts/create_admin.py"
echo "=================================================="
