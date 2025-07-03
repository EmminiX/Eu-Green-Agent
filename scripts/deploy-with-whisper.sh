#!/bin/bash

# ==============================================================================
# EU Green Policies Chatbot - Deployment Script with Whisper Support
# ==============================================================================
# This script deploys the application with OpenAI Whisper speech-to-text support
# Ensures proper Docker configuration and resource allocation

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Check if Docker and Docker Compose are installed
check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log "Dependencies check passed ✓"
}

# Check environment variables
check_env() {
    log "Checking environment variables..."
    
    if [ ! -f .env ]; then
        warn ".env file not found. Copying from .env.example..."
        cp .env.example .env
        warn "Please edit .env file with your actual API keys before continuing."
        echo -e "${BLUE}Required environment variables:${NC}"
        echo "  - OPENAI_API_KEY (Required for Whisper and GPT)"
        echo "  - TAVILY_API_KEY (Optional for web search)"
        echo "  - FIRECRAWL_API_KEY (Optional for web scraping)"
        read -p "Press Enter to continue after configuring .env..."
    fi
    
    # Source environment variables
    source .env
    
    if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "your_openai_api_key_here" ]; then
        error "OPENAI_API_KEY is not set in .env file. This is required for Whisper functionality."
        exit 1
    fi
    
    log "Environment variables check passed ✓"
}

# Ensure Docker has sufficient resources
check_docker_resources() {
    log "Checking Docker resources..."
    
    # Check available memory
    AVAILABLE_MEMORY=$(docker system info --format '{{.MemTotal}}' 2>/dev/null || echo 0)
    REQUIRED_MEMORY=2147483648  # 2GB in bytes
    
    if [ "$AVAILABLE_MEMORY" -lt "$REQUIRED_MEMORY" ]; then
        warn "Docker has less than 2GB of memory available. Whisper processing may be slow or fail."
        warn "Consider increasing Docker memory allocation in Docker Desktop settings."
    fi
    
    log "Docker resources check completed ✓"
}

# Build and deploy
deploy() {
    local ENV=${1:-development}
    
    log "Starting deployment for environment: $ENV"
    
    # Determine which compose file to use
    if [ "$ENV" = "production" ]; then
        COMPOSE_FILE="docker-compose.yml"
        log "Using production configuration"
    else
        COMPOSE_FILE="docker-compose.dev.yml"
        log "Using development configuration"
    fi
    
    # Clean up any existing containers
    log "Cleaning up existing containers..."
    docker-compose -f $COMPOSE_FILE down --remove-orphans
    
    # Prune dangling images to free space
    log "Cleaning up Docker images..."
    docker image prune -f
    
    # Build services with no cache to ensure Whisper dependencies are fresh
    log "Building services (this may take a few minutes for Whisper dependencies)..."
    docker-compose -f $COMPOSE_FILE build --no-cache backend
    docker-compose -f $COMPOSE_FILE build frontend
    
    # Start services
    log "Starting services..."
    docker-compose -f $COMPOSE_FILE up -d
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 10
    
    # Check service health
    local MAX_RETRIES=30
    local RETRY_COUNT=0
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if docker-compose -f $COMPOSE_FILE ps | grep -q "healthy"; then
            log "Services are healthy ✓"
            break
        fi
        
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo -n "."
        sleep 5
    done
    
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        error "Services failed to become healthy within expected time"
        docker-compose -f $COMPOSE_FILE logs
        exit 1
    fi
    
    # Test Whisper endpoint
    log "Testing Whisper speech-to-text endpoint..."
    BACKEND_URL="http://localhost:8000"
    
    # Wait a bit more for the backend to fully start
    sleep 5
    
    # Test health endpoint first
    if curl -f "$BACKEND_URL/api/health" > /dev/null 2>&1; then
        log "Backend health check passed ✓"
        
        # Test that the speech-to-text endpoint exists (should return 422 for missing file)
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BACKEND_URL/api/chat/speech-to-text")
        if [ "$HTTP_CODE" = "422" ]; then
            log "Speech-to-text endpoint is available ✓"
        else
            warn "Speech-to-text endpoint test returned unexpected code: $HTTP_CODE"
        fi
    else
        error "Backend health check failed"
        docker-compose -f $COMPOSE_FILE logs backend
        exit 1
    fi
    
    log "Deployment completed successfully! 🚀"
    echo ""
    echo -e "${BLUE}Services are running:${NC}"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API: http://localhost:8000"
    echo "  API Documentation: http://localhost:8000/api/docs"
    
    if [ "$ENV" = "development" ]; then
        echo "  pgAdmin: http://localhost:5050 (admin@example.com / admin123)"
        echo "  Redis Commander: http://localhost:8081"
    fi
    
    echo ""
    echo -e "${GREEN}✨ Whisper speech-to-text is now enabled! ✨${NC}"
    echo ""
    echo "To view logs: docker-compose -f $COMPOSE_FILE logs -f"
    echo "To stop services: docker-compose -f $COMPOSE_FILE down"
}

# Main script
main() {
    log "EU Green Policies Chatbot - Whisper Deployment Script"
    log "=================================================="
    
    # Parse command line arguments
    ENV=${1:-development}
    
    if [ "$ENV" != "development" ] && [ "$ENV" != "production" ]; then
        error "Invalid environment. Use 'development' or 'production'"
        echo "Usage: $0 [development|production]"
        exit 1
    fi
    
    # Run checks
    check_dependencies
    check_env
    check_docker_resources
    
    # Deploy
    deploy $ENV
}

# Run main function with all arguments
main "$@"