import sys
import os
from sqlalchemy import create_engine, text

# Ensure backend modules can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.config import settings

def check_schema():
    print("🔍 Running Local Database Schema Doctor...")
    
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as connection:
            # 1. Check if tables exist
            tables = ["workspace", "profile", "case", "document", "ocrresult", "extractionresult", "task", "auditlog", "consent", "report"]
            missing_tables = []
            
            for table in tables:
                query = text("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = :table
                    );
                """)
                exists = connection.execute(query, {"table": table}).scalar()
                if not exists:
                    missing_tables.append(table)
            
            if missing_tables:
                print(f"❌ Error: Missing tables: {', '.join(missing_tables)}")
                print("\n💥 Schéma local obsolète — lancez ./scripts/demo_reset.sh\n")
                sys.exit(1)
                
            # 2. Check columns in profile
            required_profile_columns = ["password_hash", "is_active"]
            missing_columns = []
            
            for col in required_profile_columns:
                query = text("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.columns 
                        WHERE table_name = 'profile' AND column_name = :col
                    );
                """)
                exists = connection.execute(query, {"col": col}).scalar()
                if not exists:
                    missing_columns.append(col)
                    
            if missing_columns:
                print(f"❌ Error: Table 'profile' is missing columns: {', '.join(missing_columns)}")
                print("\n💥 Schéma local obsolète — lancez ./scripts/demo_reset.sh\n")
                sys.exit(1)
                
            print("💚 Success: All required tables and columns are present and consistent!")
            sys.exit(0)
            
    except Exception as e:
        print(f"❌ Database Connection Error: {str(e)}")
        print("\n👉 Vérifiez que PostgreSQL est actif sur le port 5432.\n")
        sys.exit(1)

if __name__ == "__main__":
    check_schema()
