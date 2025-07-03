# 🌱 EU Green Policies Chatbot

An intelligent unified AI assistant for navigating EU Green Deal compliance, environmental policies, and sustainability requirements. Built with a streamlined unified agent architecture, local Whisper speech processing, and real-time web verification capabilities.

![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.11+-blue)
![Next.js](https://img.shields.io/badge/next.js-14-black)
![Docker](https://img.shields.io/badge/docker-supported-blue)

## 🚀 Features

### 🏛️ EU AI Act Compliance
- **Article 50 Transparency**: Clear AI system disclosure before interaction
- **User Consent Management**: Explicit consent tracking and validation
- **AI Content Marking**: Machine-readable markers for all AI-generated content
- **Multilingual Disclosure**: Support for 5 EU languages
- **User Rights Protection**: Right to information and withdrawal of consent

### 🧠 Unified AI Agent Architecture
- **Streamlined Processing**: Single intelligent agent handles complete interaction lifecycle
- **RAG Integration**: Semantic search through PostgreSQL vector database with 26+ EU policy documents
- **Web Verification**: Real-time accuracy checking against current EU official sources
- **Local Whisper Processing**: Server-side speech-to-text for privacy and reliability
- **Response Synthesis**: Comprehensive answers with source attribution and confidence scoring

### 📚 Advanced Knowledge Management
- **PostgreSQL Vector Database**: High-performance semantic search with pgvector extension
- **Document Processing**: 26+ official EU policy documents processed into searchable chunks
- **Web Content Ingestion**: Real-time scraping from official EU sources via Tavily and Firecrawl
- **Semantic Understanding**: Context-aware retrieval using OpenAI embeddings

### 🌐 User Experience
- **Real-time Chat Interface**: WebSocket-powered conversations
- **AI-Powered Voice Input**: OpenAI Whisper speech-to-text with multi-language support
- **Multiple Chat Sessions**: Organize conversations by topic with persistent history
- **Local Data Storage**: Chat history saved securely in browser (no external servers)
- **Multilingual Support**: English, Italian, Romanian, German, French
- **Source Citations**: All responses include proper citations
- **Confidence Scoring**: Transparency in AI response quality
- **Mobile Responsive**: Works seamlessly across devices
- **Accessibility Features**: Voice input for hands-free interaction

### 🏛️ EU Policy Coverage
- European Green Deal
- Carbon Border Adjustment Mechanism (CBAM)
- Farm to Fork Strategy
- Circular Economy Action Plan
- EU Biodiversity Strategy
- Climate Law and regulations

## 🏗️ Architecture

### Backend Stack
- **FastAPI** (Python 3.11+) for high-performance API endpoints
- **Unified Chat Agent** for streamlined processing workflow
- **PostgreSQL** with pgvector for embeddings and vector search
- **Redis** for caching and session management
- **OpenAI GPT-4o-mini** for language processing and response generation
- **OpenAI Whisper** for local speech-to-text transcription
- **Tavily & Firecrawl** for real-time web research and verification

### Frontend Stack
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **shadcn/ui** components
- **Custom Canvas Background** with interactive elements

### External APIs
- **Tavily Search API** for web research
- **Firecrawl** for web content extraction
- **OpenAI Embeddings** for semantic search
- **EU Official Data Sources**

## 🚦 Quick Start

### Prerequisites
- **Docker & Docker Compose**
- **Node.js 18+** (for local development)
- **Python 3.11+** (for local development)
- **OpenAI API Key**
- **Tavily API Key** (optional)
- **Firecrawl API Key** (optional)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/eu-green-chatbot.git
cd eu-green-chatbot
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
OPENAI_API_KEY=your_openai_api_key_here

# Optional APIs for enhanced functionality
TAVILY_API_KEY=your_tavily_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here

# Database Configuration
POSTGRES_DB=eu_green_chatbot
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# Application URLs
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### 3. Deploy with Docker

#### Option A: Whisper-Enabled Deployment (Recommended)
```bash
# Deploy with Whisper speech-to-text support (development)
./scripts/deploy-with-whisper.sh development

# Deploy for production with Whisper
./scripts/deploy-with-whisper.sh production
```

#### Option B: Quick Start (Your Preferred Commands)
```bash
# Build and start development environment
docker compose -f docker-compose.dev.yml build
docker compose -f docker-compose.dev.yml up -d

# For production environment  
docker compose build
docker compose up -d
```

#### Option C: Using Build Scripts (Cleaner Output)
```bash
# Development with minimal output
./quick-build.sh

# Production build
./quick-build.sh --prod

# Verbose output for debugging
./quick-build.sh --verbose
```

> **🎙️ Note**: Option A includes automatic Whisper dependency installation, resource allocation optimization, and proper audio processing configuration for speech-to-text functionality.

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

#### Development Environment (docker-compose.dev.yml)
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs
- **pgAdmin**: http://localhost:5050 (admin@example.com / admin123)
- **Redis Commander**: http://localhost:8081

#### Production Environment (docker-compose.yml)
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs

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

## 📁 Project Structure

```
eu-green-chatbot/
├── backend/
│   ├── agents/              # Unified agent system
│   │   ├── unified_chat_agent.py  # Main processing agent
│   │   └── web_research_agent.py  # Web verification support
│   ├── api/                 # FastAPI routes
│   ├── core/                # Configuration and database
│   ├── services/            # Business logic
│   ├── sql/                 # Database initialization
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js app router
│   │   ├── components/      # React components
│   │   └── lib/             # Utilities
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔧 Configuration

### API Keys Setup

1. **OpenAI API Key** (Required)
   - Get from: https://platform.openai.com/api-keys
   - Used for: Language processing, embeddings, agent reasoning

2. **Tavily Search API** (Optional)
   - Get from: https://tavily.com
   - Used for: Real-time web search capabilities

3. **Firecrawl API** (Optional)
   - Get from: https://firecrawl.dev
   - Used for: Advanced web content extraction

### Environment Variables

All configuration is handled through environment variables. See `.env.example` for a complete list.

### Database Configuration

The system uses PostgreSQL with the pgvector extension for storing embeddings and application data. The database schema is automatically created on first run.

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
curl http://localhost:8000/api/health

# Detailed health check
curl http://localhost:8000/api/health/detailed

# Test Whisper speech-to-text endpoint
curl -X POST http://localhost:8000/api/chat/speech-to-text
```

## 🔒 Privacy & Data Management

### Multiple Chat Sessions
- **Topic Organization**: Create separate conversations for different EU policy areas
- **Session Management**: Easy switching between conversations via history menu
- **Persistent Context**: Each session maintains its own conversation context

### Local Data Storage
- **Browser-Only Storage**: All chat history saved in browser localStorage
- **No External Servers**: Conversations never sent to external storage services
- **Privacy First**: Your data stays on your device until you clear browser cache
- **GDPR Compliant**: Complete user control over personal conversation data

### Data Lifecycle
```
User Conversation → Browser localStorage → Cleared with Browser Cache
                  ↑
            No external storage
```

## 🌍 Multilingual Support

The chatbot supports 5 languages:
- **English** (en) - Primary language
- **Italian** (it)
- **Romanian** (ro) 
- **German** (de)
- **French** (fr)

Responses are automatically translated while preserving technical terminology and official EU policy names.

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

### Document Upload
```python
# Upload a document for processing
files = {"file": open("eu_policy.pdf", "rb")}
data = {"language": "en"}

response = requests.post(
    "http://localhost:8000/api/documents/upload", 
    files=files, 
    data=data
)
```

### WebSocket Chat
```javascript
// Real-time chat with WebSocket
const ws = new WebSocket('ws://localhost:8000/api/chat/ws/demo-session');

ws.onmessage = (event) => {
    const response = JSON.parse(event.data);
    console.log('Bot response:', response.response);
};

ws.send('Tell me about CBAM implementation timeline');
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

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

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Unified agent architecture implementation
- ✅ Local Whisper speech-to-text integration
- ✅ PostgreSQL vector database with RAG
- ✅ Web verification and real-time updates
- ✅ Docker containerized deployment

### Phase 2 (Next)
- 🔄 Advanced analytics dashboard
- 🔄 API rate limiting and authentication
- 🔄 Enhanced document processing
- 🔄 Mobile app development

### Phase 3 (Future)
- 📋 Integration with EU official APIs
- 📋 Advanced compliance checking
- 📋 Custom policy alerts
- 📋 White-label solutions

## 🙏 Acknowledgments

- **European Commission** for open access to policy documents
- **LangChain Community** for excellent AI tooling
- **PostgreSQL & pgvector** for high-performance vector database capabilities
- **OpenAI** for powerful language models and Whisper speech recognition
- **Tavily & Firecrawl** for reliable web research and verification
- **All Contributors** who help improve this project

---

**Built with ❤️ for a sustainable future**

For more information, visit our [GitHub repository](https://github.com/your-username/eu-green-chatbot) or check out the [live demo](https://your-demo-url.com).

**Support this project**: [![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-☕-orange)](https://buymeacoffee.com/emmix)