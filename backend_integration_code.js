// Node.js API Gateway (api-gateway/src/server.js)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const redis = require('redis');

const app = express();
const server = http.createServer(app);

// Redis client for caching and session management
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// AI Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle chat messages
  socket.on('chat_message', async (data) => {
    try {
      const { message, timestamp } = data;
      
      // Input validation
      if (!message || message.trim().length === 0) {
        socket.emit('error', { message: 'Message cannot be empty' });
        return;
      }

      if (message.length > 500) {
        socket.emit('error', { message: 'Message too long' });
        return;
      }

      // Emit typing indicator
      socket.emit('typing');

      // Check cache first
      const cacheKey = `chat:${Buffer.from(message).toString('base64')}`;
      const cachedResponse = await redisClient.get(cacheKey);

      if (cachedResponse) {
        socket.emit('ai_response', JSON.parse(cachedResponse));
        return;
      }

      // Call Python AI service
      const aiResponse = await callAIService(message);
      
      // Cache the response (expire in 1 hour)
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(aiResponse));

      // Send response to client
      socket.emit('ai_response', aiResponse);

    } catch (error) {
      console.error('Error processing chat message:', error);
      socket.emit('error', { 
        message: 'Sorry, I encountered an error processing your request. Please try again.' 
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Function to call Python AI service
async function callAIService(message) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/chat`, {
      query: message,
      timestamp: new Date().toISOString()
    }, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return {
      message: response.data.response,
      sources: response.data.sources || [],
      confidence: response.data.confidence || 0,
      timestamp: new Date().toISOString(),
      evaluation: response.data.evaluation || {}
    };

  } catch (error) {
    console.error('AI Service Error:', error.response?.data || error.message);
    throw new Error('AI service temporarily unavailable');
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      redis: redisClient.isOpen,
      ai_service: 'checking...'
    }
  });
});

// EU compliance endpoint
app.get('/api/compliance', (req, res) => {
  res.json({
    ai_transparency: {
      notice: 'This service uses AI to generate responses about EU Green Deal policies',
      purpose: 'Educational information about EU environmental regulations',
      limitations: 'Responses should be verified with official EU sources'
    },
    data_processing: {
      personal_data: 'No personal data is stored',
      session_data: 'Temporary session tokens only',
      retention: 'No conversation history is retained'
    },
    user_rights: {
      transparency: 'Full transparency about AI usage',
      access: 'No personal data to access',
      rectification: 'Not applicable - no personal data stored',
      erasure: 'Session data automatically deleted'
    }
  });
});

// Start server
const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Connect to Redis
    await redisClient.connect();
    console.log('Connected to Redis');

    // Test AI service connection
    try {
      await axios.get(`${AI_SERVICE_URL}/health`);
      console.log('AI Service connection verified');
    } catch (error) {
      console.warn('AI Service not available at startup');
    }

    server.listen(PORT, () => {
      console.log(`API Gateway running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await redisClient.quit();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

startServer();

// ============================================
// Python AI Service Integration (ai-services/main.py)
// ============================================

"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
import logging
from datetime import datetime

# Import your existing agents
from agents.enhanced_retriever_agent import EnhancedRetrieverAgent
from agents.summarizer_agent import SummarizerAgent
from agents.evaluation_agent import EvaluationAgent
from agents.compliance_agent import EUActComplianceAgent
from services.real_time_data_ingestion import RealTimeDataIngestion

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="EU Green Deal AI Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class ChatRequest(BaseModel):
    query: str
    timestamp: str
    context: Optional[Dict[str, Any]] = None

class SourceInfo(BaseModel):
    title: str
    url: str
    type: str  # 'official', 'policy', 'document'
    relevance_score: Optional[float] = None

class ChatResponse(BaseModel):
    response: str
    sources: List[SourceInfo]
    confidence: float
    evaluation: Dict[str, Any]
    timestamp: str
    processing_time: float

# Initialize AI agents
retriever_agent = None
summarizer_agent = None
evaluation_agent = None
compliance_agent = None
data_ingestion = None

@app.on_event("startup")
async def startup_event():
    global retriever_agent, summarizer_agent, evaluation_agent, compliance_agent, data_ingestion
    
    logger.info("Initializing AI agents...")
    
    try:
        # Initialize agents
        retriever_agent = EnhancedRetrieverAgent()
        summarizer_agent = SummarizerAgent()
        evaluation_agent = EvaluationAgent()
        compliance_agent = EUActComplianceAgent()
        data_ingestion = RealTimeDataIngestion()
        
        # Start real-time data ingestion
        await data_ingestion.start_ingestion()
        
        logger.info("AI agents initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize AI agents: {e}")
        raise

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    start_time = datetime.now()
    
    try:
        logger.info(f"Processing query: {request.query[:100]}...")
        
        # Step 1: Enhanced retrieval with real-time data
        retrieval_result = await retriever_agent.retrieve_with_real_time_data(request.query)
        
        if not retrieval_result['chunks']:
            return ChatResponse(
                response="I don't have enough information to answer that question about EU Green Deal policies. Could you try rephrasing your question?",
                sources=[],
                confidence=0.0,
                evaluation={},
                timestamp=datetime.now().isoformat(),
                processing_time=(datetime.now() - start_time).total_seconds()
            )
        
        # Step 2: Generate summary
        summary = await summarizer_agent.summarize_retrieved_chunks(
            retrieval_result['chunks'], 
            request.query
        )
        
        # Step 3: EU Act compliance check
        compliance_result = await compliance_agent.ensure_compliance(summary, request.query)
        
        # Step 4: Evaluate response quality
        evaluation = evaluation_agent.evaluate_answer(summary, request.query)
        
        # Step 5: Prepare sources
        sources = [
            SourceInfo(
                title=source.get('title', 'EU Policy Document'),
                url=source.get('url', '#'),
                type=source.get('type', 'policy'),
                relevance_score=source.get('score', 0.0)
            )
            for source in retrieval_result['sources'][:5]  # Top 5 sources
        ]
        
        # Calculate confidence score
        confidence = min(
            evaluation.get('cosine_similarity', 0.0),
            retrieval_result.get('top_score', 0.0)
        ) if evaluation.get('cosine_similarity') else retrieval_result.get('top_score', 0.0)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"Query processed in {processing_time:.2f}s with confidence {confidence:.2f}")
        
        return ChatResponse(
            response=compliance_result['response'],
            sources=sources,
            confidence=confidence,
            evaluation=evaluation,
            timestamp=datetime.now().isoformat(),
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Error processing chat request: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "agents": {
            "retriever": retriever_agent is not None,
            "summarizer": summarizer_agent is not None,
            "evaluation": evaluation_agent is not None,
            "compliance": compliance_agent is not None
        }
    }

@app.get("/data-sources")
async def get_data_sources():
    # Return information about current data sources
    if data_ingestion:
        return await data_ingestion.get_source_status()
    return {"sources": [], "last_updated": None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
"""

// ============================================
// Enhanced Retriever Agent (Python)
// ============================================

"""
# ai-services/agents/enhanced_retriever_agent.py
import asyncio
import aiohttp
from typing import List, Dict, Any
from datetime import datetime, timedelta
from .retriever_agent import RetrieverAgent  # Your existing agent

class EnhancedRetrieverAgent(RetrieverAgent):
    def __init__(self):
        super().__init__()
        self.eu_api_endpoints = {
            'policies': 'https://data.europa.eu/api/hub/search/datasets',
            'legislation': 'https://eur-lex.europa.eu/search',
            'green_deal': 'https://ec.europa.eu/info/strategy/priorities-2019-2024/european-green-deal'
        }
        
    async def retrieve_with_real_time_data(self, query: str) -> Dict[str, Any]:
        # Get static chunks from your existing vector store
        static_chunks = await self.retrieve_relevant_chunks(query, top_k=5)
        
        # Get real-time data from EU APIs
        real_time_chunks = await self._fetch_real_time_data(query)
        
        # Combine and rank all sources
        all_chunks = static_chunks + real_time_chunks
        ranked_chunks = self._rank_by_relevance(all_chunks, query)
        
        # Extract source information
        sources = self._extract_sources(ranked_chunks)
        
        return {
            'chunks': ranked_chunks[:5],  # Top 5 most relevant
            'sources': sources,
            'top_score': ranked_chunks[0]['combined_score'] if ranked_chunks else 0.0,
            'last_updated': datetime.now().isoformat()
        }
    
    async def _fetch_real_time_data(self, query: str) -> List[Dict]:
        real_time_chunks = []
        
        try:
            async with aiohttp.ClientSession() as session:
                # Search EU datasets
                datasets = await self._search_eu_datasets(session, query)
                real_time_chunks.extend(datasets)
                
                # Search recent EU legislation
                legislation = await self._search_eu_legislation(session, query)
                real_time_chunks.extend(legislation)
                
        except Exception as e:
            print(f"Error fetching real-time data: {e}")
        
        return real_time_chunks
    
    async def _search_eu_datasets(self, session: aiohttp.ClientSession, query: str) -> List[Dict]:
        try:
            url = self.eu_api_endpoints['policies']
            params = {
                'query': query,
                'filter': 'keyword:green+deal',
                'limit': 5,
                'format': 'json'
            }
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._process_eu_datasets(data)
        except Exception as e:
            print(f"Error searching EU datasets: {e}")
        
        return []
    
    def _process_eu_datasets(self, data: Dict) -> List[Dict]:
        chunks = []
        for item in data.get('result', {}).get('results', []):
            chunk = {
                'chunk_text': item.get('notes', item.get('title', '')),
                'metadata': {
                    'source': 'eu_dataset',
                    'title': item.get('title', ''),
                    'url': item.get('landing_page', ''),
                    'type': 'official',
                    'date': item.get('metadata_modified', '')
                },
                'combined_score': 0.8  # High score for official EU data
            }
            chunks.append(chunk)
        return chunks
    
    def _rank_by_relevance(self, chunks: List[Dict], query: str) -> List[Dict]:
        # Enhanced ranking considering recency and source authority
        for chunk in chunks:
            base_score = chunk.get('combined_score', 0.0)
            
            # Boost official EU sources
            if chunk.get('metadata', {}).get('source') == 'eu_dataset':
                base_score += 0.2
            
            # Boost recent content
            date_str = chunk.get('metadata', {}).get('date', '')
            if date_str:
                try:
                    content_date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                    days_old = (datetime.now() - content_date).days
                    if days_old < 30:  # Content less than 30 days old
                        base_score += 0.1
                except:
                    pass
            
            chunk['combined_score'] = min(base_score, 1.0)
        
        return sorted(chunks, key=lambda x: x['combined_score'], reverse=True)
    
    def _extract_sources(self, chunks: List[Dict]) -> List[Dict]:
        sources = []
        for chunk in chunks:
            metadata = chunk.get('metadata', {})
            source = {
                'title': metadata.get('title', 'EU Policy Document'),
                'url': metadata.get('url', '#'),
                'type': metadata.get('type', 'policy'),
                'score': chunk.get('combined_score', 0.0)
            }
            sources.append(source)
        return sources
"""