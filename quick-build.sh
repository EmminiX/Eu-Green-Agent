#!/bin/bash

# EU Green Chatbot - Quick Build Script
# Uses standard Docker Compose commands with optimized output

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
COMPOSE_FILE="docker-compose.dev.yml"
QUIET_BUILD=true

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --prod|--production)
            COMPOSE_FILE="docker-compose.yml"
            shift
            ;;
        --verbose|-v)
            QUIET_BUILD=false
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "OPTIONS:"
            echo "  --prod, --production    Use production configuration"
            echo "  --verbose, -v          Show verbose build output"
            echo "  --help, -h             Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                     Build and run development environment"
            echo "  $0 --prod              Build and run production environment"
            echo "  $0 --verbose           Build with full Docker output"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Set Docker Buildkit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

echo -e "${BLUE}🚀 Building EU Green Chatbot$([ "$COMPOSE_FILE" = "docker-compose.yml" ] && echo " (Production)" || echo " (Development)")${NC}"
echo ""

# Build command
BUILD_CMD="docker compose -f $COMPOSE_FILE build"
UP_CMD="docker compose -f $COMPOSE_FILE up -d"

if [ "$QUIET_BUILD" = true ]; then
    echo -e "${YELLOW}📦 Running: $BUILD_CMD --quiet${NC}"
    $BUILD_CMD --quiet 2>&1 | {
        while IFS= read -r line; do
            # Only show important messages
            if [[ $line == *"ERROR"* ]] || [[ $line == *"Error"* ]] || [[ $line == *"FAILED"* ]]; then
                echo -e "${RED}$line${NC}"
            elif [[ $line == *"WARNING"* ]] || [[ $line == *"Warning"* ]]; then
                echo -e "${YELLOW}$line${NC}"
            elif [[ $line == *"Successfully built"* ]]; then
                echo -e "${GREEN}✅ Build completed${NC}"
            fi
        done
    }
else
    echo -e "${YELLOW}📦 Running: $BUILD_CMD${NC}"
    $BUILD_CMD
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
    echo ""
    echo -e "${YELLOW}🚀 Running: $UP_CMD${NC}"
    
    $UP_CMD
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}🎉 Services started successfully!${NC}"
        echo ""
        
        # Show service URLs
        if [ "$COMPOSE_FILE" = "docker-compose.dev.yml" ]; then
            echo -e "${BLUE}📍 Development URLs:${NC}"
            echo -e "   🌐 Frontend:        http://localhost:3000"
            echo -e "   🔧 Backend API:     http://localhost:8000"
            echo -e "   📊 pgAdmin:         http://localhost:5050"
            echo -e "   🔍 Redis Commander: http://localhost:8081"
        else
            echo -e "${BLUE}📍 Production URLs:${NC}"
            echo -e "   🌐 Application:     http://localhost:3000"
            echo -e "   🔧 Backend API:     http://localhost:8000"
        fi
        
        echo ""
        echo -e "${YELLOW}💡 Useful commands:${NC}"
        echo -e "   View logs:    docker compose -f $COMPOSE_FILE logs -f [service]"
        echo -e "   Stop:         docker compose -f $COMPOSE_FILE down"
        echo -e "   Restart:      docker compose -f $COMPOSE_FILE restart [service]"
        echo ""
    else
        echo -e "${RED}❌ Failed to start services${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Build failed${NC}"
    echo -e "${YELLOW}💡 Try running with --verbose for more details${NC}"
    exit 1
fi