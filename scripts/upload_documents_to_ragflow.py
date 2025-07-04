#!/usr/bin/env python3
"""
Upload all EU Green Deal documents to RAGFlow
"""

import asyncio
import os
import sys
import logging
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent / "backend"))

from services.rag_service import RAGService
from core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def upload_all_documents():
    """Upload all documents from training_docs to RAGFlow"""
    
    # Check if we have required configuration
    if not settings.RAGFLOW_KNOWLEDGE_BASE_ID:
        logger.error("RAGFLOW_KNOWLEDGE_BASE_ID not set. Please create a knowledge base in RAGFlow first.")
        print("\n🚨 Setup Required:")
        print("1. Start RAGFlow: docker compose up ragflow -d")
        print("2. Open http://localhost:9380")
        print("3. Login with: ragflow@ragflow.io / ragflow")
        print("4. Create a knowledge base")
        print("5. Set RAGFLOW_KNOWLEDGE_BASE_ID in your .env file")
        return False
    
    training_docs_path = Path(__file__).parent.parent / "training_docs"
    
    if not training_docs_path.exists():
        logger.error(f"Training docs directory not found: {training_docs_path}")
        return False
    
    # Get all PDF files
    pdf_files = list(training_docs_path.glob("*.pdf"))
    
    if not pdf_files:
        logger.error("No PDF files found in training_docs directory")
        return False
    
    logger.info(f"Found {len(pdf_files)} documents to upload")
    
    # Initialize RAG service
    rag_service = RAGService()
    
    # Test connection first
    logger.info("Testing RAGFlow connection...")
    if not await rag_service.health_check():
        logger.error("Failed to connect to RAGFlow. Make sure it's running.")
        return False
    
    logger.info("✅ RAGFlow connection successful")
    
    # Upload each document
    successful_uploads = 0
    failed_uploads = 0
    
    for pdf_file in pdf_files:
        try:
            logger.info(f"Uploading: {pdf_file.name}")
            
            success = await rag_service.upload_document(
                file_path=str(pdf_file),
                doc_name=pdf_file.name
            )
            
            if success:
                successful_uploads += 1
                logger.info(f"✅ Successfully uploaded: {pdf_file.name}")
            else:
                failed_uploads += 1
                logger.error(f"❌ Failed to upload: {pdf_file.name}")
                
        except Exception as e:
            failed_uploads += 1
            logger.error(f"❌ Error uploading {pdf_file.name}: {str(e)}")
    
    # Summary
    logger.info(f"\n📊 Upload Summary:")
    logger.info(f"✅ Successful: {successful_uploads}")
    logger.info(f"❌ Failed: {failed_uploads}")
    logger.info(f"📁 Total: {len(pdf_files)}")
    
    if successful_uploads > 0:
        logger.info(f"\n🎉 Successfully uploaded {successful_uploads} documents to RAGFlow!")
        logger.info(f"Knowledge Base ID: {settings.RAGFLOW_KNOWLEDGE_BASE_ID}")
        
        # List documents in KB
        documents = await rag_service.list_documents()
        logger.info(f"Total documents in KB: {len(documents)}")
    
    return successful_uploads == len(pdf_files)

async def main():
    """Main function"""
    logger.info("🚀 Starting document upload to RAGFlow...")
    
    success = await upload_all_documents()
    
    if success:
        logger.info("🎯 All documents uploaded successfully!")
        return 0
    else:
        logger.error("💥 Some documents failed to upload")
        return 1

if __name__ == "__main__":
    sys.exit(asyncio.run(main()))