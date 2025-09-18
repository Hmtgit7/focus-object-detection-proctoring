#!/bin/bash

# ProctorAI Deployment Script
# Usage: ./deploy.sh [environment] [action]
# Example: ./deploy.sh production deploy

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
ACTION=${2:-deploy}
PROJECT_NAME="proctoring-system"
DOCKER_COMPOSE_FILE="docker-compose.yml"

if [ "$ENVIRONMENT" = "production" ]; then
    DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
fi

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check requirements
check_requirements() {
    log "Checking system requirements..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if Node.js is installed (for local development)
    if [ "$ENVIRONMENT" = "development" ] && ! command -v node &> /dev/null; then
        warning "Node.js is not installed. Some development features may not work."
    fi
    
    success "All requirements met"
}

# Setup environment
setup_environment() {
    log "Setting up environment for $ENVIRONMENT..."
    
    # Create necessary directories
    mkdir -p backend/uploads/{videos,audio,images,reports}
    mkdir -p backend/logs
    mkdir -p backend/models
    
    # Copy environment files if they don't exist
    if [ ! -f "backend/.env" ]; then
        if [ -f "backend/.env.example" ]; then
            cp backend/.env.example backend/.env
            warning "Created backend/.env from example. Please configure it before deployment."
        else
            error "backend/.env.example not found"
        fi
    fi
    
    if [ ! -f "frontend/.env" ]; then
        if [ -f "frontend/.env.example" ]; then
            cp frontend/.env.example frontend/.env
            warning "Created frontend/.env from example. Please configure it before deployment."
        else
            error "frontend/.env.example not found"
        fi
    fi
    
    success "Environment setup complete"
}

# Build application
build_application() {
    log "Building application for $ENVIRONMENT..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Production build with Docker
        docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache
    else
        # Development build
        log "Building backend..."
        cd backend
        npm install
        cd ..
        
        log "Building frontend..."
        cd frontend
        npm install
        npm run build
        cd ..
    fi
    
    success "Application build complete"
}

# Deploy application
deploy_application() {
    log "Deploying application..."
    
    # Stop existing containers
    docker-compose -f $DOCKER_COMPOSE_FILE down || true
    
    # Start new containers
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
    
    # Wait for services to be ready
    log "Waiting for services to start..."
    sleep 30
    
    # Health check
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        success "Backend service is healthy"
    else
        error "Backend service health check failed"
    fi
    
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        success "Frontend service is healthy"
    else
        error "Frontend service health check failed"
    fi
    
    success "Application deployed successfully"
}

# Backup data
backup_data() {
    log "Creating backup..."
    
    BACKUP_DIR="backups/$(date +'%Y%m%d_%H%M%S')"
    mkdir -p "$BACKUP_DIR"
    
    # Backup MongoDB data
    docker exec proctoring-mongo mongodump --out /tmp/backup
    docker cp proctoring-mongo:/tmp/backup "$BACKUP_DIR/mongodb"
    
    # Backup uploaded files
    cp -r backend/uploads "$BACKUP_DIR/uploads"
    
    success "Backup created at $BACKUP_DIR"
}

# Restore data
restore_data() {
    BACKUP_DIR=${3:-""}
    
    if [ -z "$BACKUP_DIR" ]; then
        error "Please specify backup directory: ./deploy.sh $ENVIRONMENT restore /path/to/backup"
    fi
    
    if [ ! -d "$BACKUP_DIR" ]; then
        error "Backup directory not found: $BACKUP_DIR"
    fi
    
    log "Restoring data from $BACKUP_DIR..."
    
    # Restore MongoDB data
    if [ -d "$BACKUP_DIR/mongodb" ]; then
        docker cp "$BACKUP_DIR/mongodb" proctoring-mongo:/tmp/restore
        docker exec proctoring-mongo mongorestore /tmp/restore
    fi
    
    # Restore uploaded files
    if [ -d "$BACKUP_DIR/uploads" ]; then
        cp -r "$BACKUP_DIR/uploads"/* backend/uploads/
    fi
    
    success "Data restored successfully"
}

# Show logs
show_logs() {
    SERVICE=${3:-""}
    
    if [ -n "$SERVICE" ]; then
        docker-compose -f $DOCKER_COMPOSE_FILE logs -f "$SERVICE"
    else
        docker-compose -f $DOCKER_COMPOSE_FILE logs -f
    fi
}

# Update application
update_application() {
    log "Updating application..."
    
    # Pull latest changes
    git pull origin main
    
    # Backup before update
    backup_data
    
    # Rebuild and deploy
    build_application
    deploy_application
    
    success "Application updated successfully"
}

# Stop application
stop_application() {
    log "Stopping application..."
    docker-compose -f $DOCKER_COMPOSE_FILE down
    success "Application stopped"
}

# Start application
start_application() {
    log "Starting application..."
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
    success "Application started"
}

# Main script
main() {
    log "ProctorAI Deployment Script"
    log "Environment: $ENVIRONMENT"
    log "Action: $ACTION"
    
    case $ACTION in
        "deploy")
            check_requirements
            setup_environment
            build_application
            deploy_application
            ;;
        "build")
            check_requirements
            build_application
            ;;
        "start")
            start_application
            ;;
        "stop")
            stop_application
            ;;
        "restart")
            stop_application
            start_application
            ;;
        "logs")
            show_logs $@
            ;;
        "backup")
            backup_data
            ;;
        "restore")
            restore_data $@
            ;;
        "update")
            update_application
            ;;
        *)
            echo "Usage: $0 [environment] [action]"
            echo ""
            echo "Environments:"
            echo "  development (default)"
            echo "  production"
            echo ""
            echo "Actions:"
            echo "  deploy    - Full deployment (default)"
            echo "  build     - Build application only"
            echo "  start     - Start services"
            echo "  stop      - Stop services"
            echo "  restart   - Restart services"
            echo "  logs      - Show logs [service]"
            echo "  backup    - Create backup"
            echo "  restore   - Restore from backup [backup_path]"
            echo "  update    - Update and redeploy"
            echo ""
            echo "Examples:"
            echo "  $0 development deploy"
            echo "  $0 production start"
            echo "  $0 development logs backend"
            echo "  $0 production backup"
            echo "  $0 production restore backups/20241218_120000"
            exit 1
            ;;
    esac
}

# Run main function
main $@
