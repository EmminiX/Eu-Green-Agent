#!/usr/bin/env python3
"""
Monitor the progress of document embedding process
"""

import asyncio
import asyncpg
import time
from datetime import datetime
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

async def get_progress():
    """Get current embedding progress"""
    try:
        conn = await asyncpg.connect(
            host='localhost',
            port=5432,
            user='postgres',
            password='password',
            database='eu_green_chatbot'
        )
        
        # Get document and chunk counts
        document_count = await conn.fetchval("SELECT COUNT(*) FROM documents")
        chunk_count = await conn.fetchval("SELECT COUNT(*) FROM document_chunks")
        
        # Get latest processed document info
        latest_doc = await conn.fetchrow("""
            SELECT d.filename, d.processed_date, COUNT(dc.id) as chunks_processed
            FROM documents d
            LEFT JOIN document_chunks dc ON d.id = dc.document_id
            WHERE d.processed_date IS NOT NULL
            GROUP BY d.id, d.filename, d.processed_date
            ORDER BY d.processed_date DESC
            LIMIT 1
        """)
        
        await conn.close()
        
        return {
            'documents_processed': document_count,
            'total_chunks': chunk_count,
            'latest_document': latest_doc['filename'] if latest_doc else None,
            'latest_chunks': latest_doc['chunks_processed'] if latest_doc else 0,
            'latest_time': latest_doc['processed_date'] if latest_doc else None
        }
        
    except Exception as e:
        return {'error': str(e)}

async def monitor_progress():
    """Monitor progress continuously"""
    print("🚀 EU Green Deal Document Embedding Progress Monitor")
    print("=" * 60)
    print("📁 Total documents to process: 26")
    print("📋 Expected total chunks: ~8,000-10,000")
    print("⏱️  Estimated completion time: 2-3 hours")
    print("=" * 60)
    
    start_time = time.time()
    last_chunk_count = 0
    
    while True:
        progress = await get_progress()
        
        if 'error' in progress:
            print(f"❌ Error: {progress['error']}")
            await asyncio.sleep(10)
            continue
        
        current_time = datetime.now().strftime("%H:%M:%S")
        elapsed = time.time() - start_time
        elapsed_str = f"{int(elapsed//3600):02d}:{int((elapsed%3600)//60):02d}:{int(elapsed%60):02d}"
        
        # Calculate processing rate
        chunks_processed = progress['total_chunks']
        if chunks_processed > last_chunk_count:
            rate = (chunks_processed - last_chunk_count) / 30  # chunks per second (30s interval)
            rate_str = f"{rate:.1f} chunks/sec"
        else:
            rate_str = "0.0 chunks/sec"
        
        # Clear screen and show progress
        print("\033[2J\033[H", end="")  # Clear screen
        print("🚀 EU Green Deal Document Embedding Progress Monitor")
        print("=" * 60)
        print(f"⏰ Current Time: {current_time}")
        print(f"⏱️  Elapsed Time: {elapsed_str}")
        print(f"📊 Processing Rate: {rate_str}")
        print("=" * 60)
        print(f"📄 Documents Completed: {progress['documents_processed']}/26")
        print(f"📝 Total Chunks Processed: {chunks_processed:,}")
        
        if progress['latest_document']:
            print(f"🔄 Latest Document: {progress['latest_document']}")
            print(f"📋 Chunks in Latest Doc: {progress['latest_chunks']:,}")
            if progress['latest_time']:
                latest_time = progress['latest_time'].strftime("%H:%M:%S")
                print(f"✅ Last Completed: {latest_time}")
        
        # Progress bar for documents
        doc_progress = (progress['documents_processed'] / 26) * 100
        doc_bar = "█" * int(doc_progress // 5) + "░" * (20 - int(doc_progress // 5))
        print(f"📈 Document Progress: [{doc_bar}] {doc_progress:.1f}%")
        
        # Estimate completion
        if chunks_processed > 100 and rate > 0:
            estimated_total_chunks = 8500  # Conservative estimate
            remaining_chunks = max(0, estimated_total_chunks - chunks_processed)
            if rate > 0:
                eta_seconds = remaining_chunks / rate
                eta_hours = int(eta_seconds // 3600)
                eta_minutes = int((eta_seconds % 3600) // 60)
                print(f"⏳ Estimated Time Remaining: {eta_hours:02d}:{eta_minutes:02d}")
        
        print("=" * 60)
        
        if progress['documents_processed'] >= 26:
            print("🎉 ALL DOCUMENTS PROCESSED! 🎉")
            print("✅ The chatbot is now ready to use with embedded knowledge!")
            print("🤖 You can now test the agent with queries about EU Green Deal policies.")
            break
        
        print("💡 Press Ctrl+C to stop monitoring")
        print(f"🔄 Next update in 30 seconds...")
        
        last_chunk_count = chunks_processed
        
        try:
            await asyncio.sleep(30)
        except KeyboardInterrupt:
            print("\n👋 Monitoring stopped by user")
            break

if __name__ == "__main__":
    try:
        asyncio.run(monitor_progress())
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
    except Exception as e:
        print(f"❌ Error: {e}")