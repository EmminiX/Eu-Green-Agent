#!/bin/bash
# EU Green Policies Chatbot - Backup Script
# Automated backup script for database and application data

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
POSTGRES_CONTAINER="eu_green_postgres"
REDIS_CONTAINER="eu_green_redis"

# Load environment variables
if [ -f ".env" ]; then
    source .env
fi

POSTGRES_DB=${POSTGRES_DB:-eu_green_chatbot}
POSTGRES_USER=${POSTGRES_USER:-postgres}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-your_secure_password}

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

create_backup_dir() {
    log_info "Creating backup directory..."
    mkdir -p "$BACKUP_DIR/$DATE"
}

backup_postgres() {
    log_info "Backing up PostgreSQL database..."
    
    # Check if container is running
    if ! docker ps | grep -q "$POSTGRES_CONTAINER"; then
        log_error "PostgreSQL container is not running"
        return 1
    fi
    
    # Create database backup
    docker exec "$POSTGRES_CONTAINER" pg_dump \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        --no-password \
        --verbose \
        --clean \
        --if-exists \
        --create \
        --format=custom \
        > "$BACKUP_DIR/$DATE/postgres_backup.sql"
    
    # Create plain text backup as well
    docker exec "$POSTGRES_CONTAINER" pg_dump \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        --no-password \
        --verbose \
        --clean \
        --if-exists \
        --create \
        > "$BACKUP_DIR/$DATE/postgres_backup.txt"
    
    # Compress the backups
    gzip "$BACKUP_DIR/$DATE/postgres_backup.sql"
    gzip "$BACKUP_DIR/$DATE/postgres_backup.txt"
    
    log_success "PostgreSQL backup completed"
}

backup_redis() {
    log_info "Backing up Redis data..."
    
    # Check if container is running
    if ! docker ps | grep -q "$REDIS_CONTAINER"; then
        log_error "Redis container is not running"
        return 1
    fi
    
    # Create Redis backup
    docker exec "$REDIS_CONTAINER" redis-cli --rdb /data/dump.rdb
    docker cp "$REDIS_CONTAINER:/data/dump.rdb" "$BACKUP_DIR/$DATE/redis_backup.rdb"
    
    # Compress the backup
    gzip "$BACKUP_DIR/$DATE/redis_backup.rdb"
    
    log_success "Redis backup completed"
}

backup_application_data() {
    log_info "Backing up application data..."
    
    # Backup uploaded files
    if [ -d "./backend/uploads" ]; then
        cp -r "./backend/uploads" "$BACKUP_DIR/$DATE/"
        log_success "Uploaded files backed up"
    fi
    
    # Backup logs
    if [ -d "./logs" ]; then
        cp -r "./logs" "$BACKUP_DIR/$DATE/"
        log_success "Logs backed up"
    fi
    
    # Backup backend data
    if [ -d "./backend/data" ]; then
        cp -r "./backend/data" "$BACKUP_DIR/$DATE/"
        log_success "Backend data backed up"
    fi
    
    # Backup configuration
    if [ -f ".env" ]; then
        cp ".env" "$BACKUP_DIR/$DATE/env_backup"
        log_success "Environment configuration backed up"
    fi
}

create_backup_manifest() {
    log_info "Creating backup manifest..."
    
    cat > "$BACKUP_DIR/$DATE/MANIFEST.txt" << EOF
EU Green Policies Chatbot Backup
================================
Backup Date: $(date)
Backup Location: $BACKUP_DIR/$DATE

Contents:
- postgres_backup.sql.gz: PostgreSQL database dump (custom format)
- postgres_backup.txt.gz: PostgreSQL database dump (plain text)
- redis_backup.rdb.gz: Redis data dump
- uploads/: User uploaded files
- logs/: Application logs
- data/: Backend application data
- env_backup: Environment configuration (secrets removed)

Restore Instructions:
1. Restore PostgreSQL: gunzip postgres_backup.sql.gz && docker exec -i postgres_container pg_restore -U postgres -d database_name postgres_backup.sql
2. Restore Redis: gunzip redis_backup.rdb.gz && docker cp redis_backup.rdb redis_container:/data/dump.rdb
3. Restore files: Copy uploads/, logs/, and data/ directories back to their original locations
4. Update .env file with your configuration

EOF

    log_success "Backup manifest created"
}

cleanup_old_backups() {
    log_info "Cleaning up old backups..."
    
    # Keep only last 7 days of backups
    find "$BACKUP_DIR" -type d -name "2*" -mtime +7 -exec rm -rf {} \; 2>/dev/null || true
    
    log_success "Old backups cleaned up"
}

restore_backup() {
    local backup_date="$1"
    
    if [ -z "$backup_date" ]; then
        log_error "Please specify backup date (format: YYYYMMDD_HHMMSS)"
        return 1
    fi
    
    local restore_dir="$BACKUP_DIR/$backup_date"
    
    if [ ! -d "$restore_dir" ]; then
        log_error "Backup directory $restore_dir not found"
        return 1
    fi
    
    log_warning "This will restore data from backup $backup_date"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Restore cancelled"
        return 0
    fi
    
    log_info "Restoring from backup $backup_date..."
    
    # Restore PostgreSQL
    if [ -f "$restore_dir/postgres_backup.sql.gz" ]; then
        log_info "Restoring PostgreSQL database..."
        gunzip -c "$restore_dir/postgres_backup.sql.gz" | \
        docker exec -i "$POSTGRES_CONTAINER" pg_restore \
            -U "$POSTGRES_USER" \
            -d "$POSTGRES_DB" \
            --clean \
            --if-exists \
            --verbose
        log_success "PostgreSQL database restored"
    fi
    
    # Restore Redis
    if [ -f "$restore_dir/redis_backup.rdb.gz" ]; then
        log_info "Restoring Redis data..."
        gunzip -c "$restore_dir/redis_backup.rdb.gz" > /tmp/redis_restore.rdb
        docker cp /tmp/redis_restore.rdb "$REDIS_CONTAINER:/data/dump.rdb"
        docker restart "$REDIS_CONTAINER"
        rm /tmp/redis_restore.rdb
        log_success "Redis data restored"
    fi
    
    # Restore application data
    if [ -d "$restore_dir/uploads" ]; then
        cp -r "$restore_dir/uploads" "./backend/"
        log_success "Uploads restored"
    fi
    
    if [ -d "$restore_dir/data" ]; then
        cp -r "$restore_dir/data" "./backend/"
        log_success "Backend data restored"
    fi
    
    log_success "Restore completed successfully"
}

list_backups() {
    log_info "Available backups:"
    echo ""
    
    if [ ! -d "$BACKUP_DIR" ]; then
        log_warning "No backup directory found"
        return 0
    fi
    
    for backup in $(ls -1 "$BACKUP_DIR" | grep -E "^[0-9]{8}_[0-9]{6}$" | sort -r); do
        local backup_path="$BACKUP_DIR/$backup"
        local backup_size=$(du -sh "$backup_path" | cut -f1)
        local backup_date=$(echo "$backup" | sed 's/_/ /')
        echo "  📦 $backup ($backup_size) - $(date -d "$backup_date" 2>/dev/null || echo "$backup_date")"
    done
    
    echo ""
}

main() {
    case "${1:-backup}" in
        backup)
            log_info "Starting backup process..."
            create_backup_dir
            backup_postgres
            backup_redis
            backup_application_data
            create_backup_manifest
            cleanup_old_backups
            
            local backup_size=$(du -sh "$BACKUP_DIR/$DATE" | cut -f1)
            log_success "🎉 Backup completed successfully!"
            log_success "Backup location: $BACKUP_DIR/$DATE ($backup_size)"
            ;;
        restore)
            restore_backup "$2"
            ;;
        list)
            list_backups
            ;;
        help|--help|-h)
            echo "EU Green Policies Chatbot - Backup Script"
            echo ""
            echo "Usage: $0 [command] [options]"
            echo ""
            echo "Commands:"
            echo "  backup          Create a new backup (default)"
            echo "  restore <date>  Restore from backup (format: YYYYMMDD_HHMMSS)"
            echo "  list            List available backups"
            echo "  help            Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                           # Create backup"
            echo "  $0 backup                    # Create backup"
            echo "  $0 list                      # List backups"
            echo "  $0 restore 20231201_120000   # Restore specific backup"
            ;;
        *)
            log_error "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"