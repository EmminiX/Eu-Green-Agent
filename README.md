# 🌱 EU Green Policies Chatbot

**🏆 Production-Ready Multilingual AI Assistant for EU Green Deal Compliance** 

An advanced intelligent chatbot specialized in EU environmental regulations and sustainability compliance. Features **Verdana AI Agent**, **OpenAI embeddings with PostgreSQL vector database**, **comprehensive web verification**, and **24+ official EU policy documents**. Built with modern architecture supporting **multiple chat sessions**, **local browser storage**, and **voice accessibility**.

> **🎯 Current Status: Production Ready**  
> **🌍 Supporting 24 EU Languages | 📚 24+ Official Documents | 🔍 Real-time Web Verification**

![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.11+-blue)
![Next.js](https://img.shields.io/badge/next.js-14-black)
![Docker](https://img.shields.io/badge/docker-supported-blue)

## 🚀 Core Features

### 🧠 **Verdana AI Agent Architecture**
- **Intelligent Query Classification**: Automatically distinguishes between casual conversation, identity queries, and EU Green Deal policy questions
- **Language Detection & Persistence**: Automatically detects user's language from first message and maintains consistency throughout session
- **Conversation Context Awareness**: Maintains full conversation history and can reference previous queries within sessions
- **Source Deduplication**: Eliminates duplicate documents and provides unique, high-quality sources
- **Proactive Information Gathering**: Performs additional web searches when detailed information is requested

### 🔍 **Advanced RAG & Search System**
- **OpenAI Text-Embedding-3-Large**: 3072-dimensional vectors for precise semantic matching
- **PostgreSQL with pgvector**: High-performance vector storage and similarity search
- **Dual Web Verification**: Domain-restricted EU searches + broader policy research via Tavily API
- **Smart Document Chunking**: 800-token chunks with 300-token overlap for optimal retrieval
- **Cosine Similarity Threshold**: 0.3 threshold ensuring only relevant documents are retrieved

### 🏛️ EU AI Act Compliance
- **Article 50 Transparency**: Clear AI system disclosure in 9 EU languages
- **User Consent Management**: Explicit consent tracking and validation
- **AI Content Marking**: Machine-readable markers for all AI-generated content
- **Multilingual Disclosure**: Full compliance across all supported languages
- **User Rights Protection**: Complete right to information and withdrawal of consent

### 🎙️ **Voice & Accessibility Features**
- **OpenAI Whisper Integration**: High-quality speech-to-text processing with 24+ language support
- **Real-time Audio Processing**: Converts speech to text with visual feedback and status indicators
- **Browser-compatible Audio**: Works across Chrome, Firefox, and Edge without additional plugins
- **Accessibility-First Design**: Voice input supports users with typing difficulties or disabilities

### 📚 **Knowledge Base & Document Processing**
- **24+ Official EU Documents**: Comprehensive coverage from European Commission official sources
- **Smart Document Processing**: PyPDF2, python-docx, and BeautifulSoup for multi-format support
- **Automated Embedding Pipeline**: Batch processing with efficient memory management
- **Source Transparency**: Every response includes detailed source attribution with relevance scores

### 🌐 **Enhanced User Experience**
- **Multiple Chat Sessions**: Create separate conversations for different topics with persistent history
- **Local Browser Storage**: All chat history saved in browser localStorage (privacy-first approach)
- **Session Management**: Easy switching between conversations via history menu with session titles
- **Language Consistency**: Automatic detection and maintenance throughout individual sessions
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Font Customization**: Adjustable font sizes for accessibility (auto-adjusts for maximized mode)
- **Conversation Context**: Each session maintains its own history and can reference previous queries

### 🔐 **Privacy & Data Management**
- **GDPR Compliant**: Complete user control over personal conversation data
- **No External Storage**: Conversations never sent to external storage services
- **Browser-Only Data**: All chat history remains on user's device until browser cache is cleared
- **Transparent Data Flow**: Clear information about what data is processed and how

### 🏛️ **EU Policy Coverage (24+ Official Documents)**
- **Core Strategies**: European Green Deal, REPowerEU Plan, Sustainable Europe Investment Plan
- **Climate Action**: European Climate Law, Fit for 55 Package, EU Emissions Trading System Reform
- **Sectoral Policies**: Farm to Fork Strategy, Circular Economy Action Plan, EU Biodiversity Strategy 2030
- **Energy Transition**: Renewable Energy Directive, Energy Efficiency Directive
- **Transport & Industry**: CBAM Implementation Guides, FuelEU Maritime, ReFuelEU Aviation
- **Standards & Regulations**: EU Taxonomy Regulation, CO2 Emission Standards, Effort Sharing Regulation
- **Support Mechanisms**: Social Climate Fund, Just Transition guidance, Investment frameworks

## 🏗️ Architecture

### Backend Stack
- **FastAPI** (Python 3.11+) for high-performance async API endpoints
- **Verdana Agent** specialized EU Green Deal compliance assistant with intelligent query classification
- **PostgreSQL with pgvector** for vector storage and similarity search (replacing RAGFlow)
- **OpenAI GPT-4** for language processing and response generation
- **OpenAI text-embedding-3-large** for semantic document embeddings (3072 dimensions)
- **OpenAI Whisper API** for speech-to-text transcription
- **Tavily API** for real-time web research and verification
- **asyncpg** for async PostgreSQL operations
- **httpx** for async HTTP client operations

### Frontend Stack
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **shadcn/ui** components
- **Custom Canvas Background** with interactive elements

### External APIs
- **OpenAI API** for GPT-4, text-embedding-3-large, and Whisper
- **Tavily Search API** for web research and verification with EU domain restrictions

## 🚦 Quick Start

### Prerequisites
- **Docker & Docker Compose**
- **Node.js 18+** (for local development)
- **Python 3.11+** (for local development)
- **OpenAI API Key**
- **Tavily API Key** (optional, for web verification)

### 1. Clone the Repository
```bash
git clone https://github.com/EmminiX/EU-Green_policies_chatbot.git
cd EU-Green_policies_chatbot
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit the .env file with your API keys
nano .env
```

Required environment variables:
```env
# OpenAI Configuration (Required)
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-your_openai_api_key_here

# Web search and verification (Recommended)
# Get your API key from: https://app.tavily.com/sign-up
TAVILY_API_KEY=tvly-your_tavily_api_key_here

# Optional: Additional AI providers
ANTHROPIC_API_KEY=your_anthropic_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here

# PostgreSQL Configuration
POSTGRES_DB=eu_green_chatbot
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_PORT=5432

# Document Processing
CHUNK_SIZE=800
CHUNK_OVERLAP=300
VECTOR_DIMENSION=3072
OPENAI_EMBEDDING_MODEL=text-embedding-3-large

# Application URLs
BACKEND_PORT=8000
FRONTEND_PORT=3000
```

### 3. Deploy with Docker

```bash
# Build and start entire system (frontend + backend + PostgreSQL + Redis)
docker compose build
docker compose up -d

# Check all services are running
docker compose ps

# Follow logs to monitor startup
docker compose logs -f

# Check system health
curl http://localhost:8000/health
```

**Services Started:**
- **Frontend**: http://localhost:3000 (Next.js application)
- **Backend API**: http://localhost:8000 (FastAPI with Verdana agent)
- **PostgreSQL**: http://localhost:5432 (Vector database with pgvector)
- **Redis**: http://localhost:6379 (Session and cache storage)

#### Common Commands
```bash
# View logs
docker compose logs -f [service-name]

# Stop services  
docker compose down

# Restart a service
docker compose restart [service-name]

# Rebuild after changes
docker compose build --no-cache [service-name]
```

### 4. Access the Application

#### Application Access
- **Frontend**: http://localhost:3000 (Main chat interface)
- **Backend API**: http://localhost:8000 (REST API endpoints)
- **API Documentation**: http://localhost:8000/docs (Interactive API docs)
- **Health Check**: http://localhost:8000/health (System status)

#### First Time Setup
1. The database schema will be automatically created on first startup
2. Upload EU policy documents using the batch upload script:
   ```bash
   python scripts/batch_upload_documents.py
   ```
3. Start chatting! The Verdana agent will automatically detect your language and maintain session context.

## 🛠️ Development Setup

### Backend Development
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Database Setup
```bash
# Run PostgreSQL with pgvector
docker-compose up postgres -d

# The database will be automatically initialized with the schema
# from backend/sql/init.sql
```

## 🚀 Production Deployment

### VPS/Server Deployment with Document Embedding

When deploying to a VPS or server, you need to embed the EU policy documents into your vector database. Follow these steps:

#### 1. Initial Server Setup
```bash
# Clone repository on your server
git clone https://github.com/EmminiX/EU-Green_policies_chatbot.git
cd EU-Green_policies_chatbot

# Copy and configure environment
cp .env.example .env
nano .env  # Add your API keys and configure database settings
```

#### 2. Start Database Services
```bash
# Start PostgreSQL with pgvector extension
docker compose up postgres -d

# Wait for PostgreSQL to be ready
docker compose logs postgres
```

#### 3. **IMPORTANT: Document Embedding Process**

**⚠️ Critical Step**: You must embed all EU policy documents when deploying to a new environment:

```bash
# Install Python dependencies for embedding script
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run the document embedding script
cd ../scripts
python embed_training_documents.py
```

**What this script does:**
- Processes all 24+ PDF documents in `training_docs/` directory
- Extracts text using PyPDF2
- Creates 800-token chunks with 300-token overlap
- Generates 3072-dimensional embeddings using OpenAI text-embedding-3-large
- Stores vectors in PostgreSQL with pgvector for similarity search
- **Estimated time**: 15-30 minutes depending on document size and API speed
- **Cost**: ~$2-5 in OpenAI API usage for embeddings

#### 4. Verify Document Embedding
```bash
# Check embedded documents in database
cd ../backend
python -c "
import asyncio
from scripts.embed_training_documents import DocumentProcessor

async def check_stats():
    processor = DocumentProcessor()
    await processor.initialize_database()
    stats = await processor.get_database_stats()
    print(f'Documents: {stats[\"documents\"]}')
    print(f'Chunks: {stats[\"chunks\"]}')
    await processor.close_database()

asyncio.run(check_stats())
"
```

**Expected output:**
```
Documents: 24
Chunks: 800+
```

#### 5. Deploy Full Application
```bash
# Build and start all services
docker compose build
docker compose up -d

# Verify all services are running
docker compose ps
curl http://your-server-ip:8000/health
```

#### 6. Environment-Specific Configuration

**For VPS deployment, update these in your `.env`:**
```env
# Database URL for production
DATABASE_URL=postgresql+asyncpg://postgres:your_password@localhost:5432/eu_green_chatbot

# Frontend URLs (replace with your domain)
NEXT_PUBLIC_API_URL=http://your-domain.com:8000
NEXT_PUBLIC_WS_URL=ws://your-domain.com:8000

# Production settings
ENVIRONMENT=production
DEBUG=false
```

### Deployment Checklist

- [ ] **API Keys**: OpenAI API key added to `.env`
- [ ] **Database**: PostgreSQL running with pgvector extension
- [ ] **Documents**: All 24+ EU documents embedded using `embed_training_documents.py`
- [ ] **Services**: Frontend, Backend, Database all running
- [ ] **Health Check**: `/health` endpoint returns 200 OK
- [ ] **Test Chat**: Verdana agent responds to EU policy queries
- [ ] **SSL/HTTPS**: Configure reverse proxy (nginx/caddy) for HTTPS
- [ ] **Firewall**: Configure ports 3000 (frontend) and 8000 (backend)
- [ ] **Browser Compatibility**: Set correct HTTPS URLs for Safari/Brave compatibility

### 🌐 Browser Compatibility (Important for HTTPS Deployments)

**Issue**: Safari and Brave browsers may show "Unable to connect to server" while Chrome works fine.

**Root Cause**: Mixed content violation - HTTPS site trying to make HTTP API calls.

**Solution**: Update your `.env` file with HTTPS URLs for production:

```bash
# For HTTPS deployments (replace with your domain)
NEXT_PUBLIC_API_URL=https://your-domain.com
NEXT_PUBLIC_WS_URL=wss://your-domain.com
NEXT_PUBLIC_ENVIRONMENT=production
```

**After changing .env, rebuild the frontend:**
```bash
docker compose build --no-cache frontend
docker compose up -d --force-recreate frontend
```

**Timeout Configuration for Safari/Brave:**

Safari and Brave browsers have stricter timeout behaviors. The application includes optimized timeout settings:

```bash
# Add these to your .env file for optimal Safari/Brave performance
FRONTEND_TIMEOUT_SECONDS=25
BACKEND_TIMEOUT_SECONDS=8
NGINX_PROXY_TIMEOUT_SECONDS=30
```

**Why this happens:**
- Next.js bakes environment variables at build time
- Different browsers handle mixed content differently
- Safari/Brave: Strict HTTPS enforcement + aggressive timeouts
- Chrome: More permissive with cross-origin requests and timeouts
- AbortController with 25s timeout prevents Safari/Brave hanging
- Nginx proxy timeouts (30s) provide buffer above frontend timeout (25s)

### Re-deployment Notes

**When deploying to a new server/environment:**
1. You **MUST** re-embed documents - vectors are environment-specific
2. The embedding process needs to run once per deployment environment
3. Document vectors are not portable between different database instances
4. Budget for OpenAI API costs for initial embedding (~$2-5)

**When updating existing deployment:**
- If documents haven't changed: No re-embedding needed
- If new documents added: Run embedding script to add new documents
- If document content updated: Delete old embeddings and re-embed

### Troubleshooting Deployment

**No responses to EU policy questions:**
```bash
# Check if documents are embedded
curl http://localhost:8000/api/health
# Should show document count > 0
```

**Database connection errors:**
```bash
# Check PostgreSQL logs
docker compose logs postgres

# Test database connection
python -c "import asyncpg; print('Database accessible')"
```

## 📁 Project Structure

```
eu-green-chatbot/
├── backend/
│   ├── agents/              # AI agent system
│   │   └── verdana_agent.py # Main Verdana agent with query classification
│   ├── api/                 # FastAPI routes
│   │   └── routes/          # API endpoints (chat, health)
│   ├── core/                # Configuration and logging
│   ├── services/            # Business logic services
│   │   ├── rag_service.py   # Vector search and document processing
│   │   ├── web_service.py   # Tavily web search integration
│   │   └── stt_service.py   # OpenAI Whisper speech-to-text
│   ├── sql/                 # Database schema initialization
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   │   ├── page.tsx     # Homepage
│   │   │   ├── policies/    # EU policies page
│   │   │   ├── about/       # About page
│   │   │   ├── architecture/ # Technical architecture
│   │   │   ├── privacy/     # Privacy policy
│   │   │   ├── terms/       # Terms of service
│   │   │   └── compliance/  # AI Act compliance
│   │   ├── components/      # React components
│   │   │   ├── chat/        # Chat interface components
│   │   │   ├── ui/          # UI components
│   │   │   └── layout/      # Layout components
│   │   └── hooks/           # Custom React hooks
│   ├── package.json
│   └── Dockerfile
├── training_docs/           # 24+ official EU policy documents
├── scripts/                 # Utility scripts
├── docker-compose.yml       # Multi-service orchestration
├── .env.example
└── README.md
```

## 🔧 Configuration

### API Keys Setup

1. **OpenAI API Key** (Required)
   - Get from: https://platform.openai.com/api-keys
   - Used for: Language processing, embeddings, agent reasoning

2. **Tavily Search API** (Recommended)
   - Get from: https://tavily.com
   - Used for: Real-time web search and verification of EU policy information

### Environment Variables

All configuration is handled through environment variables. See `.env.example` for a complete list.

### Database Configuration

The system uses PostgreSQL with the pgvector extension for storing document embeddings and metadata. Key configuration:
- **Vector Dimensions**: 3072 (OpenAI text-embedding-3-large)
- **Similarity Search**: Cosine similarity with 0.3 threshold
- **Document Chunks**: 800 tokens with 300 token overlap
- **Auto-initialization**: Database schema created automatically on first startup

## 📊 Monitoring & Analytics

### Agent Performance
- Real-time agent status monitoring
- Task execution metrics
- Success/failure rates
- Response time analytics

### System Metrics
- Query processing statistics
- Vector database performance
- User interaction patterns
- Whisper transcription quality
- Error tracking and logging

### Health Checks
```bash
# Check system health
curl http://localhost:8000/health/

# Test chat API endpoint
curl -X POST "http://localhost:8000/api/chat/message" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the EU Green Deal?", "session_id": "test", "language": "en", "ai_consent": {"accepted": true}}'

# Test Whisper speech-to-text endpoint
curl -X POST http://localhost:8000/api/chat/speech-to-text \
  -F "audio=@your_audio_file.wav"
```

## 🔒 Privacy & Data Management

### Multiple Chat Sessions
- **Topic Organization**: Create separate conversations for different EU policy areas (e.g., "CBAM Questions", "Circular Economy Research")
- **Session Management**: Easy switching between conversations via history menu with clear session titles
- **Persistent Context**: Each session maintains its own conversation context and language preference
- **Session History**: View and resume previous conversations with full message history

### Local Data Storage & Privacy
- **Browser-Only Storage**: All chat history saved in browser localStorage on user's device
- **Zero External Storage**: Conversations never sent to external storage services or third-party analytics
- **Privacy First**: Your data stays on your device until you clear browser cache or delete sessions
- **GDPR Compliant**: Complete user control over personal conversation data with clear data retention policies
- **Language Persistence**: Each session remembers detected language (24 EU languages supported)

### Data Lifecycle
```
User Query → Verdana Agent Processing → Response Generation → Browser localStorage
     ↓                ↓                      ↓                     ↓
Language Detection → Vector Search → Web Verification → Local Session Storage
                 (No conversation data sent to external storage)
```

### What Data is Processed
- **Local Storage**: Chat messages, session metadata, language preferences
- **Processing Only**: Individual queries sent to OpenAI/Tavily for response generation
- **Not Stored Externally**: Full conversation history, personal information, session data

## 🌍 Multilingual Support

The Verdana agent supports all 24 official EU languages with intelligent language detection and session persistence:

### Supported Languages
**Germanic**: English (en), German (de), Dutch (nl), Swedish (sv), Danish (da)
**Romance**: French (fr), Italian (it), Spanish (es), Portuguese (pt), Romanian (ro)
**Slavic**: Polish (pl), Czech (cs), Slovak (sk), Bulgarian (bg), Croatian (hr), Slovenian (sl)
**Baltic**: Lithuanian (lt), Latvian (lv), Estonian (et)
**Other**: Finnish (fi), Hungarian (hu), Greek (el), Maltese (mt), Irish (ga)

### Language Features
- **Automatic Detection**: Detects language from your first message with high accuracy
- **Session Persistence**: Maintains chosen language throughout individual conversations
- **Technical Preservation**: Preserves official EU policy names and technical terminology
- **Context Awareness**: Understands multilingual policy context and cross-references

## 📈 Usage Examples

### Basic Chat
```python
# Send a message to the chatbot
import requests

response = requests.post("http://localhost:8000/api/chat/message", json={
    "message": "What is the European Green Deal?",
    "session_id": "demo-session",
    "language": "en"
})

print(response.json())
```

### Voice Input (Speech-to-Text)
```javascript
// Record audio and convert to text
const startRecording = async () => {
    const response = await fetch('/api/chat/speech-to-text', {
        method: 'POST',
        body: audioBlob,
        headers: {'Content-Type': 'audio/wav'}
    });
    const result = await response.json();
    console.log('Transcribed text:', result.text);
};
```

### Session Management
```javascript
// Create new chat session
const newSession = () => {
    const sessionId = `chat-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('currentSession', sessionId);
    return sessionId;
};

// Resume existing session
const resumeSession = (sessionId) => {
    const history = JSON.parse(localStorage.getItem(`chat-${sessionId}`) || '[]');
    return history;
};
```

## 🤝 Contributing

I welcome contributions! Please see my [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Guidelines
1. Follow PEP 8 for Python code
2. Use TypeScript for frontend development
3. Add tests for new features
4. Update documentation as needed
5. Follow conventional commit messages

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check this README and code comments
- **Issues**: Report bugs and request features on GitHub
- **Discussions**: Join our GitHub Discussions for questions

### Common Issues

**1. OpenAI API Errors**
```bash
# Check your API key is valid
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.openai.com/v1/models
```

**2. Database Connection Issues**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres
```

**3. Frontend Build Errors**
```bash
# Clear Next.js cache
cd frontend
rm -rf .next
npm run build
```


## 🙏 Acknowledgments

- **European Commission** for open access to official EU Green Deal policy documents
- **PostgreSQL & pgvector** for high-performance vector database capabilities
- **OpenAI** for powerful language models, embeddings, and Whisper speech recognition
- **Tavily** for reliable web search and verification capabilities
- **Next.js & Vercel** for excellent frontend development framework
- **FastAPI** for high-performance Python web framework
- **All Contributors** who help improve this project

---

**Built with ❤️ for a sustainable future**

For more information, visit our [GitHub repository](https://github.com/EmminiX/EU-Green_policies_chatbot).

**Support this project**: [![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-☕-orange)](https://buymeacoffee.com/emmix)