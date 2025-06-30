# EU Green Deal Chatbot - Implementation Plan & Code Structure

## 🚀 Implementation Roadmap

### Phase 1: Foundation Setup (Days 1-7)

#### Day 1-2: Project Initialization
```bash
# Project structure setup
mkdir eu-green-chatbot
cd eu-green-chatbot

# Create service directories
mkdir -p frontend backend/api-gateway backend/ai-services data/vectordb config nginx

# Initialize package.json files
cd frontend && npm init -y
cd ../backend/api-gateway && npm init -y
cd ../ai-services && touch requirements.txt
```

#### Day 3-4: Frontend Foundation
- Next.js 15 setup with TypeScript
- Tailwind CSS configuration
- Basic chat UI components
- EU AI Act compliance components

#### Day 5-7: Backend Integration
- Node.js API gateway setup
- Python FastAPI service integration
- WebSocket implementation
- Redis cache configuration

### Phase 2: Core Features (Days 8-14)

#### Day 8-10: Chat Interface
- Real-time messaging system
- Message threading
- Response streaming
- Error handling

#### Day 11-14: AI Integration
- RAG agent connection
- Real-time data ingestion
- Source attribution system
- Quality assurance pipeline

### Phase 3: Production Ready (Days 15-21)

#### Day 15-17: Security & Compliance
- EU AI Act implementation
- GDPR compliance
- Security hardening
- Rate limiting

#### Day 18-21: Deployment & Testing
- Docker containerization
- Performance optimization
- Accessibility testing
- Production deployment

## 📁 Detailed File Structure

```
eu-green-chatbot/
├── docker-compose.yml
├── .env.example
├── README.md
└── services/
    ├── frontend/                      # Next.js Application
    │   ├── src/
    │   │   ├── app/
    │   │   │   ├── globals.css
    │   │   │   ├── layout.tsx
    │   │   │   ├── page.tsx
    │   │   │   ├── chat/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── layout.tsx
    │   │   │   └── api/
    │   │   │       └── health/route.ts
    │   │   ├── components/
    │   │   │   ├── ui/
    │   │   │   │   ├── button.tsx
    │   │   │   │   ├── input.tsx
    │   │   │   │   ├── card.tsx
    │   │   │   │   └── badge.tsx
    │   │   │   ├── chat/
    │   │   │   │   ├── ChatContainer.tsx
    │   │   │   │   ├── MessageList.tsx
    │   │   │   │   ├── MessageInput.tsx
    │   │   │   │   ├── MessageBubble.tsx
    │   │   │   │   └── TypingIndicator.tsx
    │   │   │   ├── compliance/
    │   │   │   │   ├── AIDisclosure.tsx
    │   │   │   │   ├── ConsentBanner.tsx
    │   │   │   │   └── SourceAttribution.tsx
    │   │   │   └── layout/
    │   │   │       ├── Header.tsx
    │   │   │       ├── Footer.tsx
    │   │   │       └── Sidebar.tsx
    │   │   ├── hooks/
    │   │   │   ├── useChat.ts
    │   │   │   ├── useSocket.ts
    │   │   │   └── useAccessibility.ts
    │   │   ├── services/
    │   │   │   ├── api.ts
    │   │   │   ├── socket.ts
    │   │   │   └── analytics.ts
    │   │   ├── types/
    │   │   │   ├── chat.ts
    │   │   │   ├── api.ts
    │   │   │   └── user.ts
    │   │   └── utils/
    │   │       ├── cn.ts
    │   │       ├── accessibility.ts
    │   │       └── constants.ts
    │   ├── public/
    │   │   ├── icons/
    │   │   └── images/
    │   ├── tailwind.config.js
    │   ├── next.config.js
    │   ├── package.json
    │   └── Dockerfile
    │
    ├── api-gateway/                   # Node.js API Gateway
    │   ├── src/
    │   │   ├── server.js
    │   │   ├── routes/
    │   │   │   ├── chat.js
    │   │   │   ├── health.js
    │   │   │   └── compliance.js
    │   │   ├── middleware/
    │   │   │   ├── auth.js
    │   │   │   ├── rateLimit.js
    │   │   │   └── validation.js
    │   │   ├── services/
    │   │   │   ├── socketManager.js
    │   │   │   ├── aiService.js
    │   │   │   └── cacheService.js
    │   │   └── utils/
    │   │       ├── logger.js
    │   │       └── helpers.js
    │   ├── package.json
    │   └── Dockerfile
    │
    ├── ai-services/                   # Python AI Services
    │   ├── main.py
    │   ├── agents/
    │   │   ├── __init__.py
    │   │   ├── retriever_agent.py
    │   │   ├── summarizer_agent.py
    │   │   ├── evaluation_agent.py
    │   │   └── compliance_agent.py
    │   ├── services/
    │   │   ├── __init__.py
    │   │   ├── data_ingestion.py
    │   │   ├── vector_store.py
    │   │   └── eu_api_connector.py
    │   ├── models/
    │   │   ├── __init__.py
    │   │   ├── chat_models.py
    │   │   └── response_models.py
    │   ├── utils/
    │   │   ├── __init__.py
    │   │   ├── embeddings.py
    │   │   └── preprocessing.py
    │   ├── requirements.txt
    │   └── Dockerfile
    │
    └── nginx/                         # Reverse Proxy
        ├── nginx.conf
        └── ssl/
            ├── cert.pem
            └── key.pem
```

## 🎨 Key Component Implementations

### Frontend Components

#### 1. Chat Container Component
```typescript
// components/chat/ChatContainer.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { AIDisclosure } from '../compliance/AIDisclosure';
import { TypingIndicator } from './TypingIndicator';

export function ChatContainer() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const { socket, connected } = useSocket();

  // Message handling logic
  const handleSendMessage = async (message: string) => {
    // Send message and handle response
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <AIDisclosure />
      <MessageList messages={messages} />
      {isTyping && <TypingIndicator />}
      <MessageInput onSendMessage={handleSendMessage} disabled={!connected} />
    </div>
  );
}
```

#### 2. EU AI Act Compliance Component
```typescript
// components/compliance/AIDisclosure.tsx
'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function AIDisclosure() {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <AlertDescription className="flex items-center justify-between">
        <span>
          🤖 You are interacting with an AI system. This chatbot provides information about EU Green Deal policies. 
          Responses are generated automatically and should be verified with official EU sources.
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAcknowledged(true)}
          className="ml-4"
        >
          Understood
        </Button>
      </AlertDescription>
    </Alert>
  );
}
```

### Backend Services

#### 1. WebSocket Manager
```javascript
// api-gateway/src/services/socketManager.js
const { Server } = require('socket.io');
const redis = require('redis');

class SocketManager {
  constructor(server) {
    this.io = new Server(server, {
      cors: { origin: process.env.FRONTEND_URL }
    });
    this.redis = redis.createClient();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      socket.on('chat_message', async (data) => {
        await this.handleChatMessage(socket, data);
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }

  async handleChatMessage(socket, data) {
    try {
      // Forward to AI service
      const response = await this.callAIService(data);
      
      // Send response back to client
      socket.emit('ai_response', {
        message: response.message,
        sources: response.sources,
        confidence: response.confidence,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to process message' });
    }
  }
}

module.exports = SocketManager;
```

#### 2. Enhanced Python RAG System
```python
# ai-services/agents/enhanced_retriever_agent.py
from typing import List, Dict
import asyncio
from .retriever_agent import RetrieverAgent
from ..services.eu_api_connector import EUAPIConnector
from ..services.data_ingestion import RealTimeDataIngestion

class EnhancedRetrieverAgent(RetrieverAgent):
    def __init__(self):
        super().__init__()
        self.eu_api = EUAPIConnector()
        self.data_ingestion = RealTimeDataIngestion()
        
    async def retrieve_with_real_time_data(self, query: str) -> Dict:
        # Get static chunks from vector store
        static_chunks = await self.retrieve_relevant_chunks(query)
        
        # Get real-time data from EU APIs
        real_time_data = await self.eu_api.search_latest_policies(query)
        
        # Combine and rank all sources
        combined_results = self.combine_and_rank_sources(
            static_chunks, 
            real_time_data
        )
        
        return {
            'chunks': combined_results,
            'sources': self.extract_source_links(combined_results),
            'last_updated': self.get_latest_update_time(combined_results)
        }
```

## 🔧 Configuration Files

### Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./services/frontend
    container_name: eu_green_frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api-gateway:4000
      - NEXT_PUBLIC_WS_URL=ws://api-gateway:4000
    depends_on:
      - api-gateway
    restart: unless-stopped

  api-gateway:
    build: ./services/api-gateway
    container_name: eu_green_api
    ports:
      - "4000:4000"
    environment:
      - REDIS_URL=redis://redis:6379
      - AI_SERVICE_URL=http://ai-services:8000
      - NODE_ENV=production
    depends_on:
      - redis
      - ai-services
    restart: unless-stopped

  ai-services:
    build: ./services/ai-services
    container_name: eu_green_ai
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - VECTOR_DB_URL=http://qdrant:6333
      - REDIS_URL=redis://redis:6379
    depends_on:
      - qdrant
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: eu_green_redis
    ports:
      - "6379:6379"
    restart: unless-stopped

  qdrant:
    image: qdrant/qdrant:latest
    container_name: eu_green_vectordb
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: eu_green_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./services/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./services/nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
    restart: unless-stopped

volumes:
  qdrant_data:

networks:
  default:
    name: eu_green_network
```

### Environment Configuration
```bash
# .env.example
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Database Configuration
REDIS_URL=redis://localhost:6379
VECTOR_DB_URL=http://localhost:6333

# API Configuration
API_PORT=4000
FRONTEND_PORT=3000
AI_SERVICE_PORT=8000

# Security
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000

# EU API Configuration
EU_API_BASE_URL=https://api.europa.eu
EU_API_KEY=your_eu_api_key

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
```

## 🧪 Testing Strategy

### Frontend Testing
```bash
# Unit Tests (Jest + React Testing Library)
npm run test

# E2E Tests (Playwright)
npm run test:e2e

# Accessibility Tests (axe-core)
npm run test:a11y
```

### Backend Testing
```bash
# API Tests (Supertest)
npm run test:api

# Integration Tests
npm run test:integration

# Load Tests (Artillery)
npm run test:load
```

### AI Service Testing
```python
# pytest configuration
# Unit tests for agents
pytest tests/agents/

# Integration tests
pytest tests/integration/

# Performance tests
pytest tests/performance/
```

## 📊 Monitoring & Analytics

### Health Checks
- Frontend: Next.js health endpoint
- API Gateway: Express health route
- AI Services: FastAPI health endpoint
- Database: Redis ping, Qdrant status

### Performance Metrics
- Response time tracking
- Message throughput
- Error rate monitoring
- Resource utilization

### User Analytics (Privacy-Compliant)
- Query categories (anonymized)
- Response satisfaction
- Feature usage patterns
- Accessibility feature adoption

## 🚀 Deployment Commands

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d

# Scaling
docker-compose up --scale ai-services=3

# Updates
docker-compose pull && docker-compose up -d

# Monitoring
docker-compose logs -f
```

This implementation plan provides a complete roadmap for building your EU Green Deal Chatbot platform, leveraging modern technologies while maintaining the design principles from your GreenCelt project.