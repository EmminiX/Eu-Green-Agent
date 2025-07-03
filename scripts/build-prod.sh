#!/bin/bash

# EU Green Chatbot - Production Build Script
# This script provides cleaner Docker Compose build output for production

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Building EU Green Chatbot Production Environment${NC}"
echo ""

# Set Docker Buildkit for reduced output
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Function to show progress
show_progress() {
    local service=$1
    echo -e "${YELLOW}📦 Building $service...${NC}"
}

# Function to show completion
show_completion() {
    local service=$1
    echo -e "${GREEN}✅ $service ready${NC}"
}

# Function to handle errors
handle_error() {
    local service=$1
    echo -e "${RED}❌ Failed to build $service${NC}"
    echo -e "${RED}Check the logs above for details${NC}"
    exit 1
}

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ No .env file found. Production build requires API keys.${NC}"
    echo -e "${YELLOW}💡 Copy .env.example to .env and configure your API keys${NC}"
    exit 1
fi

# Validate required environment variables
echo -e "${BLUE}🔍 Validating environment variables...${NC}"
source .env
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${RED}❌ OPENAI_API_KEY is required for production${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Environment validation passed${NC}"

echo -e "${BLUE}🧹 Cleaning up old containers...${NC}"
docker-compose down --remove-orphans >/dev/null 2>&1 || true

echo -e "${BLUE}🏗️  Building services for production...${NC}"

# Build services with minimal output
{
    docker-compose build --parallel --quiet 2>&1 | \
    while IFS= read -r line; do
        if [[ $line == *"Building"* ]]; then
            service=$(echo "$line" | grep -o 'Building [a-zA-Z]*' | cut -d' ' -f2)
            show_progress "$service"
        elif [[ $line == *"Successfully built"* ]] || [[ $line == *"Use 'docker scan'"* ]]; then
            continue
        elif [[ $line == *"ERROR"* ]] || [[ $line == *"Error"* ]]; then
            echo -e "${RED}$line${NC}"
        fi
    done
} || {
    echo -e "${RED}❌ Build failed. Running with verbose output for debugging:${NC}"
    docker-compose build
    exit 1
}

echo ""
echo -e "${BLUE}🚀 Starting production services...${NC}"

# Start services with health checks
docker-compose up -d 2>/dev/null || {
    echo -e "${RED}❌ Failed to start services${NC}"
    exit 1
}

echo ""
echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"

# Wait for health checks
services=("postgres" "redis" "backend" "frontend")
for service in "${services[@]}"; do
    echo -n "   🔄 $service: "
    
    # Wait up to 120 seconds for health check (production builds take longer)
    timeout=120
    while [ $timeout -gt 0 ]; do
        health=$(docker inspect --format='{{.State.Health.Status}}' "eu-green-$service" 2>/dev/null || echo "starting")
        
        if [ "$health" = "healthy" ]; then
            echo -e "${GREEN}healthy${NC}"
            break
        elif [ "$health" = "unhealthy" ]; then
            echo -e "${RED}unhealthy${NC}"
            echo -e "${RED}❌ $service failed health check${NC}"
            exit 1
        fi
        
        sleep 2
        timeout=$((timeout - 2))
        echo -n "."
    done
    
    if [ $timeout -le 0 ]; then
        echo -e "${RED}timeout${NC}"
        echo -e "${RED}❌ $service health check timed out${NC}"
        exit 1
    fi
done

echo ""
echo -e "${GREEN}🎉 Production environment is running successfully!${NC}"
echo ""
echo -e "${BLUE}📍 Service URLs:${NC}"
echo -e "   🌐 Application:  http://localhost:3000"
echo -e "   🔧 Backend API:  http://localhost:8000"
echo ""
echo -e "${YELLOW}💡 To view logs: docker-compose logs -f [service]${NC}"
echo -e "${YELLOW}💡 To stop:      docker-compose down${NC}"
echo -e "${YELLOW}💡 With nginx:   docker-compose --profile production up -d${NC}"
echo ""