from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

router = APIRouter(prefix="/facts", tags=["facts"])

def get_db():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    conn.autocommit = True
    try:
        yield conn
    finally:
        conn.close()

@router.get("/")
def get_all_active_facts(conn = Depends(get_db)):
    """Returns all active facts for the client to cache triggers."""
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM facts WHERE active = true")
        facts = cur.fetchall()
    
    # We must convert Decimals to float for JSON serialization
    for fact in facts:
        if fact["trigger_value"] is not None:
            fact["trigger_value"] = float(fact["trigger_value"])
        if fact["range_min"] is not None:
            fact["range_min"] = float(fact["range_min"])
        if fact["range_max"] is not None:
            fact["range_max"] = float(fact["range_max"])
            
    return {"facts": facts}

class FactInteraction(BaseModel):
    user_id: str
    fact_id: str
    interaction: str
    calc_context: dict | None = None

@router.post("/interaction")
def record_interaction(payload: FactInteraction, conn = Depends(get_db)):
    """Records user engagement and updates CF"""
    with conn.cursor() as cur:
        # Insert interaction
        cur.execute("""
            INSERT INTO user_facts (id, user_id, fact_id, interaction, calc_context)
            VALUES (gen_random_uuid(), %s, %s, %s, %s)
        """, (payload.user_id, payload.fact_id, payload.interaction, psycopg2.extras.Json(payload.calc_context) if payload.calc_context else None))
        
        # Update Curiosity Factor based on interaction
        multiplier = 0.85 if payload.interaction == 'engaged' else 1.15
        
        cur.execute("""
            UPDATE users 
            SET curiosity_factor = GREATEST(0.5, LEAST(2.0, curiosity_factor * %s)),
                last_fact_shown_at = now()
            WHERE id = %s
        """, (multiplier, payload.user_id))
        
    return {"status": "success"}
