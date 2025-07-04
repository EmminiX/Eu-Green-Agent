#!/usr/bin/env python3
"""
EU Green Deal Documents Upload Script
====================================

This script uploads all EU Green Deal documents to the OpenAI embeddings system.
It processes documents with CHUNK_SIZE=800 and CHUNK_OVERLAP=300 as specified.

Usage:
    python scripts/upload_documents_openai.py

Requirements:
    - Backend services must be running
    - OpenAI API key configured in .env
    - PostgreSQL database running with pgvector extension
"""

import asyncio
import os
import sys
from pathlib import Path
from typing import List, Dict, Any
import logging

# Add backend to Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from services.rag_service import RAGService
from core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DocumentUploader:
    """Document uploader for EU Green Deal documents"""
    
    def __init__(self, documents_dir: str = "training_docs"):
        self.documents_dir = Path(documents_dir)
        self.rag_service = RAGService()
        self.uploaded_count = 0
        self.failed_count = 0
        self.skipped_count = 0
    
    async def upload_all_documents(self) -> Dict[str, Any]:
        """
        Upload all documents from the training_docs directory
        
        Returns:
            Summary of upload results
        """
        logger.info("🚀 Starting EU Green Deal documents upload")
        logger.info(f"📁 Document directory: {self.documents_dir}")
        logger.info(f"⚙️  Configuration:")
        logger.info(f"   - Chunk size: {settings.CHUNK_SIZE}")
        logger.info(f"   - Chunk overlap: {settings.CHUNK_OVERLAP}")
        logger.info(f"   - Embedding model: {settings.OPENAI_EMBEDDING_MODEL}")
        logger.info(f"   - Vector dimension: {settings.VECTOR_DIMENSION}")
        
        if not self.documents_dir.exists():
            logger.error(f"❌ Documents directory not found: {self.documents_dir}")
            return {"error": "Documents directory not found"}
        
        # Get all document files
        document_files = self._find_document_files()
        
        if not document_files:
            logger.warning("⚠️  No document files found")
            return {"error": "No document files found"}
        
        logger.info(f"📚 Found {len(document_files)} documents to process")
        
        # Test service health first
        logger.info("🔍 Testing service health...")
        if not await self.rag_service.health_check():
            logger.error("❌ RAG service health check failed")
            return {"error": "RAG service not healthy"}
        
        logger.info("✅ RAG service is healthy")
        
        # Process each document
        results = []
        for i, file_path in enumerate(document_files, 1):
            logger.info(f"\n📄 Processing document {i}/{len(document_files)}: {file_path.name}")
            
            try:
                success = await self.rag_service.upload_document(
                    str(file_path),
                    file_path.name
                )
                
                if success:
                    self.uploaded_count += 1
                    logger.info(f"✅ Successfully uploaded: {file_path.name}")
                    results.append({
                        "filename": file_path.name,
                        "status": "uploaded",
                        "size": file_path.stat().st_size
                    })
                else:
                    self.failed_count += 1
                    logger.error(f"❌ Failed to upload: {file_path.name}")
                    results.append({
                        "filename": file_path.name,
                        "status": "failed",
                        "size": file_path.stat().st_size
                    })
                
            except Exception as e:
                self.failed_count += 1
                logger.error(f"💥 Error processing {file_path.name}: {str(e)}")
                results.append({
                    "filename": file_path.name,
                    "status": "error",
                    "error": str(e),
                    "size": file_path.stat().st_size if file_path.exists() else 0
                })
        
        # Get final statistics
        stats = await self.rag_service.get_document_stats()
        
        # Return summary
        summary = {
            "total_files_found": len(document_files),
            "uploaded": self.uploaded_count,
            "failed": self.failed_count,
            "skipped": self.skipped_count,
            "results": results,
            "final_stats": stats
        }
        
        self._print_summary(summary)
        return summary
    
    def _find_document_files(self) -> List[Path]:
        """Find all document files in the training_docs directory"""
        supported_extensions = {'.pdf', '.txt', '.docx', '.doc', '.html', '.htm'}
        document_files = []
        
        for file_path in self.documents_dir.rglob('*'):
            if file_path.is_file() and file_path.suffix.lower() in supported_extensions:
                document_files.append(file_path)
        
        # Sort by name for consistent processing
        return sorted(document_files)
    
    def _print_summary(self, summary: Dict[str, Any]):
        """Print upload summary"""
        logger.info("\n" + "="*60)
        logger.info("📊 UPLOAD SUMMARY")
        logger.info("="*60)
        logger.info(f"📁 Total files found: {summary['total_files_found']}")
        logger.info(f"✅ Successfully uploaded: {summary['uploaded']}")
        logger.info(f"❌ Failed: {summary['failed']}")
        logger.info(f"⏭️  Skipped: {summary['skipped']}")
        
        if summary.get('final_stats'):
            stats = summary['final_stats']
            logger.info(f"\n📈 DATABASE STATISTICS:")
            logger.info(f"   - Total documents: {stats.get('total_documents', 0)}")
            logger.info(f"   - Total chunks: {stats.get('total_chunks', 0)}")
            logger.info(f"   - Avg chunk length: {stats.get('avg_chunk_length', 0):.1f} chars")
            logger.info(f"   - Latest upload: {stats.get('latest_upload', 'N/A')}")
        
        if summary['failed'] > 0:
            logger.info(f"\n❌ FAILED FILES:")
            for result in summary['results']:
                if result['status'] in ['failed', 'error']:
                    error_msg = result.get('error', 'Upload failed')
                    logger.info(f"   - {result['filename']}: {error_msg}")
        
        logger.info("="*60)
        
        if summary['uploaded'] == summary['total_files_found']:
            logger.info("🎉 All documents uploaded successfully!")
        elif summary['uploaded'] > 0:
            logger.info(f"⚠️  Partial success: {summary['uploaded']}/{summary['total_files_found']} uploaded")
        else:
            logger.error("💥 No documents were uploaded successfully")


async def main():
    """Main upload function"""
    try:
        # Check if we're in the right directory
        if not Path("training_docs").exists():
            logger.error("❌ training_docs directory not found")
            logger.error("   Please run this script from the project root directory")
            return 1
        
        # Check environment
        if not settings.OPENAI_API_KEY:
            logger.error("❌ OPENAI_API_KEY not configured")
            logger.error("   Please set your OpenAI API key in the .env file")
            return 1
        
        # Initialize uploader
        uploader = DocumentUploader()
        
        # Upload documents
        summary = await uploader.upload_all_documents()
        
        # Return exit code based on results
        if summary.get('error'):
            return 1
        elif summary.get('failed', 0) > 0:
            return 2  # Partial failure
        else:
            return 0  # Success
            
    except KeyboardInterrupt:
        logger.info("\n⏹️  Upload cancelled by user")
        return 130
    except Exception as e:
        logger.error(f"💥 Unexpected error: {str(e)}")
        return 1


if __name__ == "__main__":
    # Run the upload
    exit_code = asyncio.run(main())
    sys.exit(exit_code)