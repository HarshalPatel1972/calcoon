import os
import psycopg2
import uuid
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

FACTS = [
    {
        "id": str(uuid.uuid4()),
        "trigger_value": 42,
        "trigger_type": "exact",
        "category": "pop_culture",
        "rarity": "rare",
        "format_family": "has_a_name",
        "copy_template": "the answer to the ultimate question of life, the universe, and everything.",
        "verified": True
    },
    {
        "id": str(uuid.uuid4()),
        "trigger_value": 3.14159,
        "trigger_type": "range",
        "range_min": 3.14,
        "range_max": 3.15,
        "category": "math_property",
        "rarity": "uncommon",
        "format_family": "has_a_name",
        "copy_template": "Pi (approximate) - the ratio of a circle's circumference to its diameter.",
        "verified": True
    },
    {
        "id": str(uuid.uuid4()),
        "trigger_value": 11.2,
        "trigger_type": "exact",
        "category": "space",
        "rarity": "legendary",
        "format_family": "add_a_unit",
        "copy_template": "km/s, and you have the escape velocity of Earth.",
        "verified": True
    },
    {
        "id": str(uuid.uuid4()),
        "trigger_value": 206,
        "trigger_type": "exact",
        "category": "body",
        "rarity": "common",
        "format_family": "you_just_became",
        "copy_template": "a fully grown human skeleton (that's how many bones you have).",
        "verified": True
    }
]

def seed_db():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            for fact in FACTS:
                # Upsert to avoid issues if run multiple times
                cur.execute("""
                    INSERT INTO facts (id, trigger_value, trigger_type, range_min, range_max, category, rarity, format_family, copy_template, verified, active)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, true)
                    ON CONFLICT (id) DO NOTHING;
                """, (
                    fact["id"],
                    fact.get("trigger_value"),
                    fact["trigger_type"],
                    fact.get("range_min"),
                    fact.get("range_max"),
                    fact["category"],
                    fact["rarity"],
                    fact["format_family"],
                    fact["copy_template"],
                    fact["verified"]
                ))
            print("Facts seeded successfully.")
    except Exception as e:
        print(f"Error seeding DB: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    seed_db()
