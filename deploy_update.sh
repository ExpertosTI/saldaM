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

# Execute SQL patches safely
set -e
echo "➡️  Applying security_update_migration.sql ..."
cat security_update_migration.sql | docker exec -i "$DBCID" psql -U postgres -d saldanamusic
echo "➡️  Ensuring audit_log schema ..."
cat fix_audit_log_schema.sql | docker exec -i "$DBCID" psql -U postgres -d saldanamusic
echo "➡️  Ensuring contacts schema ..."
cat fix_contacts_schema.sql | docker exec -i "$DBCID" psql -U postgres -d saldanamusic
echo "➡️  Applying social contacts migration ..."
cat fix_social_contacts.sql | docker exec -i "$DBCID" psql -U postgres -d saldanamusic
echo "➡️  Applying updatedAt fix ..."
cat fix_contact_updatedat.sql | docker exec -i "$DBCID" psql -U postgres -d saldanamusic
echo "✅ Database schema updated."

# 3. Build & Update Services
echo "🏗️  Building API..."
docker build -t saldana_api:latest -f apps/api/Dockerfile .

echo "🏗️  Building Web..."
docker build -t saldana_web:latest -f apps/web/Dockerfile .

echo "🔄 Deploying Stack (with secrets)..."
# Use stack deploy to ensure secrets are properly mounted
docker stack deploy -c docker-stack.yml saldana --with-registry-auth 2>/dev/null || \
docker stack deploy -c docker-stack.yml saldana

# Force service update to pick up new images
docker service update --image saldana_api:latest saldana_api --force
docker service update --image saldana_web:latest saldana_web --force

echo "✅ Deployment Complete! Services are live."
