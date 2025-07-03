"""
Document management endpoints
"""

import logging
from typing import List
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel

from core.logging_config import get_logger
from core.database import get_db
from services.document_service import DocumentService
from services.rag_service import get_rag_service

logger = get_logger(__name__)
router = APIRouter()


class DocumentInfo(BaseModel):
    """Document information model"""
    id: str
    filename: str
    file_type: str
    size: int
    upload_date: str
    status: str
    chunk_count: int = 0


class DocumentUploadResponse(BaseModel):
    """Document upload response"""
    document_id: str
    filename: str
    status: str
    message: str


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    language: str = Form(default="en")
):
    """Upload and process a document"""
    try:
        logger.info(f"Uploading document: {file.filename}")
        
        # Validate file type
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        file_extension = file.filename.split('.')[-1].lower()
        allowed_types = ['pdf', 'txt', 'docx', 'html']
        
        if file_extension not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file_extension} not supported. Allowed types: {allowed_types}"
            )
        
        # Read file content
        content = await file.read()
        
        # Initialize document service
        doc_service = DocumentService()
        
        # Process document
        result = await doc_service.process_document(
            filename=file.filename,
            content=content,
            file_type=file_extension,
            language=language
        )
        
        logger.info(f"Document processed successfully: {result['document_id']}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading document: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to upload document")


@router.get("/", response_model=List[DocumentInfo])
async def list_documents():
    """List all uploaded documents"""
    try:
        doc_service = DocumentService()
        documents = await doc_service.list_documents()
        return documents
        
    except Exception as e:
        logger.error(f"Error listing documents: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to list documents")


@router.get("/knowledge-base")
async def get_knowledge_base():
    """Get list of all documents in the knowledge base"""
    try:
        logger.info("Knowledge base endpoint called")
        from sqlalchemy import text
        
        rag_service = get_rag_service()
        logger.info("RAG service obtained")
        
        async for db in get_db():
            logger.info("Database connection obtained")
            
            # Get unique documents from chunks
            logger.info("Executing database query...")
            result = await db.execute(text("""
                SELECT 
                    metadata->>'filename' as filename,
                    metadata->>'document_id' as document_id,
                    COUNT(*) as chunk_count,
                    MAX(created_at) as last_updated
                FROM document_chunks 
                WHERE metadata->>'filename' IS NOT NULL
                GROUP BY metadata->>'filename', metadata->>'document_id'
                ORDER BY metadata->>'filename'
            """))
            logger.info("Database query executed successfully")
            
            documents = []
            row_count = 0
            for row in result:
                row_count += 1
                documents.append({
                    "filename": row.filename,
                    "title": rag_service._format_document_title(row.filename),
                    "document_id": row.document_id,
                    "chunk_count": row.chunk_count,
                    "last_updated": row.last_updated.isoformat() if row.last_updated else None,
                    "type": "EU Policy Document",
                    "url": "https://commission.europa.eu/publications/legal-documents-delivering-european-green-deal_en"
                })
            
            logger.info(f"Processed {row_count} rows, returning {len(documents)} documents")
            break
        
        response_data = {
            "total_documents": len(documents),
            "documents": documents
        }
        logger.info(f"Returning response with {len(documents)} documents")
        return response_data
        
    except Exception as e:
        logger.error(f"Error getting knowledge base: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get knowledge base information: {str(e)}")


@router.get("/{document_id}", response_model=DocumentInfo)
async def get_document(document_id: str):
    """Get document information by ID"""
    try:
        doc_service = DocumentService()
        document = await doc_service.get_document(document_id)
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return document
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting document: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get document")


@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """Delete a document and its chunks"""
    try:
        doc_service = DocumentService()
        success = await doc_service.delete_document(document_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {"message": "Document deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to delete document")


@router.post("/process-url")
async def process_url(url: str = Form(...), language: str = Form(default="en")):
    """Process a URL and extract content"""
    try:
        logger.info(f"Processing URL: {url}")
        
        doc_service = DocumentService()
        result = await doc_service.process_url(url, language)
        
        logger.info(f"URL processed successfully: {result.document_id}")
        return result
        
    except Exception as e:
        logger.error(f"Error processing URL: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process URL")


@router.post("/reprocess/{document_id}")
async def reprocess_document(document_id: str):
    """Reprocess a document (useful after system updates)"""
    try:
        doc_service = DocumentService()
        result = await doc_service.reprocess_document(document_id)
        
        if not result:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {"message": "Document reprocessed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reprocessing document: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to reprocess document")