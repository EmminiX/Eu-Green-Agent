"""
Configuration settings for the EU Green Policies Chatbot
"""

import os
from functools import lru_cache
from typing import List, Union

from pydantic import Field, field_validator, ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "EU Green Policies Chatbot"
    VERSION: str = "1.0.0"
    DEBUG: bool = Field(default=False, env="DEBUG")
    HOST: str = Field(default="0.0.0.0", env="AI_SERVICE_HOST")
    PORT: int = Field(default=8000, env="AI_SERVICE_PORT")
    
    # CORS
    CORS_ORIGINS: Union[str, List[str]] = Field(default=["http://localhost:3000"], env="CORS_ORIGIN")
    
    @field_validator('CORS_ORIGINS')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    # OpenAI
    OPENAI_API_KEY: str = Field(..., env="OPENAI_API_KEY")
    OPENAI_MODEL: str = Field(default="gpt-4o-mini", env="OPENAI_MODEL")
    OPENAI_MAX_TOKENS: int = Field(default=4000, env="OPENAI_MAX_TOKENS")
    OPENAI_TEMPERATURE: float = Field(default=0.7, env="OPENAI_TEMPERATURE")
    
    # Database
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    
    # Redis
    REDIS_HOST: str = Field(default="localhost", env="REDIS_HOST")
    REDIS_PORT: int = Field(default=6379, env="REDIS_PORT")
    REDIS_PASSWORD: str = Field(default="", env="REDIS_PASSWORD")
    REDIS_DB: int = Field(default=0, env="REDIS_DB")
    
    # Web Search APIs
    TAVILY_API_KEY: str = Field(default="", env="TAVILY_API_KEY")
    FIRECRAWL_API_KEY: str = Field(default="", env="FIRECRAWL_API_KEY")
    
    # RAG Configuration
    RAG_TOP_K: int = Field(default=5, env="RAG_TOP_K")
    RAG_SIMILARITY_THRESHOLD: float = Field(default=0.7, env="RAG_SIMILARITY_THRESHOLD")
    RAG_MAX_CONTEXT_LENGTH: int = Field(default=8000, env="RAG_MAX_CONTEXT_LENGTH")
    
    # Document Processing
    MAX_DOCUMENT_SIZE: str = Field(default="10MB", env="MAX_DOCUMENT_SIZE")
    ALLOWED_FILE_TYPES: Union[str, List[str]] = Field(default=["pdf", "txt", "docx", "html"], env="ALLOWED_FILE_TYPES")
    CHUNK_SIZE: int = Field(default=1000, env="CHUNK_SIZE")
    CHUNK_OVERLAP: int = Field(default=200, env="CHUNK_OVERLAP")
    
    @field_validator('ALLOWED_FILE_TYPES')
    @classmethod
    def parse_allowed_file_types(cls, v):
        if isinstance(v, str):
            return [ft.strip() for ft in v.split(',')]
        return v
    
    # Security
    SECRET_KEY: str = Field(default="dev-secret-key", env="SESSION_SECRET")
    
    # LangSmith (Optional)
    LANGCHAIN_TRACING_V2: bool = Field(default=False, env="LANGCHAIN_TRACING_V2")
    LANGCHAIN_ENDPOINT: str = Field(
        default="https://api.smith.langchain.com",
        env="LANGCHAIN_ENDPOINT"
    )
    LANGCHAIN_API_KEY: str = Field(default="", env="LANGCHAIN_API_KEY")
    LANGCHAIN_PROJECT: str = Field(
        default="eu-green-chatbot",
        env="LANGCHAIN_PROJECT"
    )
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    
    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra='allow'  # Allow extra environment variables
    )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()