-- Initialize PostgreSQL database with pgvector extension
-- for EU Green Policies Chatbot

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create application database (if not exists)
-- Note: This is handled by Docker environment variables

-- Create tables for application data
-- These complement the Graphiti knowledge graph

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    ip_address INET,
    language VARCHAR(10) DEFAULT 'en'
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) REFERENCES chat_sessions(session_id),
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sources JSONB,
    confidence FLOAT,
    response_time_ms INTEGER
);

-- Documents table for uploaded files
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(10) NOT NULL,
    file_size BIGINT NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'processing',
    chunk_count INTEGER DEFAULT 0,
    language VARCHAR(10) DEFAULT 'en',
    content_preview TEXT,
    metadata JSONB
);

-- Document chunks table with vector embeddings for RAG
DROP TABLE IF EXISTS document_chunks CASCADE;
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    embedding vector(1536), -- OpenAI embedding dimension
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agent tasks table for monitoring
CREATE TABLE IF NOT EXISTS agent_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id VARCHAR(255) UNIQUE NOT NULL,
    agent_name VARCHAR(100) NOT NULL,
    task_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    result JSONB,
    error_message TEXT,
    execution_time_ms INTEGER
);

-- System metrics table
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON documents(upload_date);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent_name ON agent_tasks(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_created_at ON agent_tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_system_metrics_metric_name ON system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded_at ON system_metrics(recorded_at);

-- Create vector similarity index for document chunks
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding 
ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at 
    BEFORE UPDATE ON chat_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
INSERT INTO chat_sessions (session_id, language) VALUES 
    ('demo-session', 'en'),
    ('test-session-1', 'en'),
    ('test-session-2', 'fr')
ON CONFLICT (session_id) DO NOTHING;

-- Sample metrics
INSERT INTO system_metrics (metric_name, metric_value, metric_type, metadata) VALUES
    ('total_queries', 0, 'counter', '{"description": "Total number of queries processed"}'),
    ('average_response_time', 0, 'gauge', '{"description": "Average response time in milliseconds"}'),
    ('active_sessions', 0, 'gauge', '{"description": "Number of active chat sessions"}')
ON CONFLICT DO NOTHING;

-- Create view for session analytics
CREATE OR REPLACE VIEW session_analytics AS
SELECT 
    cs.session_id,
    cs.created_at as session_start,
    cs.language,
    COUNT(cm.id) as message_count,
    MAX(cm.timestamp) as last_activity,
    AVG(cm.response_time_ms) as avg_response_time,
    AVG(cm.confidence) as avg_confidence
FROM chat_sessions cs
LEFT JOIN chat_messages cm ON cs.session_id = cm.session_id
GROUP BY cs.session_id, cs.created_at, cs.language;

-- Create view for agent performance
CREATE OR REPLACE VIEW agent_performance AS
SELECT 
    agent_name,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_tasks,
    AVG(execution_time_ms) as avg_execution_time,
    MAX(completed_at) as last_activity
FROM agent_tasks
GROUP BY agent_name;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

COMMENT ON DATABASE eu_green_chatbot IS 'Database for EU Green Policies Chatbot with multi-agent AI system';
COMMENT ON TABLE chat_sessions IS 'User chat sessions with metadata';
COMMENT ON TABLE chat_messages IS 'Individual messages in chat conversations';
COMMENT ON TABLE documents IS 'Uploaded documents and their metadata';
COMMENT ON TABLE document_chunks IS 'Text chunks from documents with embeddings';
COMMENT ON TABLE agent_tasks IS 'Tasks executed by different AI agents';
COMMENT ON TABLE system_metrics IS 'System performance and usage metrics';