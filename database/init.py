"""
Database initialization script for Compare Bot
Run this to set up the database schema
"""

import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def init_database():
    """Initialize the database with required schema"""
    
    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL") or os.getenv("NEON_DATABASE_URL")
    
    if not database_url:
        print("Error: DATABASE_URL or NEON_DATABASE_URL environment variable not set")
        return False
    
    try:
        # Connect to database
        conn = psycopg2.connect(database_url)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Read and execute schema
        with open(os.path.join(os.path.dirname(__file__), 'schema.sql'), 'r') as f:
            schema_sql = f.read()
        
        cursor.execute(schema_sql)
        
        print("✅ Database schema created successfully")
        
        # Verify tables were created
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('reports', 'clients')
        """)
        
        tables = cursor.fetchall()
        print(f"✅ Created tables: {[table[0] for table in tables]}")
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        return False

if __name__ == "__main__":
    init_database()
