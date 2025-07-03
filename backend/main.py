"""
EU Green Policies Chatbot Backend
FastAPI application with multi-agent system and Graphiti knowledge graph
"""

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from core.config import get_settings
from core.database import init_db
from core.logging_config import setup_logging
from api.routes import chat, documents, health, database


# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Load settings
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting EU Green Policies Chatbot Backend")
    
    # Initialize database
    await init_db()
    
    # Initialize services
    logger.info("Services initialized successfully")
    
    yield
    
    logger.info("Shutting down EU Green Policies Chatbot Backend")


# Create FastAPI app
app = FastAPI(
    title="EU Green Policies Chatbot API",
    description="Multi-agent chatbot system for EU Green policies information",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


# Include routers
app.include_router(health.router, prefix="/api/health", tags=["health"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(database.router, prefix="/api/database", tags=["database"])


# Serve static files
static_path = Path(__file__).parent / "static"
if static_path.exists():
    app.mount("/static", StaticFiles(directory=str(static_path)), name="static")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "EU Green Policies Chatbot API",
        "version": "1.0.0",
        "docs": "/api/docs"
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_config=None  # Use our custom logging config
    )