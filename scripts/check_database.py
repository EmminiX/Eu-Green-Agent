#!/usr/bin/env python3
"""Check database content and upload documents if needed."""

import psycopg2
import os
from pathlib import Path

# Database connection
conn = psycopg2.connect(
    dbname="eu_green_chatbot",
    user="postgres",
    password="password",
    host="localhost",
    port="5432"
)
cur = conn.cursor()

print("=== DATABASE STATUS ===\n")

# Check documents
cur.execute("SELECT COUNT(*) FROM documents")
doc_count = cur.fetchone()[0]
print(f"Documents in database: {doc_count}")

# Check chunks
cur.execute("SELECT COUNT(*) FROM document_chunks")
chunk_count = cur.fetchone()[0]
print(f"Document chunks in database: {chunk_count}")

# List documents
if doc_count > 0:
    print("\nDocuments:")
    cur.execute("SELECT filename, chunk_count, upload_date FROM documents ORDER BY upload_date DESC LIMIT 10")
    for row in cur.fetchall():
        print(f"  - {row[0]}: {row[1]} chunks, uploaded {row[2]}")

# Check unique documents in chunks
cur.execute("SELECT COUNT(DISTINCT document_id) FROM document_chunks WHERE document_id IS NOT NULL")
unique_docs_in_chunks = cur.fetchone()[0]
print(f"\nUnique documents referenced in chunks: {unique_docs_in_chunks}")

# List some chunks
print("\nSample chunks:")
cur.execute("""
    SELECT dc.chunk_text, dc.chunk_index, d.filename 
    FROM document_chunks dc
    LEFT JOIN documents d ON dc.document_id = d.id
    LIMIT 3
""")
for row in cur.fetchall():
    text = row[0][:100] + "..." if len(row[0]) > 100 else row[0]
    print(f"  - Chunk {row[1]} from '{row[2]}': {text}")

cur.close()
conn.close()

print("\n=== To connect in pgAdmin ===")
print("1. Right-click 'Servers' → Register → Server")
print("2. General tab: Name = 'EU Green PostgreSQL'")
print("3. Connection tab:")
print("   - Host: localhost")
print("   - Port: 5432")
print("   - Database: eu_green_chatbot")
print("   - Username: postgres")
print("   - Password: password")
print("4. Click Save")
print("\nThen explore: Databases → eu_green_chatbot → Schemas → public → Tables")