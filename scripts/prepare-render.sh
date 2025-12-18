#!/bin/bash
# Script to prepare the project for Render deployment
# This switches from SQLite to PostgreSQL schema

echo "Preparing for Render deployment..."

# Backup original schema
cp prisma/schema.prisma prisma/schema.sqlite.prisma.backup

# Copy PostgreSQL schema
cp prisma/schema.postgresql.prisma prisma/schema.prisma

echo "✅ Schema updated for PostgreSQL"
echo "⚠️  Remember to set DATABASE_URL to your PostgreSQL connection string in Render"
echo "⚠️  After deployment, run: npx prisma db seed"

