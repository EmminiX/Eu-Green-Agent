-- =============================================================================
-- EU Green Policies Chatbot - Database Initialization
-- =============================================================================
-- This script initializes the PostgreSQL database with pgvector extension
-- for OpenAI embeddings storage and vector similarity search

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =============================================================================
-- DOCUMENTS TABLE
-- =============================================================================
-- Main documents table storing original document content and metadata
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(512) NOT NULL,
    title VARCHAR(512),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    file_hash VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for documents table
CREATE INDEX IF NOT EXISTS idx_documents_filename ON documents(filename);
CREATE INDEX IF NOT EXISTS idx_documents_file_hash ON documents(file_hash);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_metadata ON documents USING GIN(metadata);

-- =============================================================================
-- DOCUMENT CHUNKS TABLE
-- =============================================================================
-- Document chunks with vector embeddings for similarity search
CREATE TABLE IF NOT EXISTS document_chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(3072), -- OpenAI text-embedding-3-large dimension
    metadata JSONB DEFAULT '{}',
    filename VARCHAR(512),
    title VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for document_chunks table
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_filename ON document_chunks(filename);
CREATE INDEX IF NOT EXISTS idx_document_chunks_metadata ON document_chunks USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_document_chunks_created_at ON document_chunks(created_at DESC);

-- Vector similarity search index using HNSW (Hierarchical Navigable Small World)
-- This provides fast approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw 
ON document_chunks USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Additional index for exact search (slower but more accurate)
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_ivfflat 
ON document_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- =============================================================================
-- SEARCH STATISTICS TABLE
-- =============================================================================
-- Track search queries and results for analytics
CREATE TABLE IF NOT EXISTS search_logs (
    id SERIAL PRIMARY KEY,
    query TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    search_time_ms INTEGER,
    session_id VARCHAR(64),
    user_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for search_logs table
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_session_id ON search_logs(session_id);

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to documents table
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- UTILITY FUNCTIONS
-- =============================================================================

-- Function to search documents using vector similarity
CREATE OR REPLACE FUNCTION search_documents_by_embedding(
    query_embedding VECTOR(3072),
    similarity_threshold REAL DEFAULT 0.5,
    max_results INTEGER DEFAULT 10
)
RETURNS TABLE(
    id INTEGER,
    content TEXT,
    filename VARCHAR(512),
    title VARCHAR(512),
    metadata JSONB,
    similarity REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.id,
        dc.content,
        dc.filename,
        dc.title,
        dc.metadata,
        (1 - (dc.embedding <=> query_embedding))::REAL as similarity
    FROM document_chunks dc
    WHERE (1 - (dc.embedding <=> query_embedding)) > similarity_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Function to get document statistics
CREATE OR REPLACE FUNCTION get_document_stats()
RETURNS TABLE(
    total_documents BIGINT,
    total_chunks BIGINT,
    avg_chunk_length NUMERIC,
    latest_upload TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT d.id) as total_documents,
        COUNT(c.id) as total_chunks,
        AVG(LENGTH(c.content)) as avg_chunk_length,
        MAX(d.created_at) as latest_upload
    FROM documents d
    LEFT JOIN document_chunks c ON d.id = c.document_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =============================================================================
-- Uncomment the following lines to insert sample data for testing

/*
-- Sample EU Green Deal document
INSERT INTO documents (filename, title, content, file_hash) VALUES 
(
    'eu_green_deal_overview.txt',
    'EU Green Deal Overview',
    'The European Green Deal is a set of policy initiatives by the European Commission with the overarching aim of making Europe climate neutral by 2050. It includes the European Climate Law, which makes the 2050 target legally binding. The plan covers all sectors of the economy, notably transport, energy, agriculture, buildings, and industries such as steel, cement, ICT, textiles and chemicals.',
    md5('sample_content_1')
);

-- Sample document chunk (you would normally create this through the application)
-- Note: This example uses a dummy embedding vector - in practice, this would come from OpenAI
INSERT INTO document_chunks (document_id, content, embedding, filename, title, metadata) VALUES 
(
    1,
    'The European Green Deal is a set of policy initiatives by the European Commission with the overarching aim of making Europe climate neutral by 2050.',
    array_fill(0.1, ARRAY[3072])::VECTOR(3072), -- Dummy embedding - replace with actual OpenAI embedding
    'eu_green_deal_overview.txt',
    'EU Green Deal Overview',
    '{"chunk_index": 0, "total_chunks": 1}'::JSONB
);
*/

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE 'EU Green Policies Chatbot database initialized successfully!';
    RAISE NOTICE 'Extensions enabled: uuid-ossp, pgcrypto, vector';
    RAISE NOTICE 'Tables created: documents, document_chunks, search_logs';
    RAISE NOTICE 'Vector dimension: 3072 (OpenAI text-embedding-3-large)';
    RAISE NOTICE 'Indexes created for optimal vector search performance';
END $$;