#!/bin/bash

echo "🚀 Starting Deployment of Signature Module..."

# 1. Update Code (Assuming git pull is done manually or here)
# git pull origin main

# 2. Run Database Migration
echo "🛠️  Running Database Migration..."
DBCID=$(docker ps --filter label=com.docker.swarm.service.name=saldana_db -q | head -n1)
if [ -z "$DBCID" ]; then
  echo "❌ Database container not found!"
  exit 1
fi

# Copy SQL file to container (optional) or run directly
cat signature_migration.sql | docker exec -i "$DBCID" psql -U postgres -d saldanamusic
echo "✅ Database schema updated."

# 3. Build & Update Services
echo "🏗️  Building API..."
docker build -t saldana_api:latest -f apps/api/Dockerfile .

echo "🏗️  Building Web..."
docker build -t saldana_web:latest -f apps/web/Dockerfile .

echo "🔄 Updating Swarm Services..."
docker service update --image saldana_api:latest saldana_api --force
docker service update --image saldana_web:latest saldana_web --force

echo "✅ Deployment Complete! The Signature Module is live."
