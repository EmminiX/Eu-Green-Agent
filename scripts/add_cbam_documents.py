#!/usr/bin/env python3
"""
Script to add the new CBAM documents to the RAG system
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from services.document_service import DocumentService
from core.logging_config import get_logger

logger = get_logger(__name__)

async def process_cbam_documents():
    """Process the new CBAM documents and add them to RAG"""
    
    # Path to training documents
    training_docs_dir = Path(__file__).parent.parent / "training_docs"
    
    # Documents to process
    documents = [
        "CBAM_implementatio_for_importers_of_goods_into_the_EU.pdf",
        "CBAM_implementation_for_installation_operators_outside_the_EU.pdf"
    ]
    
    doc_service = DocumentService()
    
    for doc_filename in documents:
        doc_path = training_docs_dir / doc_filename
        
        if not doc_path.exists():
            logger.error(f"Document not found: {doc_path}")
            continue
            
        logger.info(f"Processing document: {doc_filename}")
        
        try:
            # Read the document content
            with open(doc_path, "rb") as f:
                content = f.read()
            
            # Process the document
            result = await doc_service.process_document(
                filename=doc_filename,
                content=content,
                file_type="pdf",
                language="en"
            )
            
            if result["status"] == "processed":
                logger.info(f"✅ Successfully processed: {doc_filename}")
                logger.info(f"   Document ID: {result['document_id']}")
                logger.info(f"   Message: {result['message']}")
            else:
                logger.error(f"❌ Failed to process: {doc_filename}")
                logger.error(f"   Message: {result['message']}")
                
        except Exception as e:
            logger.error(f"❌ Error processing {doc_filename}: {e}", exc_info=True)

async def main():
    """Main function"""
    logger.info("🚀 Starting CBAM documents processing...")
    
    try:
        await process_cbam_documents()
        logger.info("✅ CBAM documents processing completed!")
        
    except Exception as e:
        logger.error(f"❌ Error in main process: {e}", exc_info=True)
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)