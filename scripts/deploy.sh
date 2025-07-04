#!/bin/bash
# EU Green Policies Chatbot - Deployment Script
# Automated deployment script for Docker Compose

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="eu-green-chatbot"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking system requirements..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    
    log_success "System requirements check passed"
}

check_environment() {
    log_info "Checking environment configuration..."
    
    if [ ! -f "$ENV_FILE" ]; then
        log_warning ".env file not found. Creating from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_warning "Please edit .env file with your configuration before running again."
            log_warning "At minimum, set your OPENAI_API_KEY and update passwords."
            exit 1
        else
            log_error ".env.example file not found. Cannot create .env file."
            exit 1
        fi
    fi
    
    # Check for required environment variables
    source .env
    
    if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "your_openai_api_key_here" ]; then
        log_error "OPENAI_API_KEY is not set in .env file"
        exit 1
    fi
    
    if [ "$POSTGRES_PASSWORD" = "your_secure_password" ]; then
        log_warning "Using default PostgreSQL password. Please change it in .env file."
    fi
    
    if [ "$REDIS_PASSWORD" = "your_redis_password" ]; then
        log_warning "Using default Redis password. Please change it in .env file."
    fi
    
    log_success "Environment configuration check passed"
}

setup_directories() {
    log_info "Setting up required directories..."
    
    # Create necessary directories
    mkdir -p logs
    mkdir -p data
    mkdir -p backups
    mkdir -p nginx/logs
    mkdir -p nginx/ssl
    mkdir -p backend/uploads
    mkdir -p backend/logs
    mkdir -p backend/data
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/provisioning
    
    # Set permissions
    chmod 755 logs data backups
    chmod 755 nginx/logs
    chmod 755 backend/uploads backend/logs backend/data
    
    log_success "Directories setup completed"
}

generate_ssl_certificates() {
    log_info "Checking SSL certificates..."
    
    if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
        log_info "Generating self-signed SSL certificates..."
        
        # Create local SSL certificates for development
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=EU/ST=Europe/L=Brussels/O=EU Green Policies/OU=Chatbot/CN=localhost" \
            2>/dev/null
        
        chmod 600 nginx/ssl/key.pem
        chmod 644 nginx/ssl/cert.pem
        
        log_success "SSL certificates generated"
    else
        log_success "SSL certificates already exist"
    fi
}

build_and_deploy() {
    log_info "Building and deploying services..."
    
    # Pull latest images
    log_info "Pulling base images..."
    docker-compose pull postgres redis
    
    # Build custom images
    log_info "Building application images..."
    docker-compose build --no-cache
    
    # Start services
    log_info "Starting services..."
    docker-compose up -d
    
    log_success "Services deployed successfully"
}

wait_for_services() {
    log_info "Waiting for services to be healthy..."
    
    # Wait for PostgreSQL
    log_info "Waiting for PostgreSQL..."
    for i in {1..30}; do
        if docker-compose exec -T postgres pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-eu_green_chatbot} &>/dev/null; then
            break
        fi
        if [ $i -eq 30 ]; then
            log_error "PostgreSQL failed to start"
            exit 1
        fi
        sleep 2
    done
    log_success "PostgreSQL is ready"
    
    # Wait for Redis
    log_info "Waiting for Redis..."
    for i in {1..30}; do
        if docker-compose exec -T redis redis-cli ping &>/dev/null; then
            break
        fi
        if [ $i -eq 30 ]; then
            log_error "Redis failed to start"
            exit 1
        fi
        sleep 2
    done
    log_success "Redis is ready"
    
    # Wait for Backend
    log_info "Waiting for Backend API..."
    for i in {1..60}; do
        if curl -f http://localhost:${BACKEND_PORT:-8000}/health &>/dev/null; then
            break
        fi
        if [ $i -eq 60 ]; then
            log_error "Backend failed to start"
            exit 1
        fi
        sleep 3
    done
    log_success "Backend API is ready"
    
    # Wait for Frontend
    log_info "Waiting for Frontend..."
    for i in {1..60}; do
        if curl -f http://localhost:${FRONTEND_PORT:-3000} &>/dev/null; then
            break
        fi
        if [ $i -eq 60 ]; then
            log_error "Frontend failed to start"
            exit 1
        fi
        sleep 3
    done
    log_success "Frontend is ready"
}

show_status() {
    log_info "Deployment Status:"
    echo ""
    docker-compose ps
    echo ""
    
    log_success "🎉 EU Green Policies Chatbot deployed successfully!"
    echo ""
    echo "Services available at:"
    echo "  🌐 Frontend:     http://localhost:${FRONTEND_PORT:-3000}"
    echo "  🔧 Backend API:  http://localhost:${BACKEND_PORT:-8000}"
    echo "  📊 API Docs:     http://localhost:${BACKEND_PORT:-8000}/docs"
    echo "  🔒 HTTPS:        https://localhost (if using nginx profile)"
    echo ""
    echo "Optional monitoring (use --profile monitoring):"
    echo "  📊 Grafana:      http://localhost:${GRAFANA_PORT:-3001}"
    echo "  📈 Prometheus:   http://localhost:${PROMETHEUS_PORT:-9090}"
    echo ""
    echo "Logs: docker-compose logs -f"
    echo "Stop: docker-compose down"
}

run_health_checks() {
    log_info "Running health checks..."
    
    # Backend health check
    if curl -f http://localhost:${BACKEND_PORT:-8000}/health &>/dev/null; then
        log_success "✅ Backend health check passed"
    else
        log_error "❌ Backend health check failed"
    fi
    
    # Frontend health check
    if curl -f http://localhost:${FRONTEND_PORT:-3000} &>/dev/null; then
        log_success "✅ Frontend health check passed"
    else
        log_error "❌ Frontend health check failed"
    fi
    
    # Database health check
    if docker-compose exec -T postgres pg_isready -U ${POSTGRES_USER:-postgres} &>/dev/null; then
        log_success "✅ PostgreSQL health check passed"
    else
        log_error "❌ PostgreSQL health check failed"
    fi
    
    # Redis health check
    if docker-compose exec -T redis redis-cli ping &>/dev/null; then
        log_success "✅ Redis health check passed"
    else
        log_error "❌ Redis health check failed"
    fi
}

# Main deployment function
main() {
    echo "=============================================="
    echo "🌱 EU Green Policies Chatbot Deployment"
    echo "=============================================="
    echo ""
    
    # Parse command line arguments
    PROFILES=""
    UPDATE_ONLY=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --profile)
                PROFILES="$PROFILES --profile $2"
                shift 2
                ;;
            --update)
                UPDATE_ONLY=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [options]"
                echo ""
                echo "Options:"
                echo "  --profile <profile>  Enable Docker Compose profile (monitoring, backup, production)"
                echo "  --update            Update existing deployment"
                echo "  --help              Show this help message"
                echo ""
                echo "Examples:"
                echo "  $0                                    # Basic deployment"
                echo "  $0 --profile monitoring              # With monitoring stack"
                echo "  $0 --profile production              # Production deployment with nginx"
                echo "  $0 --profile monitoring --profile backup  # Multiple profiles"
                echo "  $0 --update                          # Update existing deployment"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # Check requirements
    check_requirements
    check_environment
    
    if [ "$UPDATE_ONLY" = false ]; then
        setup_directories
        generate_ssl_certificates
    fi
    
    # Deploy services
    if [ -n "$PROFILES" ]; then
        log_info "Deploying with profiles:$PROFILES"
        docker-compose $PROFILES up -d --build
    else
        build_and_deploy
    fi
    
    # Wait for services and run checks
    wait_for_services
    run_health_checks
    show_status
}

# Trap errors and cleanup
trap 'log_error "Deployment failed. Check logs with: docker-compose logs"' ERR

# Run main function
main "$@"