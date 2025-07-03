#!/bin/bash

# EU Green Chatbot - Development Build Script
# This script provides cleaner Docker Compose build output

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Building EU Green Chatbot Development Environment${NC}"
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
    echo -e "${YELLOW}⚠️  No .env file found. Using defaults.${NC}"
    echo -e "${BLUE}💡 Copy .env.example to .env and configure your API keys for full functionality${NC}"
    echo ""
fi

echo -e "${BLUE}🧹 Cleaning up old containers...${NC}"
docker-compose -f docker-compose.dev.yml down --remove-orphans >/dev/null 2>&1 || true

echo -e "${BLUE}🏗️  Building services...${NC}"

# Build services with minimal output
{
    docker-compose -f docker-compose.dev.yml build --parallel --quiet 2>&1 | \
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
    docker-compose -f docker-compose.dev.yml build
    exit 1
}

echo ""
echo -e "${BLUE}🚀 Starting services...${NC}"

# Start services with health checks
docker-compose -f docker-compose.dev.yml up -d 2>/dev/null || {
    echo -e "${RED}❌ Failed to start services${NC}"
    exit 1
}

echo ""
echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"

# Wait for health checks
services=("postgres" "redis" "backend")
for service in "${services[@]}"; do
    echo -n "   🔄 $service: "
    
    # Wait up to 60 seconds for health check
    timeout=60
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
        
        sleep 1
        timeout=$((timeout - 1))
        echo -n "."
    done
    
    if [ $timeout -eq 0 ]; then
        echo -e "${RED}timeout${NC}"
        echo -e "${RED}❌ $service health check timed out${NC}"
        exit 1
    fi
done

echo ""
echo -e "${GREEN}🎉 All services are running successfully!${NC}"
echo ""
echo -e "${BLUE}📍 Service URLs:${NC}"
echo -e "   🌐 Frontend:        http://localhost:3000"
echo -e "   🔧 Backend API:     http://localhost:8000"
echo -e "   📊 pgAdmin:         http://localhost:5050 (admin@example.com / admin123)"
echo -e "   🔍 Redis Commander: http://localhost:8081"
echo ""
echo -e "${YELLOW}💡 To view logs: docker-compose -f docker-compose.dev.yml logs -f [service]${NC}"
echo -e "${YELLOW}💡 To stop:      docker-compose -f docker-compose.dev.yml down${NC}"
echo ""