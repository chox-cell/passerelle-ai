#!/bin/bash

# Configuration
DB_NAME="passerelle"
UPLOAD_DIR="./uploads"

echo "🗑️  Resetting Passerelle AI Demo..."

# 1. Clean uploads
echo "📁 Cleaning uploads directory..."
rm -rf $UPLOAD_DIR/*
mkdir -p $UPLOAD_DIR/demo
touch $UPLOAD_DIR/demo/.gitkeep

# 2. Reset Database
echo "🗄️  Resetting Database ($DB_NAME)..."
dropdb $DB_NAME --if-exists
createdb $DB_NAME

# 3. Initialize Schema & Seed
echo "🌱 Initializing schema and seeding data..."
export PYTHONPATH=$PYTHONPATH:.
python scripts/seed_demo.py

echo ""
echo "✨ Demo environment ready!"
echo "🚀 Backend: http://localhost:8000"
echo "🖥️  Frontend: http://localhost:3000"
echo ""
