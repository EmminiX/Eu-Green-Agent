#!/usr/bin/env python3
"""
Script to process and embed all training documents into the PostgreSQL database.
This script will process all PDF documents in the training_docs directory,
extract text, chunk it, create embeddings, and store everything in the database.
"""

import os
import sys
import asyncio
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
import asyncpg
from openai import AsyncOpenAI
import PyPDF2
import hashlib
from datetime import datetime
import json

# Add the backend directory to the path so we can import from it
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from core.config import get_settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DocumentProcessor:
    def __init__(self):
        self.settings = get_settings()
        self.openai_client = AsyncOpenAI(api_key=self.settings.OPENAI_API_KEY)
        self.db_pool = None
        
    async def initialize_database(self):
        """Initialize database connection pool"""
        try:
            # Extract database connection details from DATABASE_URL
            db_url = self.settings.DATABASE_URL
            if not db_url:
                raise ValueError("DATABASE_URL not found in settings")
            
            # Parse the database URL
            # Format: postgresql+asyncpg://user:password@host:port/database
            db_url = db_url.replace('postgresql+asyncpg://', '')
            
            # For development, we'll connect directly to localhost
            self.db_pool = await asyncpg.create_pool(
                host='localhost',
                port=5432,
                user='postgres',
                password='password',
                database='eu_green_chatbot',
                min_size=1,
                max_size=10
            )
            logger.info("Database connection pool initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise

    async def close_database(self):
        """Close database connection pool"""
        if self.db_pool:
            await self.db_pool.close()
            logger.info("Database connection pool closed")

    def extract_text_from_pdf(self, pdf_path: Path) -> str:
        """Extract text from PDF file"""
        try:
            text = ""
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num, page in enumerate(pdf_reader.pages):
                    try:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
                    except Exception as e:
                        logger.warning(f"Failed to extract text from page {page_num} of {pdf_path}: {e}")
                        continue
            
            if not text.strip():
                raise ValueError("No text extracted from PDF")
                
            return text.strip()
            
        except Exception as e:
            logger.error(f"Failed to extract text from {pdf_path}: {e}")
            raise

    def chunk_text(self, text: str, chunk_size: int = 800, overlap: int = 300) -> List[str]:
        """Split text into overlapping chunks"""
        if not text:
            return []
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            
            # Try to break at sentence boundaries
            if end < len(text):
                last_period = chunk.rfind('.')
                last_newline = chunk.rfind('\n')
                break_point = max(last_period, last_newline)
                
                if break_point > start + chunk_size // 2:
                    chunk = text[start:break_point + 1]
                    end = break_point + 1
            
            chunks.append(chunk.strip())
            
            if end >= len(text):
                break
                
            start = end - overlap
            
        return [chunk for chunk in chunks if chunk.strip()]

    async def create_embedding(self, text: str) -> List[float]:
        """Create embedding for text using OpenAI"""
        try:
            response = await self.openai_client.embeddings.create(
                model=self.settings.OPENAI_EMBEDDING_MODEL,
                input=text,
                encoding_format="float"
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Failed to create embedding: {e}")
            raise

    async def store_document(self, filename: str, title: str, content: str, 
                           file_path: str, file_size: int, chunks: List[str]) -> int:
        """Store document and its chunks in the database"""
        async with self.db_pool.acquire() as conn:
            async with conn.transaction():
                # Insert document
                document_id = await conn.fetchval(
                    """
                    INSERT INTO documents (filename, title, content, file_path, file_size, processed_at)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING id
                    """,
                    filename, title, content, file_path, file_size, datetime.utcnow()
                )
                
                # Process and insert chunks
                for i, chunk in enumerate(chunks):
                    try:
                        # Create embedding for chunk
                        embedding = await self.create_embedding(chunk)
                        
                        # Insert chunk
                        await conn.execute(
                            """
                            INSERT INTO document_chunks (document_id, content, embedding, metadata)
                            VALUES ($1, $2, $3, $4)
                            """,
                            document_id, chunk, embedding, json.dumps({"chunk_index": i})
                        )
                        
                        logger.info(f"Processed chunk {i+1}/{len(chunks)} for document {filename}")
                        
                    except Exception as e:
                        logger.error(f"Failed to process chunk {i} for document {filename}: {e}")
                        raise
                
                return document_id

    async def process_document(self, pdf_path: Path) -> bool:
        """Process a single PDF document"""
        try:
            logger.info(f"Processing document: {pdf_path.name}")
            
            # Check if document already exists
            async with self.db_pool.acquire() as conn:
                existing = await conn.fetchval(
                    "SELECT id FROM documents WHERE filename = $1",
                    pdf_path.name
                )
                if existing:
                    logger.info(f"Document {pdf_path.name} already exists, skipping")
                    return True
            
            # Extract text
            text = self.extract_text_from_pdf(pdf_path)
            logger.info(f"Extracted {len(text)} characters from {pdf_path.name}")
            
            # Create chunks
            chunks = self.chunk_text(text, self.settings.CHUNK_SIZE, self.settings.CHUNK_OVERLAP)
            logger.info(f"Created {len(chunks)} chunks for {pdf_path.name}")
            
            # Generate title from filename
            title = pdf_path.stem.replace('_', ' ').title()
            
            # Store document
            document_id = await self.store_document(
                filename=pdf_path.name,
                title=title,
                content=text,
                file_path=str(pdf_path),
                file_size=pdf_path.stat().st_size,
                chunks=chunks
            )
            
            logger.info(f"Successfully processed document {pdf_path.name} with ID {document_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to process document {pdf_path.name}: {e}")
            return False

    async def process_all_documents(self, docs_dir: Path) -> Dict[str, Any]:
        """Process all PDF documents in the directory"""
        results = {
            "total_documents": 0,
            "processed_successfully": 0,
            "failed_documents": [],
            "skipped_documents": []
        }
        
        # Get all PDF files
        pdf_files = list(docs_dir.glob("*.pdf"))
        results["total_documents"] = len(pdf_files)
        
        logger.info(f"Found {len(pdf_files)} PDF files to process")
        
        # Process each document
        for pdf_file in pdf_files:
            try:
                success = await self.process_document(pdf_file)
                if success:
                    results["processed_successfully"] += 1
                else:
                    results["failed_documents"].append(pdf_file.name)
            except Exception as e:
                logger.error(f"Error processing {pdf_file.name}: {e}")
                results["failed_documents"].append(pdf_file.name)
        
        return results

    async def get_database_stats(self) -> Dict[str, int]:
        """Get database statistics"""
        async with self.db_pool.acquire() as conn:
            document_count = await conn.fetchval("SELECT COUNT(*) FROM documents")
            chunk_count = await conn.fetchval("SELECT COUNT(*) FROM document_chunks")
            
            return {
                "documents": document_count,
                "chunks": chunk_count
            }

async def main():
    """Main function to process all training documents"""
    logger.info("Starting document processing...")
    
    # Initialize processor
    processor = DocumentProcessor()
    
    try:
        # Initialize database connection
        await processor.initialize_database()
        
        # Get training documents directory
        training_docs_dir = Path(__file__).parent.parent / "training_docs"
        
        if not training_docs_dir.exists():
            logger.error(f"Training documents directory not found: {training_docs_dir}")
            return
        
        # Process all documents
        results = await processor.process_all_documents(training_docs_dir)
        
        # Get final statistics
        stats = await processor.get_database_stats()
        
        # Print results
        logger.info("\n" + "="*60)
        logger.info("DOCUMENT PROCESSING RESULTS")
        logger.info("="*60)
        logger.info(f"Total documents found: {results['total_documents']}")
        logger.info(f"Successfully processed: {results['processed_successfully']}")
        logger.info(f"Failed documents: {len(results['failed_documents'])}")
        
        if results['failed_documents']:
            logger.warning(f"Failed documents: {', '.join(results['failed_documents'])}")
        
        logger.info(f"\nDatabase statistics:")
        logger.info(f"Total documents in database: {stats['documents']}")
        logger.info(f"Total chunks in database: {stats['chunks']}")
        
        logger.info("\nDocument processing completed!")
        
    except Exception as e:
        logger.error(f"Error in main processing: {e}")
        raise
    finally:
        # Close database connection
        await processor.close_database()

if __name__ == "__main__":
    asyncio.run(main())