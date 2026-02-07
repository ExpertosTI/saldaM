$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Deployment of Signature Module..." -ForegroundColor Cyan

# 1. Database Migration
Write-Host "🛠️  Running Database Migration..." -ForegroundColor Yellow
$DBCID = docker ps --filter label=com.docker.swarm.service.name=saldana_db -q | Select-Object -First 1

if (-not $DBCID) {
    Write-Error "❌ Database container not found!"
    exit 1
}

Get-Content signature_migration.sql | docker exec -i $DBCID psql -U postgres -d saldanamusic
Write-Host "✅ Database schema updated." -ForegroundColor Green

# 2. Build Services
Write-Host "🏗️  Building API..." -ForegroundColor Yellow
docker build -t saldana_api:latest -f apps/api/Dockerfile .

Write-Host "🏗️  Building Web..." -ForegroundColor Yellow
docker build -t saldana_web:latest -f apps/web/Dockerfile .

# 3. Update Swarm Services
Write-Host "🔄 Updating Swarm Services..." -ForegroundColor Yellow
docker service update --image saldana_api:latest saldana_api --force
docker service update --image saldana_web:latest saldana_web --force

Write-Host "✅ Deployment Complete! The Signature Module is live." -ForegroundColor Green
