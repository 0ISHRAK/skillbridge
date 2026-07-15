#!/bin/bash

# Skillbridge Database Backup Script
# Target: SQLite local dev.db

# Resolve directories relative to project root
PROJECT_ROOT=$(pwd)
DB_PATH="$PROJECT_ROOT/dev.db"
BACKUP_DIR="$PROJECT_ROOT/backups"

# Verification of SQLite DB file on disk
if [ ! -f "$DB_PATH" ]; then
    echo "⚠️ Error: Database file not found at $DB_PATH"
    exit 1
fi

# Create backups folder if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp string
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.db"

# Perform backup by copying database file
cp "$DB_PATH" "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ SQLite Database backup created successfully!"
    echo "Location: $BACKUP_FILE"
else
    echo "❌ Error: Failed to copy database file"
    exit 1
fi
