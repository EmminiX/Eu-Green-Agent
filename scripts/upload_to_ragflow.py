#!/usr/bin/env python3
"""
Script to upload all EU Green Deal documents to RAGFlow
"""
import asyncio
import os
import sys
import logging
from pathlib import Path
from typing import List

# Add the backend directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from agents.ragflow_chat_agent import ragflow_chat_agent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def find_training_documents(training_dir: str = "training_docs") -> List[str]:
    """Find all training documents"""
    training_path = Path(__file__).parent.parent / training_dir
    
    if not training_path.exists():
        logger.error(f"Training directory not found: {training_path}")
        return []
    
    documents = []
    for file_path in training_path.glob("*.pdf"):
        documents.append(str(file_path))
    
    logger.info(f"Found {len(documents)} PDF documents in {training_path}")
    return documents

async def upload_documents():
    """Upload all EU Green Deal documents to RAGFlow"""
    try:
        # Initialize RAGFlow agent
        logger.info("Initializing RAGFlow chat agent...")
        success = await ragflow_chat_agent.initialize()
        
        if not success:
            logger.error("Failed to initialize RAGFlow chat agent")
            return False
        
        # Find training documents
        documents = find_training_documents()
        
        if not documents:
            logger.error("No documents found to upload")
            return False
        
        logger.info(f"Starting upload of {len(documents)} documents...")
        
        # Upload documents
        results = await ragflow_chat_agent.upload_documents(documents)
        
        # Report results
        successful = sum(1 for success in results.values() if success)
        failed = len(results) - successful
        
        logger.info(f"Upload completed: {successful} successful, {failed} failed")
        
        # Print detailed results
        for doc_path, success in results.items():
            status = "✓" if success else "✗"
            doc_name = Path(doc_path).name
            logger.info(f"{status} {doc_name}")
        
        # Get knowledge base stats
        stats = await ragflow_chat_agent.get_knowledge_base_stats()
        if stats:
            logger.info(f"Knowledge base stats: {stats}")
        
        return successful > 0
        
    except Exception as e:
        logger.error(f"Error during document upload: {e}")
        return False

async def test_ragflow_queries():
    """Test RAGFlow with sample queries"""
    test_queries = [
        "What is the EU Green Deal?",
        "What are the key objectives of the European Green Deal?",
        "How does the EU plan to achieve carbon neutrality by 2050?",
        "What is the EU Taxonomy Regulation?",
        "What are the requirements for sustainable finance?"
    ]
    
    logger.info("Testing RAGFlow with sample queries...")
    
    for query in test_queries:
        try:
            logger.info(f"Query: {query}")
            response = await ragflow_chat_agent.chat(query)
            logger.info(f"Response: {response.message[:200]}...")
            
            if response.sources:
                logger.info(f"Sources: {len(response.sources)} documents")
            
            logger.info("-" * 50)
            
        except Exception as e:
            logger.error(f"Error testing query '{query}': {e}")

async def main():
    """Main function"""
    try:
        # Upload documents
        logger.info("="*60)
        logger.info("EU GREEN DEAL RAGFLOW DOCUMENT UPLOAD")
        logger.info("="*60)
        
        upload_success = await upload_documents()
        
        if upload_success:
            logger.info("Document upload completed successfully!")
            
            # Test queries
            logger.info("="*60)
            logger.info("TESTING RAGFLOW QUERIES")
            logger.info("="*60)
            
            await test_ragflow_queries()
        else:
            logger.error("Document upload failed!")
            
    except Exception as e:
        logger.error(f"Error in main: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())