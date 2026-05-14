import sys
import os
from sqlmodel import SQLModel, create_engine

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from config import settings
from models import *

def setup_database():
    print(f"Initializing database at {settings.DATABASE_URL}...")
    engine = create_engine(settings.DATABASE_URL)
    SQLModel.metadata.create_all(engine)
    print("Database initialized successfully.")

if __name__ == "__main__":
    setup_database()
