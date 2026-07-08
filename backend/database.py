import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL is not set.")
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    conn.autocommit = True
    return conn

def init_db():
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            with open("schema.sql", "r") as f:
                schema = f.read()
            cur.execute(schema)
            print("Database schema initialized successfully.")
    except Exception as e:
        print(f"Error initializing DB schema: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    init_db()
