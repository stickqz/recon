#!/bin/bash

# MySQL Database Setup Script for Identity Reconciliation

echo "Setting up MySQL database for Identity Reconciliation..."

# Default MySQL configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-password}
DB_NAME=${DB_NAME:-identity_reconciliation}

echo "Creating database: $DB_NAME"
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"

echo "Creating tables from schema.sql..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME < schema.sql

echo "Database setup complete!"
echo ""
echo "You can now start the server with: npm run dev"
echo "Make sure your .env file has the correct database credentials."
