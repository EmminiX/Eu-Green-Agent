import asyncio
import logging
from typing import Optional
import io
import openai
from core.config import settings

logger = logging.getLogger(__name__)


class STTService:
    """
    Speech-to-Text service using OpenAI Whisper API
    """
    
    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.WHISPER_MODEL
    
    async def transcribe_audio(
        self, 
        audio_data: bytes, 
        language: Optional[str] = None
    ) -> str:
        """
        Transcribe audio data using OpenAI Whisper API
        
        Args:
            audio_data: Audio file bytes
            language: Language code (optional, auto-detect if not provided)
            
        Returns:
            Transcribed text
        """
        try:
            if not settings.OPENAI_API_KEY:
                logger.error("OpenAI API key not configured")
                raise ValueError("OpenAI API key not configured")
            
            # Create a file-like object from bytes
            audio_file = io.BytesIO(audio_data)
            audio_file.name = "audio.wav"  # Required for API
            
            logger.info(f"Transcribing audio ({len(audio_data)} bytes)...")
            
            # Call OpenAI Whisper API
            transcript = self.client.audio.transcriptions.create(
                model=self.model,
                file=audio_file,
                language=language,
                response_format="text"
            )
            
            # The response is directly the text
            transcribed_text = transcript.strip()
            
            logger.info(f"Transcription completed: {transcribed_text[:100]}...")
            return transcribed_text
            
        except Exception as e:
            logger.error(f"Error transcribing audio: {str(e)}")
            raise ValueError(f"Transcription failed: {str(e)}")
    
    async def transcribe_file(
        self, 
        file_path: str, 
        language: Optional[str] = None
    ) -> str:
        """
        Transcribe audio file using OpenAI Whisper API
        
        Args:
            file_path: Path to audio file
            language: Language code (optional)
            
        Returns:
            Transcribed text
        """
        try:
            if not settings.OPENAI_API_KEY:
                logger.error("OpenAI API key not configured")
                raise ValueError("OpenAI API key not configured")
            
            logger.info(f"Transcribing file: {file_path}")
            
            # Open audio file
            with open(file_path, "rb") as audio_file:
                transcript = self.client.audio.transcriptions.create(
                    model=self.model,
                    file=audio_file,
                    language=language,
                    response_format="text"
                )
            
            transcribed_text = transcript.strip()
            
            logger.info(f"File transcription completed: {transcribed_text[:100]}...")
            return transcribed_text
            
        except Exception as e:
            logger.error(f"Error transcribing file {file_path}: {str(e)}")
            raise ValueError(f"File transcription failed: {str(e)}")
    
    async def translate_audio(
        self, 
        audio_data: bytes, 
        target_language: str = "en"
    ) -> str:
        """
        Translate audio to target language using OpenAI Whisper API
        
        Args:
            audio_data: Audio file bytes
            target_language: Target language code
            
        Returns:
            Translated text
        """
        try:
            if not settings.OPENAI_API_KEY:
                logger.error("OpenAI API key not configured")
                raise ValueError("OpenAI API key not configured")
            
            # Create a file-like object from bytes
            audio_file = io.BytesIO(audio_data)
            audio_file.name = "audio.wav"
            
            logger.info(f"Translating audio ({len(audio_data)} bytes) to {target_language}...")
            
            # Call OpenAI Whisper translation API
            translation = self.client.audio.translations.create(
                model=self.model,
                file=audio_file,
                response_format="text"
            )
            
            translated_text = translation.strip()
            
            logger.info(f"Translation completed: {translated_text[:100]}...")
            return translated_text
            
        except Exception as e:
            logger.error(f"Error translating audio: {str(e)}")
            raise ValueError(f"Translation failed: {str(e)}")
    
    async def health_check(self) -> bool:
        """
        Check if STT service is healthy
        
        Returns:
            Health status
        """
        try:
            if not settings.OPENAI_API_KEY:
                return False
            
            # Simple test with OpenAI client
            # We can't easily test Whisper without audio, so we just check API key
            return True
            
        except Exception as e:
            logger.error(f"STT health check failed: {str(e)}")
            return False
    
    def get_supported_formats(self) -> list:
        """
        Get list of supported audio formats
        
        Returns:
            List of supported file extensions
        """
        return [
            "flac", "m4a", "mp3", "mp4", "mpeg", "mpga", 
            "oga", "ogg", "wav", "webm"
        ]
    
    def get_max_file_size(self) -> int:
        """
        Get maximum file size in bytes (OpenAI limit is 25MB)
        
        Returns:
            Maximum file size in bytes
        """
        return 25 * 1024 * 1024  # 25MB