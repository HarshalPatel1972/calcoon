from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
import os
import httpx
from dotenv import load_dotenv

load_dotenv()
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

router = APIRouter(prefix="/feedback", tags=["feedback"])

class FeedbackRequest(BaseModel):
    category: str
    message: str
    context: dict

async def send_telegram_message(text: str):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print(f"Telegram not configured. Would have sent: {text}")
        return
        
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": "HTML"
    }
    
    async with httpx.AsyncClient() as client:
        await client.post(url, json=payload)

@router.post("/")
async def submit_feedback(payload: FeedbackRequest, background_tasks: BackgroundTasks):
    msg = f"<b>New Calcoon Feedback</b>\n"
    msg += f"<b>Category:</b> {payload.category}\n"
    msg += f"<b>Message:</b> {payload.message}\n"
    msg += f"<b>Context:</b> <code>{payload.context}</code>"
    
    background_tasks.add_task(send_telegram_message, msg)
    return {"status": "received"}
