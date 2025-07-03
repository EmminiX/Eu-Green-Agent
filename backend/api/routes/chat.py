"""
Chat endpoints for the EU Green Policies Chatbot
"""

import logging
import tempfile
import os
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, File, UploadFile, Form
from pydantic import BaseModel
import openai

from core.logging_config import get_logger
from core.compliance import get_ai_act_compliance
from services.chat_service import get_chat_service

logger = get_logger(__name__)
router = APIRouter()


class ChatMessage(BaseModel):
    """Chat message model"""
    message: str
    session_id: Optional[str] = None
    language: Optional[str] = "en"
    context: Optional[dict] = None
    ai_consent: Optional[dict] = None  # EU AI Act consent information


class ChatResponse(BaseModel):
    """Chat response model"""
    response: str
    session_id: str
    sources: List[dict] = []
    confidence: float = 0.0
    timestamp: datetime
    language: str = "en"
    ai_markers: Optional[dict] = None  # EU AI Act compliance markers


class ChatHistory(BaseModel):
    """Chat history model"""
    session_id: str
    messages: List[dict]
    created_at: datetime
    updated_at: datetime


@router.post("/message", response_model=ChatResponse)
async def send_message(message: ChatMessage):
    """Send a message to the chatbot and get a response"""
    try:
        logger.info(f"Received chat message: {message.message[:100]}...")
        
        # Get compliance handler
        compliance = get_ai_act_compliance()
        
        # Validate AI consent (EU AI Act Article 50 requirement)
        if message.ai_consent and not compliance.validate_consent(message.ai_consent):
            raise HTTPException(
                status_code=400, 
                detail="Invalid or missing AI interaction consent"
            )
        
        # Get chat service singleton
        chat_service = get_chat_service()
        
        # Process the message
        response_data = await chat_service.process_message(
            message=message.message,
            session_id=message.session_id,
            language=message.language,
            context=message.context
        )
        
        # Mark response as AI-generated (EU AI Act Article 50 compliance)
        ai_content = compliance.mark_ai_generated_content(
            content=response_data["response"],
            metadata={
                "query": message.message,
                "language": message.language,
                "confidence": response_data["confidence"],
                "sources_count": len(response_data["sources"])
            }
        )
        
        # Log AI interaction for compliance
        compliance.log_ai_interaction(
            session_id=response_data["session_id"],
            query=message.message,
            response=response_data["response"],
            consent_info=message.ai_consent
        )
        
        # Create response model
        response = ChatResponse(
            response=response_data["response"],
            session_id=response_data["session_id"],
            sources=response_data["sources"],
            confidence=response_data["confidence"],
            timestamp=datetime.fromisoformat(response_data["timestamp"]),
            language=response_data["language"],
            ai_markers=ai_content["ai_markers"]
        )
        
        logger.info(f"Generated response for session {response.session_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing chat message: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process message")


@router.get("/history/{session_id}", response_model=ChatHistory)
async def get_chat_history(session_id: str):
    """Get chat history for a session"""
    try:
        chat_service = get_chat_service()
        history = await chat_service.get_chat_history(session_id)
        
        if not history:
            raise HTTPException(status_code=404, detail="Chat history not found")
        
        return history
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving chat history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to retrieve chat history")


@router.delete("/history/{session_id}")
async def clear_chat_history(session_id: str):
    """Clear chat history for a session"""
    try:
        chat_service = get_chat_service()
        await chat_service.clear_chat_history(session_id)
        return {"message": "Chat history cleared successfully"}
        
    except Exception as e:
        logger.error(f"Error clearing chat history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to clear chat history")


class SpeechToTextResponse(BaseModel):
    """Speech-to-text response model"""
    transcript: str
    language: Optional[str] = None
    confidence: float = 0.0
    timestamp: datetime


@router.post("/speech-to-text", response_model=SpeechToTextResponse)
async def speech_to_text(
    audio_file: UploadFile = File(...),
    language: Optional[str] = Form(None)
):
    """
    Convert speech audio to text using OpenAI Whisper
    
    Supports various audio formats: mp3, wav, webm, m4a, ogg, flac
    Maximum file size: 25MB (OpenAI limit)
    """
    try:
        logger.info(f"Received audio file for transcription: {audio_file.filename}")
        
        # Validate file size (25MB OpenAI limit)
        max_size = 25 * 1024 * 1024  # 25MB in bytes
        audio_content = await audio_file.read()
        
        if len(audio_content) > max_size:
            raise HTTPException(
                status_code=413,
                detail="Audio file too large. Maximum size is 25MB."
            )
        
        # Validate audio format
        allowed_formats = ['.mp3', '.wav', '.webm', '.m4a', '.ogg', '.flac']
        file_extension = os.path.splitext(audio_file.filename or '')[1].lower()
        
        if not file_extension or file_extension not in allowed_formats:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported audio format. Allowed formats: {', '.join(allowed_formats)}"
            )
        
        # Create temporary file for audio processing
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            temp_file.write(audio_content)
            temp_file_path = temp_file.name
        
        try:
            # Initialize OpenAI client
            from core.config import get_settings
            settings = get_settings()
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            
            # Transcribe audio using Whisper
            with open(temp_file_path, 'rb') as audio_data:
                transcription_params = {
                    "model": "whisper-1",
                    "file": audio_data,
                    "response_format": "verbose_json"
                }
                
                # Add language parameter if provided
                if language and language != 'auto':
                    # Map common language codes to Whisper supported codes
                    language_map = {
                        'en': 'en',
                        'fr': 'fr', 
                        'de': 'de',
                        'es': 'es',
                        'it': 'it',
                        'pt': 'pt',
                        'nl': 'nl',
                        'pl': 'pl',
                        'ro': 'ro'
                    }
                    
                    mapped_language = language_map.get(language[:2].lower())
                    if mapped_language:
                        transcription_params["language"] = mapped_language
                
                response = client.audio.transcriptions.create(**transcription_params)
            
            # Extract transcript and metadata
            transcript = response.text.strip()
            detected_language = getattr(response, 'language', None)
            
            # Calculate confidence (Whisper doesn't provide direct confidence scores)
            # Use length and word count as proxy for confidence
            confidence = min(0.95, max(0.7, len(transcript.split()) / 50)) if transcript else 0.0
            
            logger.info(f"Transcription completed. Text length: {len(transcript)} chars")
            
            return SpeechToTextResponse(
                transcript=transcript,
                language=detected_language,
                confidence=confidence,
                timestamp=datetime.utcnow()
            )
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
        
    except HTTPException:
        raise
    except openai.OpenAIError as e:
        logger.error(f"OpenAI API error during transcription: {e}")
        raise HTTPException(
            status_code=502,
            detail="Speech recognition service temporarily unavailable"
        )
    except Exception as e:
        logger.error(f"Error processing speech-to-text: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to process audio file"
        )


class ConnectionManager:
    """WebSocket connection manager"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)


manager = ConnectionManager()


@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time chat"""
    await manager.connect(websocket)
    chat_service = ChatService()
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            logger.info(f"WebSocket message received: {data[:100]}...")
            
            try:
                # Process message
                response = await chat_service.process_message(
                    message=data,
                    session_id=session_id,
                    language="en"
                )
                
                # Send response back to client
                await manager.send_personal_message(
                    response.model_dump_json(),
                    websocket
                )
                
            except Exception as e:
                logger.error(f"Error processing WebSocket message: {e}")
                await manager.send_personal_message(
                    '{"error": "Failed to process message"}',
                    websocket
                )
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)


@router.get("/ai-disclosure")
async def get_ai_disclosure(language: str = "en"):
    """Get AI system disclosure information as required by EU AI Act Article 50"""
    try:
        compliance = get_ai_act_compliance()
        disclosure_info = compliance.create_ai_disclosure_notice(language)
        
        return {
            "disclosure": disclosure_info,
            "headers": compliance.create_compliance_headers(),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting AI disclosure: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get AI disclosure information")


@router.post("/consent")
async def record_ai_consent(consent_data: dict):
    """Record user consent for AI interaction (EU AI Act compliance)"""
    try:
        compliance = get_ai_act_compliance()
        
        # Validate consent format
        required_fields = ["accepted", "timestamp", "language", "version"]
        if not all(field in consent_data for field in required_fields):
            raise HTTPException(
                status_code=400,
                detail="Missing required consent fields"
            )
        
        # Validate consent
        is_valid = compliance.validate_consent(consent_data)
        
        if not is_valid:
            raise HTTPException(
                status_code=400,
                detail="Invalid consent data"
            )
        
        # Log consent (in production, store in database)
        logger.info(f"AI consent recorded: {consent_data}")
        
        return {
            "status": "consent_recorded",
            "valid": is_valid,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error recording AI consent: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to record consent")