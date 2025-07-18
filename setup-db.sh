#!/bin/bash

# PostgreSQL Database Setup Script for Identity Reconciliation

echo "Setting up PostgreSQL database for Identity Reconciliation..."

# Default PostgreSQL configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-password}
DB_NAME=${DB_NAME:-identity_reconciliation}

echo "Creating database: $DB_NAME"
PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || echo "Database may already exist"

echo "Creating tables from schema.sql..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f schema.sql

echo "Database setup complete!"
echo ""
echo "You can now start the server with: npm run dev"
echo "Make sure your .env file has the correct database credentials."
