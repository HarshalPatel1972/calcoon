import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import BaseModel
from solver import solve_expression_safe
from routers import facts, feedback

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Calcoon Backend")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(facts.router)
app.include_router(feedback.router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development; restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SolveRequest(BaseModel):
    expression: str

@app.get("/ping")
@limiter.limit("60/minute")
async def ping(request: Request):
    """Early wake-ping endpoint."""
    return {"status": "awake"}

@app.post("/solve")
@limiter.limit("20/minute")
async def solve(request: Request, body: SolveRequest):
    """Secure symbolic solver endpoint."""
    success, result = solve_expression_safe(body.expression, timeout=3)
    
    if not success:
        raise HTTPException(status_code=400, detail=result)
        
    return {"result": result}
