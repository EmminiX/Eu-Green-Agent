import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""
    
    # Server settings
    PORT: int = 8000
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    
    # Database Configuration
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@postgres:5432/eu_green_chatbot"
    
    # API Keys
    OPENAI_API_KEY: Optional[str] = None
    TAVILY_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    FIRECRAWL_API_KEY: Optional[str] = None
    
    # Document Processing Configuration
    CHUNK_SIZE: int = 800
    CHUNK_OVERLAP: int = 300
    
    # OpenAI Configuration
    OPENAI_MODEL: str = "gpt-4"
    OPENAI_TEMPERATURE: float = 0.7
    OPENAI_MAX_TOKENS: int = 1000
    
    # OpenAI Embeddings Configuration
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-large"
    VECTOR_DIMENSION: int = 3072
    
    # Whisper Configuration
    WHISPER_MODEL: str = "whisper-1"
    
    # Web Search Configuration
    TAVILY_MAX_RESULTS: int = 5
    
    # Vector Search Configuration
    RAG_TOP_K: int = 5
    RAG_SIMILARITY_THRESHOLD: float = 0.5
    RAG_MAX_CONTEXT_LENGTH: int = 8000
    
    # Agent Configuration
    AGENT_NAME: str = "Verdana"
    AGENT_DESCRIPTION: str = "EU Green Deal Compliance Assistant"
    AGENT_CREATOR: str = "Emmi C. (https://emmi.zone)"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()