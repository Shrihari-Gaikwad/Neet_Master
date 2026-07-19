import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def drop_all_tables():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cursor = conn.cursor()
    
    print("Dropping public schema...")
    cursor.execute("DROP SCHEMA public CASCADE;")
    print("Recreating public schema...")
    cursor.execute("CREATE SCHEMA public;")
    cursor.execute("GRANT ALL ON SCHEMA public TO postgres;")
    cursor.execute("GRANT ALL ON SCHEMA public TO public;")
    
    print("Database wiped successfully.")
    cursor.close()
    conn.close()

if __name__ == "__main__":
    drop_all_tables()
