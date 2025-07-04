from fastapi import APIRouter, HTTPException, File, UploadFile
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from agents.verdana_agent import VerdanaAgent
from services.stt_service import STTService

logger = logging.getLogger(__name__)

router = APIRouter()


class ChatMessage(BaseModel):
    message: str
    session_id: str
    language: str = "en"
    ai_consent: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str
    timestamp: datetime
    sources: List[Dict[str, Any]] = []


# Initialize agent and services
verdana_agent = VerdanaAgent()
stt_service = STTService()


@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatMessage):
    """Handle chat message from frontend"""
    try:
        logger.info(f"Received message for session {request.session_id}")
        
        # Check AI consent
        if not request.ai_consent:
            raise HTTPException(
                status_code=403,
                detail="AI consent required"
            )
        
        # Process message through Verdana agent
        response_data = await verdana_agent.process_query(
            query=request.message,
            session_id=request.session_id,
            language=request.language
        )
        
        return ChatResponse(
            response=response_data["response"],
            session_id=request.session_id,
            timestamp=datetime.now(),
            sources=response_data.get("sources", [])
        )
        
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error processing message"
        )


@router.post("/speech-to-text")
async def speech_to_text(audio: UploadFile = File(...)):
    """Convert speech to text using OpenAI Whisper"""
    try:
        logger.info(f"Received audio file: {audio.filename}, content_type: {audio.content_type}")
        
        # Check file size (25MB limit)
        if audio.size and audio.size > stt_service.get_max_file_size():
            raise HTTPException(
                status_code=413,
                detail="File too large. Maximum size is 25MB."
            )
        
        # Check file format
        if audio.content_type and not any(fmt in audio.content_type for fmt in ["audio", "video"]):
            raise HTTPException(
                status_code=400,
                detail="Invalid file format. Please upload an audio file."
            )
        
        # Read audio data
        audio_data = await audio.read()
        
        if not audio_data:
            raise HTTPException(
                status_code=400,
                detail="Empty audio file"
            )
        
        # Transcribe audio
        transcribed_text = await stt_service.transcribe_audio(audio_data)
        
        return {
            "text": transcribed_text,
            "language": "auto-detected",
            "success": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing audio: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing audio: {str(e)}"
        )