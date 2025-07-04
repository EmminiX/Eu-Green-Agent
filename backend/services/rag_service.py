import asyncio
import logging
import hashlib
import re
import json
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
import openai
import asyncpg
from core.config import settings

logger = logging.getLogger(__name__)


class RAGService:
    """
    RAG Service using OpenAI embeddings and PostgreSQL with pgvector
    
    Configuration:
    - CHUNK_SIZE: 800 characters
    - CHUNK_OVERLAP: 300 characters  
    - Embeddings: text-embedding-3-large (3072 dimensions)
    - Storage: PostgreSQL with pgvector extension
    """
    
    def __init__(self):
        self.openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.embedding_model = settings.OPENAI_EMBEDDING_MODEL
        self.chunk_size = settings.CHUNK_SIZE
        self.chunk_overlap = settings.CHUNK_OVERLAP
        self.vector_dimension = settings.VECTOR_DIMENSION
        
        # Database connection will be managed per request
        self._db_pool = None
    
    async def _get_db_connection(self) -> asyncpg.Connection:
        """Get database connection from pool"""
        if not self._db_pool:
            # Parse DATABASE_URL to get connection parameters
            db_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
            self._db_pool = await asyncpg.create_pool(
                db_url,
                min_size=1,
                max_size=10,
                command_timeout=60
            )
        
        return await self._db_pool.acquire()
    
    async def _release_db_connection(self, conn: asyncpg.Connection):
        """Release database connection back to pool"""
        if self._db_pool:
            await self._db_pool.release(conn)
    
    def _create_chunks(self, text: str, metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Split text into overlapping chunks
        
        Args:
            text: Text to chunk
            metadata: Document metadata
            
        Returns:
            List of text chunks with metadata
        """
        chunks = []
        
        # Clean and prepare text
        text = re.sub(r'\s+', ' ', text.strip())
        
        if len(text) <= self.chunk_size:
            chunks.append({
                "text": text,
                "metadata": {**metadata, "chunk_index": 0, "total_chunks": 1}
            })
            return chunks
        
        # Create overlapping chunks
        start = 0
        chunk_index = 0
        
        while start < len(text):
            end = start + self.chunk_size
            
            # If this is not the last chunk, try to end at a sentence boundary
            if end < len(text):
                # Look for sentence endings within the last 100 characters
                search_start = max(start + self.chunk_size - 100, start)
                sentence_end = max(
                    text.rfind('.', search_start, end),
                    text.rfind('!', search_start, end),
                    text.rfind('?', search_start, end)
                )
                
                if sentence_end > start:
                    end = sentence_end + 1
            
            chunk_text = text[start:end].strip()
            
            if chunk_text:
                chunks.append({
                    "text": chunk_text,
                    "metadata": {
                        **metadata,
                        "chunk_index": chunk_index,
                        "total_chunks": -1,  # Will be updated after all chunks are created
                        "chunk_start": start,
                        "chunk_end": end
                    }
                })
                chunk_index += 1
            
            # Calculate next start position with overlap
            start = end - self.chunk_overlap
            if start >= len(text):
                break
        
        # Update total_chunks for all chunks
        total_chunks = len(chunks)
        for chunk in chunks:
            chunk["metadata"]["total_chunks"] = total_chunks
        
        return chunks
    
    async def _create_embedding(self, text: str) -> List[float]:
        """
        Create embedding for text using OpenAI
        
        Args:
            text: Text to embed
            
        Returns:
            Embedding vector
        """
        try:
            response = await self.openai_client.embeddings.create(
                model=self.embedding_model,
                input=text,
                encoding_format="float"
            )
            
            return response.data[0].embedding
            
        except Exception as e:
            logger.error(f"Error creating embedding: {str(e)}")
            raise
    
    async def search_documents(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Search documents using vector similarity
        
        Args:
            query: Search query
            top_k: Number of top results to return
            
        Returns:
            List of document chunks with metadata and similarity scores
        """
        try:
            # Create embedding for query
            query_embedding = await self._create_embedding(query)
            
            # Get database connection
            conn = await self._get_db_connection()
            
            try:
                # Get all chunks and calculate similarity in Python (since we store embeddings as JSONB)
                search_query = """
                    SELECT 
                        dc.id,
                        dc.content,
                        dc.chunk_metadata,
                        dc.embedding_model,
                        dc.embedding,
                        d.filename,
                        d.original_filename,
                        d.id as document_id
                    FROM document_chunks dc
                    JOIN documents d ON dc.document_id = d.id
                    WHERE dc.embedding IS NOT NULL
                    ORDER BY RANDOM()
                    LIMIT $1
                """
                
                rows = await conn.fetch(search_query, min(1000, top_k * 50))  # Get enough chunks to find good matches
                
                results = []
                
                # For each row, calculate similarity manually since embeddings are stored as JSONB
                for row in rows:
                    try:
                        # Parse the stored embedding from JSONB
                        stored_embedding = json.loads(row["embedding"]) if isinstance(row["embedding"], str) else row["embedding"]
                        
                        # Calculate cosine similarity manually
                        similarity = self._calculate_cosine_similarity(query_embedding, stored_embedding)
                        
                        # Only include results above similarity threshold
                        if similarity > 0.3:
                            results.append({
                                "id": str(row["id"]),
                                "title": row["original_filename"] or row["filename"],
                                "content": row["content"],
                                "filename": row["filename"],
                                "similarity": float(similarity),
                                "metadata": row["chunk_metadata"] or {},
                                "chunk_id": str(row["id"]),
                                "document_id": str(row["document_id"]),
                                "embedding_model": row["embedding_model"]
                            })
                    except Exception as e:
                        logger.warning(f"Error processing chunk {row['id']}: {e}")
                        continue
                
                # Sort by similarity and return top_k
                results.sort(key=lambda x: x["similarity"], reverse=True)
                results = results[:top_k]
                
                logger.info(f"Found {len(results)} relevant documents for query: {query[:50]}...")
                return results
                
            finally:
                await self._release_db_connection(conn)
                
        except Exception as e:
            logger.error(f"Error searching documents: {str(e)}")
            return []
    
    def _calculate_cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """
        Calculate cosine similarity between two vectors
        
        Args:
            vec1: First vector
            vec2: Second vector
            
        Returns:
            Cosine similarity score (0-1)
        """
        try:
            import math
            
            # Handle different lengths (shouldn't happen but be safe)
            if len(vec1) != len(vec2):
                min_len = min(len(vec1), len(vec2))
                vec1 = vec1[:min_len]
                vec2 = vec2[:min_len]
            
            # Calculate dot product
            dot_product = sum(a * b for a, b in zip(vec1, vec2))
            
            # Calculate magnitudes
            magnitude1 = math.sqrt(sum(a * a for a in vec1))
            magnitude2 = math.sqrt(sum(a * a for a in vec2))
            
            # Avoid division by zero
            if magnitude1 == 0 or magnitude2 == 0:
                return 0.0
            
            # Calculate cosine similarity
            similarity = dot_product / (magnitude1 * magnitude2)
            
            # Ensure result is between 0 and 1
            return max(0.0, min(1.0, similarity))
            
        except Exception as e:
            logger.error(f"Error calculating cosine similarity: {e}")
            return 0.0
    
    async def upload_document(self, file_path: str, doc_name: str) -> bool:
        """
        Upload and process document
        
        Args:
            file_path: Path to document file
            doc_name: Name for the document
            
        Returns:
            Success status
        """
        try:
            file_path = Path(file_path)
            if not file_path.exists():
                logger.error(f"File not found: {file_path}")
                return False
            
            # Read document content based on file type
            content = await self._extract_text_from_file(file_path)
            if not content:
                logger.error(f"Could not extract text from {file_path}")
                return False
            
            # Create document metadata
            file_hash = hashlib.md5(content.encode()).hexdigest()
            metadata = {
                "filename": doc_name,
                "original_filename": file_path.name,
                "file_size": file_path.stat().st_size,
                "file_hash": file_hash,
                "file_type": file_path.suffix.lower()
            }
            
            # Check if document already exists
            conn = await self._get_db_connection()
            
            try:
                existing = await conn.fetchrow(
                    "SELECT id FROM documents WHERE file_hash = $1",
                    file_hash
                )
                
                if existing:
                    logger.info(f"Document {doc_name} already exists (hash: {file_hash[:8]})")
                    return True
                
                # Insert document record
                doc_id = await conn.fetchval(
                    """
                    INSERT INTO documents (filename, title, content, metadata, file_hash)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING id
                    """,
                    doc_name,
                    doc_name,
                    content,
                    metadata,
                    file_hash
                )
                
                # Create and store chunks
                chunks = self._create_chunks(content, {
                    "document_id": doc_id,
                    "filename": doc_name,
                    "title": doc_name
                })
                
                logger.info(f"Created {len(chunks)} chunks for document {doc_name}")
                
                # Process chunks in batches to avoid memory issues
                batch_size = 10
                for i in range(0, len(chunks), batch_size):
                    batch = chunks[i:i + batch_size]
                    
                    # Create embeddings for batch
                    embeddings = []
                    for chunk in batch:
                        embedding = await self._create_embedding(chunk["text"])
                        embeddings.append(embedding)
                    
                    # Insert chunk records
                    for chunk, embedding in zip(batch, embeddings):
                        await conn.execute(
                            """
                            INSERT INTO document_chunks 
                            (document_id, content, embedding, metadata, filename, title)
                            VALUES ($1, $2, $3, $4, $5, $6)
                            """,
                            doc_id,
                            chunk["text"],
                            embedding,
                            chunk["metadata"],
                            doc_name,
                            doc_name
                        )
                
                logger.info(f"Successfully uploaded and processed document: {doc_name}")
                return True
                
            finally:
                await self._release_db_connection(conn)
                
        except Exception as e:
            logger.error(f"Error uploading document {doc_name}: {str(e)}")
            return False
    
    async def _extract_text_from_file(self, file_path: Path) -> str:
        """
        Extract text content from various file types
        
        Args:
            file_path: Path to file
            
        Returns:
            Extracted text content
        """
        try:
            suffix = file_path.suffix.lower()
            
            if suffix == '.txt':
                return file_path.read_text(encoding='utf-8')
            
            elif suffix == '.pdf':
                # For PDF extraction, you might want to use PyPDF2 or pdfplumber
                # For now, basic implementation
                try:
                    import PyPDF2
                    with open(file_path, 'rb') as file:
                        reader = PyPDF2.PdfReader(file)
                        text = ""
                        for page in reader.pages:
                            text += page.extract_text() + "\n"
                        return text
                except ImportError:
                    logger.error("PyPDF2 not installed. Cannot process PDF files.")
                    return ""
            
            elif suffix in ['.docx', '.doc']:
                # For DOCX extraction, you might want to use python-docx
                try:
                    from docx import Document
                    doc = Document(file_path)
                    text = ""
                    for paragraph in doc.paragraphs:
                        text += paragraph.text + "\n"
                    return text
                except ImportError:
                    logger.error("python-docx not installed. Cannot process DOCX files.")
                    return ""
            
            elif suffix in ['.html', '.htm']:
                # Basic HTML text extraction
                try:
                    from bs4 import BeautifulSoup
                    html_content = file_path.read_text(encoding='utf-8')
                    soup = BeautifulSoup(html_content, 'html.parser')
                    return soup.get_text()
                except ImportError:
                    logger.error("BeautifulSoup not installed. Cannot process HTML files.")
                    # Fallback: read as plain text
                    return file_path.read_text(encoding='utf-8')
            
            else:
                # Default: try to read as plain text
                return file_path.read_text(encoding='utf-8')
                
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {str(e)}")
            return ""
    
    async def list_documents(self) -> List[Dict[str, Any]]:
        """
        List all documents in the knowledge base
        
        Returns:
            List of document metadata
        """
        try:
            conn = await self._get_db_connection()
            
            try:
                rows = await conn.fetch(
                    """
                    SELECT 
                        d.id,
                        d.filename,
                        d.title,
                        d.metadata,
                        d.created_at,
                        d.file_hash,
                        COUNT(c.id) as chunk_count
                    FROM documents d
                    LEFT JOIN document_chunks c ON d.id = c.document_id
                    GROUP BY d.id, d.filename, d.title, d.metadata, d.created_at, d.file_hash
                    ORDER BY d.created_at DESC
                    """
                )
                
                documents = []
                for row in rows:
                    documents.append({
                        "id": row["id"],
                        "filename": row["filename"],
                        "title": row["title"],
                        "metadata": row["metadata"] or {},
                        "created_at": row["created_at"].isoformat(),
                        "file_hash": row["file_hash"],
                        "chunk_count": row["chunk_count"]
                    })
                
                return documents
                
            finally:
                await self._release_db_connection(conn)
                
        except Exception as e:
            logger.error(f"Error listing documents: {str(e)}")
            return []
    
    async def health_check(self) -> bool:
        """
        Check if the service is healthy
        
        Returns:
            Health status
        """
        try:
            # Test OpenAI API
            await self._create_embedding("test")
            
            # Test database connection
            conn = await self._get_db_connection()
            try:
                await conn.fetchval("SELECT 1")
                return True
            finally:
                await self._release_db_connection(conn)
                
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return False
    
    async def delete_document(self, document_id: int) -> bool:
        """
        Delete document and its chunks
        
        Args:
            document_id: ID of document to delete
            
        Returns:
            Success status
        """
        try:
            conn = await self._get_db_connection()
            
            try:
                # Delete chunks first (foreign key constraint)
                await conn.execute(
                    "DELETE FROM document_chunks WHERE document_id = $1",
                    document_id
                )
                
                # Delete document
                result = await conn.execute(
                    "DELETE FROM documents WHERE id = $1",
                    document_id
                )
                
                if result == "DELETE 1":
                    logger.info(f"Successfully deleted document {document_id}")
                    return True
                else:
                    logger.warning(f"Document {document_id} not found")
                    return False
                    
            finally:
                await self._release_db_connection(conn)
                
        except Exception as e:
            logger.error(f"Error deleting document {document_id}: {str(e)}")
            return False
    
    async def get_document_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the knowledge base
        
        Returns:
            Statistics dictionary
        """
        try:
            conn = await self._get_db_connection()
            
            try:
                stats = await conn.fetchrow(
                    """
                    SELECT 
                        COUNT(DISTINCT d.id) as total_documents,
                        COUNT(c.id) as total_chunks,
                        AVG(LENGTH(c.content)) as avg_chunk_length,
                        MAX(d.created_at) as latest_upload
                    FROM documents d
                    LEFT JOIN document_chunks c ON d.id = c.document_id
                    """
                )
                
                return {
                    "total_documents": stats["total_documents"] or 0,
                    "total_chunks": stats["total_chunks"] or 0,
                    "avg_chunk_length": float(stats["avg_chunk_length"] or 0),
                    "latest_upload": stats["latest_upload"].isoformat() if stats["latest_upload"] else None,
                    "embedding_model": self.embedding_model,
                    "vector_dimension": self.vector_dimension,
                    "chunk_size": self.chunk_size,
                    "chunk_overlap": self.chunk_overlap
                }
                
            finally:
                await self._release_db_connection(conn)
                
        except Exception as e:
            logger.error(f"Error getting stats: {str(e)}")
            return {}
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self._db_pool:
            await self._db_pool.close()