$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Hotfix Deployment for Saldana Music..." -ForegroundColor Cyan

# 1. Fix Database Schema (Add inviteToken column)
Write-Host "`n🛠️ Fixing Database Schema..." -ForegroundColor Yellow
try {
    $dbContainer = docker ps -q -f "label=com.docker.swarm.service.name=saldana_db" | Select-Object -First 1
    if ($dbContainer) {
        Write-Host "Found DB Container: $dbContainer"
        docker exec -e PGPASSWORD='JustDtBase2027@' $dbContainer psql -U postgres -d saldanamusic -c "ALTER TABLE split_sheet ADD COLUMN IF NOT EXISTS \"inviteToken\" VARCHAR;"
        Write-Host "✅ Database schema updated successfully." -ForegroundColor Green
    } else {
        Write-Warning "⚠️ DB Container not found. Is the stack running?"
    }
} catch {
    Write-Error "Failed to update database schema: $_"
}

# 2. Build API Image Locally
Write-Host "`n🏗️ Building API Image (Hotfix)..." -ForegroundColor Yellow
docker build -f apps/api/Dockerfile -t saldana_api:hotfix .
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Image built: saldana_api:hotfix" -ForegroundColor Green
} else {
    Write-Error "❌ Build failed."
    exit 1
}

# 3. Update Service to use Hotfix Image
Write-Host "`n🔄 Updating Service 'saldana_api'..." -ForegroundColor Yellow
docker service update --image saldana_api:hotfix --force saldana_api

Write-Host "`n✅ DEPLOYMENT COMPLETE! The service should leverage the new code shortly." -ForegroundColor Green
Write-Host "Please refresh the dashboard in a few moments." -ForegroundColor Cyan
