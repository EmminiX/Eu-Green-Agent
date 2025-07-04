from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from core.config import settings


router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str
    agent_name: str


@router.get("/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(),
        version="2.0.0",
        agent_name=settings.AGENT_NAME
    )