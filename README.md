# EU Green Policies Chatbot

An AI-powered chatbot system for querying and understanding EU Green Deal policies and climate-related regulations.

## Architecture

This project implements a microservices architecture with the following components:

- **Frontend**: Next.js web application
- **API Gateway**: Central routing and authentication layer
- **AI Services**: Python-based services for NLP and RAG functionality
- **Redis**: Caching and session management
- **Qdrant**: Vector database for document embeddings
- **Nginx**: Reverse proxy and load balancer

## Branching Strategy

This project follows Git Flow branching model:

### Main Branches
- `main`: Production-ready code. All releases are tagged from this branch.
- `develop`: Integration branch for features. Contains the latest delivered development changes.

### Supporting Branches
- `feature/`: New features (branch from `develop`, merge back to `develop`)
  - Example: `feature/user-authentication`, `feature/document-processing`
- `release/`: Prepare new production releases (branch from `develop`, merge to both `main` and `develop`)
  - Example: `release/1.0.0`, `release/1.1.0`
- `hotfix/`: Quick fixes for production issues (branch from `main`, merge to both `main` and `develop`)
  - Example: `hotfix/critical-security-fix`

### Branch Naming Convention
- Feature branches: `feature/short-description`
- Release branches: `release/version-number`
- Hotfix branches: `hotfix/short-description`
- Use kebab-case for branch names

### Workflow
1. New features are developed in `feature/` branches off `develop`
2. When features are complete, they are merged back to `develop`
3. When ready for release, create a `release/` branch from `develop`
4. After testing, merge `release/` branch to both `main` and `develop`
5. Tag the release on `main`
6. For urgent fixes, create `hotfix/` branches from `main`

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your environment variables
3. Run `docker-compose up` to start all services
4. Access the application at `http://localhost:3000`

## Development

See individual service directories for specific development instructions:
- `frontend/` - Next.js frontend application
- `api-gateway/` - API Gateway service
- `ai-services/` - AI and NLP services
