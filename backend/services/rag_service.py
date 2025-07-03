"""
RAG (Retrieval Augmented Generation) Service
Uses PostgreSQL with pgvector for document embeddings and retrieval
"""

import logging
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
import asyncio
import json
import openai
from openai import OpenAI

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select, insert, update, delete
from sqlalchemy.dialects.postgresql import insert as pg_insert

from core.config import get_settings
from core.logging_config import get_logger
from core.database import get_db

logger = get_logger(__name__)
settings = get_settings()


class RAGService:
    """Service for RAG operations using PostgreSQL + pgvector"""
    
    def __init__(self):
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.embedding_model = "text-embedding-3-small"
        self.embedding_dimension = 1536
    
    async def add_document_chunk(
        self,
        content: str,
        metadata: Dict[str, Any],
        db: AsyncSession
    ) -> str:
        """
        Add a document chunk with embeddings to the vector database
        
        Args:
            content: The text content to embed
            metadata: Metadata about the chunk
            db: Database session
            
        Returns:
            Chunk ID
        """
        try:
            # Generate embedding
            embedding = await self._get_embedding(content)
            
            # Generate chunk ID
            chunk_id = str(uuid.uuid4())
            
            # Prepare chunk data
            chunk_data = {
                "id": chunk_id,
                "content": content,
                "metadata": json.dumps(metadata),
                "embedding": embedding,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Insert into document_chunks table
            await db.execute(text("""
                INSERT INTO document_chunks (id, content, metadata, embedding, created_at, updated_at)
                VALUES (:id, :content, :metadata, CAST(:embedding AS vector), :created_at, :updated_at)
            """), {
                **chunk_data,
                "embedding": str(embedding)  # Convert to string for PostgreSQL
            })
            
            await db.commit()
            
            logger.info(f"Added document chunk to RAG database: {chunk_id}")
            return chunk_id
            
        except Exception as e:
            logger.error(f"Failed to add document chunk: {e}")
            await db.rollback()
            raise
    
    async def search_similar_chunks(
        self,
        query: str,
        limit: int = 5,
        similarity_threshold: float = 0.5,
        db: AsyncSession = None
    ) -> List[Dict[str, Any]]:
        """
        Search for similar document chunks using vector similarity
        
        Args:
            query: Search query
            limit: Maximum number of results
            similarity_threshold: Minimum similarity score
            db: Database session
            
        Returns:
            List of similar chunks with metadata
        """
        try:
            if db is None:
                async for session in get_db():
                    db = session
                    break
            
            # Generate query embedding
            query_embedding = await self._get_embedding(query)
            
            # Search for similar chunks
            result = await db.execute(text("""
                SELECT 
                    id,
                    content,
                    metadata,
                    (embedding <=> CAST(:query_embedding AS vector)) as distance,
                    (1 - (embedding <=> CAST(:query_embedding AS vector))) as similarity
                FROM document_chunks
                WHERE (1 - (embedding <=> CAST(:query_embedding AS vector))) > :similarity_threshold
                ORDER BY embedding <=> CAST(:query_embedding AS vector)
                LIMIT :limit
            """), {
                "query_embedding": str(query_embedding),
                "similarity_threshold": similarity_threshold,
                "limit": limit
            })
            
            chunks = []
            for row in result:
                # Handle metadata - it may already be a dict from PostgreSQL JSONB
                metadata = row.metadata
                if isinstance(metadata, str):
                    metadata = json.loads(metadata)
                
                chunk_data = {
                    "id": row.id,
                    "content": row.content,
                    "metadata": metadata,
                    "similarity": float(row.similarity),
                    "distance": float(row.distance)
                }
                chunks.append(chunk_data)
            
            logger.info(f"Found {len(chunks)} similar chunks for query")
            return chunks
            
        except Exception as e:
            logger.error(f"Failed to search similar chunks: {e}")
            return []
    
    async def get_context_for_query(
        self,
        query: str,
        max_chunks: int = 5,
        max_tokens: int = 2000,
        db: AsyncSession = None
    ) -> Dict[str, Any]:
        """
        Get relevant context for a query by retrieving similar chunks
        
        Args:
            query: User query
            max_chunks: Maximum number of chunks to retrieve
            max_tokens: Maximum total tokens in context
            db: Database session
            
        Returns:
            Context with chunks and sources
        """
        try:
            # Search for similar chunks
            similar_chunks = await self.search_similar_chunks(
                query=query,
                limit=max_chunks,
                db=db
            )
            
            # Build context while staying under token limit
            context_parts = []
            sources = []
            total_tokens = 0
            
            for chunk in similar_chunks:
                content = chunk["content"]
                # Rough token estimation (1 token ≈ 4 characters)
                chunk_tokens = len(content) // 4
                
                if total_tokens + chunk_tokens > max_tokens:
                    break
                
                context_parts.append(content)
                total_tokens += chunk_tokens
                
                # Add source information
                metadata = chunk["metadata"]
                filename = metadata.get("filename", "Unknown Document")
                
                # Create EU document URL based on filename
                eu_base_url = "https://commission.europa.eu/publications/legal-documents-delivering-european-green-deal_en"
                
                # Format a descriptive title that clearly shows the document name
                formatted_title = self._format_document_title(filename)
                display_title = f"📄 {formatted_title}"
                
                source = {
                    "title": display_title,
                    "type": "EU Policy Document",
                    "chunk_index": metadata.get("chunk_index", 0),
                    "similarity": round(chunk["similarity"], 2),
                    "filename": filename,
                    "document_name": formatted_title,  # Add clear document name field
                    "url": eu_base_url  # Link to the main EU page since individual PDFs aren't directly linkable
                }
                
                sources.append(source)
            
            context = "\n\n".join(context_parts)
            
            return {
                "context": context,
                "sources": sources,
                "chunk_count": len(context_parts),
                "total_tokens": total_tokens
            }
            
        except Exception as e:
            logger.error(f"Failed to get context for query: {e}")
            return {
                "context": "",
                "sources": [],
                "chunk_count": 0,
                "total_tokens": 0
            }
    
    async def _get_embedding(self, text: str) -> List[float]:
        """Generate embedding for text using OpenAI"""
        try:
            response = self.openai_client.embeddings.create(
                input=text,
                model=self.embedding_model
            )
            return response.data[0].embedding
            
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise
    
    async def delete_document_chunks(
        self,
        document_id: str,
        db: AsyncSession
    ) -> bool:
        """
        Delete all chunks for a document
        
        Args:
            document_id: Document ID to delete
            db: Database session
            
        Returns:
            Success status
        """
        try:
            await db.execute(text("""
                DELETE FROM document_chunks 
                WHERE metadata->>'document_id' = :document_id
            """), {"document_id": document_id})
            
            await db.commit()
            logger.info(f"Deleted chunks for document: {document_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete document chunks: {e}")
            await db.rollback()
            return False
    
    async def get_document_stats(self, db: AsyncSession) -> Dict[str, Any]:
        """Get statistics about stored documents"""
        try:
            result = await db.execute(text("""
                SELECT 
                    COUNT(*) as total_chunks,
                    COUNT(DISTINCT metadata->>'document_id') as total_documents,
                    AVG(LENGTH(content)) as avg_chunk_length
                FROM document_chunks
            """))
            
            row = result.first()
            
            return {
                "total_chunks": row.total_chunks,
                "total_documents": row.total_documents,
                "average_chunk_length": float(row.avg_chunk_length) if row.avg_chunk_length else 0,
                "last_updated": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get document stats: {e}")
            return {
                "total_chunks": 0,
                "total_documents": 0,
                "average_chunk_length": 0,
                "last_updated": datetime.utcnow().isoformat()
            }
    
    def _format_document_title(self, filename: str) -> str:
        """Convert filename to readable document title"""
        # Remove .pdf extension
        title = filename.replace('.pdf', '')
        
        # Replace underscores and URL encoded characters with spaces
        title = title.replace('_', ' ').replace('%2C', ',').replace('%28', '(').replace('%29', ')')
        
        # Handle common abbreviations and improve readability
        title = title.replace('EU ', 'EU ').replace('MRV', 'MRV (Monitoring, Reporting and Verification)')
        title = title.replace('CORSIA', 'CORSIA (Carbon Offsetting and Reduction Scheme)')
        title = title.replace('LULUCF', 'LULUCF (Land Use, Land Use Change and Forestry)')
        title = title.replace('ESR', 'ESR (Effort Sharing Regulation)')
        
        # Apply title case and handle specific terms
        words = title.split()
        formatted_words = []
        
        for word in words:
            # Keep certain words lowercase unless they're the first word
            if word.lower() in ['and', 'or', 'the', 'of', 'for', 'in', 'on', 'to', 'a', 'an', 'with'] and len(formatted_words) > 0:
                formatted_words.append(word.lower())
            # Keep EU-specific acronyms in uppercase
            elif word.upper() in ['EU', 'CO2', 'MRV', 'CORSIA', 'LULUCF', 'ESR', 'ETS', 'CBAM']:
                formatted_words.append(word.upper())
            else:
                formatted_words.append(word.capitalize())
        
        return ' '.join(formatted_words)


# Global instance
_rag_service = None


def get_rag_service() -> RAGService:
    """Get the global RAG service instance"""
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
    return _rag_service