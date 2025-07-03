#!/usr/bin/env python3
"""
Batch Document Upload Script
Uploads multiple PDF documents to the EU Green Chatbot RAG system
"""

import os
import sys
import asyncio
import aiohttp
import argparse
from pathlib import Path
from typing import List
import json


async def upload_document(session: aiohttp.ClientSession, file_path: Path, base_url: str) -> dict:
    """Upload a single document to the API"""
    try:
        print(f"📄 Uploading: {file_path.name}")
        
        # Read file content first
        with open(file_path, 'rb') as f:
            file_content = f.read()
        
        # Prepare the multipart form data
        data = aiohttp.FormData()
        
        # Add the file content
        data.add_field('file', file_content, filename=file_path.name, content_type='application/pdf')
        
        # Add language parameter
        data.add_field('language', 'en')
        
        # Upload the document
        async with session.post(f"{base_url}/api/documents/upload", data=data) as response:
            if response.status == 200:
                result = await response.json()
                print(f"✅ Success: {file_path.name} -> {result.get('chunk_count', 0)} chunks")
                return {"status": "success", "file": file_path.name, "result": result}
            else:
                error_text = await response.text()
                print(f"❌ Failed: {file_path.name} - {response.status}: {error_text}")
                return {"status": "error", "file": file_path.name, "error": error_text}
    
    except Exception as e:
        print(f"❌ Error uploading {file_path.name}: {str(e)}")
        return {"status": "error", "file": file_path.name, "error": str(e)}


async def batch_upload(documents_folder: str, base_url: str = "http://localhost:8000") -> dict:
    """Upload all PDF documents in a folder"""
    
    # Find all PDF files
    folder_path = Path(documents_folder)
    pdf_files = list(folder_path.glob("*.pdf"))
    
    if not pdf_files:
        print(f"❌ No PDF files found in {documents_folder}")
        return {"success": 0, "failed": 0, "results": []}
    
    print(f"🚀 Found {len(pdf_files)} PDF files to upload")
    print(f"📡 Backend URL: {base_url}")
    print(f"📁 Documents folder: {documents_folder}")
    print("-" * 60)
    
    # Test connection to backend
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{base_url}/") as response:
                if response.status != 200:
                    print(f"❌ Backend not accessible at {base_url}")
                    return {"success": 0, "failed": 0, "results": []}
                print(f"✅ Backend connection successful")
    except Exception as e:
        print(f"❌ Cannot connect to backend at {base_url}: {e}")
        return {"success": 0, "failed": 0, "results": []}
    
    # Upload documents
    results = []
    success_count = 0
    failed_count = 0
    
    # Use connector with timeout for large files
    connector = aiohttp.TCPConnector(limit=5)  # Limit concurrent connections
    timeout = aiohttp.ClientTimeout(total=600)  # 10 minute timeout per upload for large documents
    
    async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
        # Upload files one by one to avoid overwhelming the server
        for pdf_file in pdf_files:
            result = await upload_document(session, pdf_file, base_url)
            results.append(result)
            
            if result["status"] == "success":
                success_count += 1
            else:
                failed_count += 1
            
            # Small delay between uploads
            await asyncio.sleep(1)
    
    # Summary
    print("-" * 60)
    print(f"📊 Upload Summary:")
    print(f"   ✅ Successful: {success_count}")
    print(f"   ❌ Failed: {failed_count}")
    print(f"   📁 Total files: {len(pdf_files)}")
    
    if failed_count > 0:
        print(f"\n❌ Failed uploads:")
        for result in results:
            if result["status"] == "error":
                print(f"   - {result['file']}: {result['error']}")
    
    return {
        "success": success_count,
        "failed": failed_count,
        "total": len(pdf_files),
        "results": results
    }


async def list_uploaded_documents(base_url: str = "http://localhost:8000"):
    """List all documents currently in the system"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{base_url}/api/documents/") as response:
                if response.status == 200:
                    documents = await response.json()
                    print(f"\n📚 Documents in system: {len(documents)}")
                    
                    if documents:
                        print("\nCurrent documents:")
                        for doc in documents:
                            print(f"   📄 {doc['filename']} ({doc['chunk_count']} chunks)")
                    
                    return documents
                else:
                    print(f"❌ Failed to list documents: {response.status}")
                    return []
    except Exception as e:
        print(f"❌ Error listing documents: {e}")
        return []


def main():
    parser = argparse.ArgumentParser(description="Batch upload PDF documents to EU Green Chatbot")
    parser.add_argument("folder", help="Path to folder containing PDF documents")
    parser.add_argument("--url", default="http://localhost:8000", help="Backend URL (default: http://localhost:8000)")
    parser.add_argument("--list", action="store_true", help="List currently uploaded documents")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be uploaded without actually uploading")
    
    args = parser.parse_args()
    
    # Print header
    print("=" * 60)
    print("🌱 EU Green Policies Chatbot - Document Upload Tool")
    print("=" * 60)
    
    if args.list:
        print("📋 Listing current documents...")
        asyncio.run(list_uploaded_documents(args.url))
        return
    
    # Validate folder
    if not os.path.exists(args.folder):
        print(f"❌ Folder not found: {args.folder}")
        sys.exit(1)
    
    if not os.path.isdir(args.folder):
        print(f"❌ Path is not a directory: {args.folder}")
        sys.exit(1)
    
    # Find PDF files
    folder_path = Path(args.folder)
    pdf_files = list(folder_path.glob("*.pdf"))
    
    if args.dry_run:
        print(f"🔍 Dry run mode - Found {len(pdf_files)} PDF files:")
        for pdf_file in pdf_files:
            print(f"   📄 {pdf_file.name} ({pdf_file.stat().st_size / 1024 / 1024:.1f} MB)")
        print(f"\n✨ Run without --dry-run to upload these files")
        return
    
    if not pdf_files:
        print(f"❌ No PDF files found in {args.folder}")
        sys.exit(1)
    
    # Run upload
    result = asyncio.run(batch_upload(args.folder, args.url))
    
    # List documents after upload
    if result["success"] > 0:
        print("\n📋 Updated document list:")
        asyncio.run(list_uploaded_documents(args.url))


if __name__ == "__main__":
    main()