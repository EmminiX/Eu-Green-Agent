"""
Document Service for processing and managing uploaded documents
"""

import logging
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
import asyncio
from pathlib import Path

import pypdf
from docx import Document
import httpx
from bs4 import BeautifulSoup

from core.config import get_settings
from core.logging_config import get_logger
from core.database import get_db
from services.rag_service import get_rag_service

logger = get_logger(__name__)
settings = get_settings()


class DocumentService:
    """
    Service for handling document upload, processing, and management
    """
    
    def __init__(self):
        self.rag_service = get_rag_service()
        self.documents_db = {}  # In-memory storage for demo (use real DB in production)
    
    async def process_document(
        self,
        filename: str,
        content: bytes,
        file_type: str,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Process an uploaded document and add it to the knowledge graph
        """
        try:
            logger.info(f"Processing document: {filename}")
            
            # Generate document ID
            document_id = str(uuid.uuid4())
            
            # Extract text content based on file type
            text_content = await self._extract_text_content(content, file_type)
            
            if not text_content:
                return {
                    "document_id": document_id,
                    "filename": filename,
                    "status": "failed",
                    "message": "Could not extract text from document"
                }
            
            # Chunk the document
            chunks = self._chunk_document(text_content)
            
            # Add chunks to RAG database
            chunk_count = 0
            async for db in get_db():
                for i, chunk in enumerate(chunks):
                    try:
                        metadata = {
                            "document_id": document_id,
                            "filename": filename,
                            "file_type": file_type,
                            "language": language,
                            "chunk_index": i,
                            "total_chunks": len(chunks),
                            "upload_date": datetime.utcnow().isoformat()
                        }
                        
                        await self.rag_service.add_document_chunk(chunk, metadata, db)
                        chunk_count += 1
                        
                    except Exception as e:
                        logger.warning(f"Failed to add chunk {i} to RAG database: {e}")
                break
            
            # Store document info
            document_info = {
                "id": document_id,
                "filename": filename,
                "file_type": file_type,
                "size": len(content),
                "upload_date": datetime.utcnow().isoformat(),
                "status": "processed",
                "chunk_count": chunk_count,
                "language": language,
                "content_preview": text_content[:200] + "..." if len(text_content) > 200 else text_content
            }
            
            self.documents_db[document_id] = document_info
            
            logger.info(f"Document processed successfully: {document_id} ({chunk_count} chunks)")
            
            return {
                "document_id": document_id,
                "filename": filename,
                "status": "processed",
                "message": f"Document processed successfully with {chunk_count} chunks"
            }
            
        except Exception as e:
            logger.error(f"Error processing document: {e}", exc_info=True)
            return {
                "document_id": str(uuid.uuid4()),
                "filename": filename,
                "status": "failed",
                "message": f"Error processing document: {str(e)}"
            }
    
    async def _extract_text_content(self, content: bytes, file_type: str) -> str:
        """Extract text content from different file types"""
        try:
            if file_type.lower() == "pdf":
                return await self._extract_pdf_text(content)
            elif file_type.lower() == "docx":
                return await self._extract_docx_text(content)
            elif file_type.lower() == "txt":
                return content.decode('utf-8', errors='ignore')
            elif file_type.lower() == "html":
                return await self._extract_html_text(content)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
                
        except Exception as e:
            logger.error(f"Error extracting text from {file_type}: {e}")
            return ""
    
    async def _extract_pdf_text(self, content: bytes) -> str:
        """Extract text from PDF content"""
        try:
            import io
            pdf_reader = pypdf.PdfReader(io.BytesIO(content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting PDF text: {e}")
            return ""
    
    async def _extract_docx_text(self, content: bytes) -> str:
        """Extract text from DOCX content"""
        try:
            import io
            doc = Document(io.BytesIO(content))
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting DOCX text: {e}")
            return ""
    
    async def _extract_html_text(self, content: bytes) -> str:
        """Extract text from HTML content"""
        try:
            html_content = content.decode('utf-8', errors='ignore')
            soup = BeautifulSoup(html_content, 'html.parser')
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            text = soup.get_text()
            # Clean up whitespace
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)
            return text
        except Exception as e:
            logger.error(f"Error extracting HTML text: {e}")
            return ""
    
    def _chunk_document(self, text: str) -> List[str]:
        """Chunk document text into smaller pieces"""
        try:
            chunk_size = settings.CHUNK_SIZE
            chunk_overlap = settings.CHUNK_OVERLAP
            
            # Simple text splitting (can be enhanced with semantic chunking)
            words = text.split()
            chunks = []
            
            for i in range(0, len(words), chunk_size - chunk_overlap):
                chunk_words = words[i:i + chunk_size]
                chunk_text = ' '.join(chunk_words)
                if chunk_text.strip():
                    chunks.append(chunk_text.strip())
            
            return chunks
            
        except Exception as e:
            logger.error(f"Error chunking document: {e}")
            return [text]  # Return original text as single chunk
    
    async def list_documents(self) -> List[Dict[str, Any]]:
        """List all uploaded documents"""
        try:
            documents = []
            for doc_id, doc_data in self.documents_db.items():
                documents.append(doc_data)
            
            # Sort by upload date (newest first)
            documents.sort(key=lambda x: x["upload_date"], reverse=True)
            return documents
            
        except Exception as e:
            logger.error(f"Error listing documents: {e}")
            return []
    
    async def get_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get document information by ID"""
        try:
            return self.documents_db.get(document_id)
        except Exception as e:
            logger.error(f"Error getting document: {e}")
            return None
    
    async def delete_document(self, document_id: str) -> bool:
        """Delete a document and its chunks"""
        try:
            # Delete from RAG database
            async for db in get_db():
                success = await self.rag_service.delete_document_chunks(document_id, db)
                break
            
            # Delete from documents database
            if document_id in self.documents_db:
                del self.documents_db[document_id]
                logger.info(f"Document deleted: {document_id}")
                return True
            
            return success
            
        except Exception as e:
            logger.error(f"Error deleting document: {e}")
            return False


# Global instance
_document_service = None


def get_document_service() -> DocumentService:
    """Get the global document service instance"""
    global _document_service
    if _document_service is None:
        _document_service = DocumentService()
    return _document_service