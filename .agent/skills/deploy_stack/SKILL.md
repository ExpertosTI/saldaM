---
name: deploy_stack_app
description: Standard deployment workflow for Docker Stack applications on Windows/Linux environments.
---
# Deployment Skill: Saldana Music (Docker Swarm)

This skill outlines the standard operating procedure for deploying changes to the Saldana Music production environment.

## Context
- **OS**: Windows (Local), Linux (Remote)
- **Host**: `45.9.191.18`
- **Orchestrator**: Docker Swarm
- **Registry**: GitHub Container Registry (ghcr.io)

## Workflow

### 1. Verification & Git Push
Ensure your local changes are committed and pushed. This triggers the GitHub Actions CI/CD pipeline which builds the Docker images.

```powershell
# Check status
git status

# Add and Commit
git add .
git commit -m "chore: your commit message"

# Push to main
git push origin main
```

### 2. Connect to Server
SSH into the production server.

```powershell
ssh root@45.9.191.18
```

### 3. Deploy/Update Services
Once logged in, verify the stack and update the services.

#### Option A: Rolling Update (Recommended)
Use this for code updates where `docker-stack.yml` has not changed.

```bash
# Update API
docker service update --image ghcr.io/expertosti/saldanamusic-api:latest saldana_api --force

# Update Web (Frontend)
docker service update --image ghcr.io/expertosti/saldanamusic-web:latest saldana_web --force
```

#### Option B: Full Stack Redeploy
Use this if you modified `docker-stack.yml` (e.g., added variables, volumes, or ports).

```bash
cd /path/to/saldana-music
git pull
docker stack deploy -c docker-stack.yml saldana --with-registry-auth
```

### Troubleshooting
- **Logs**: `docker service logs -f saldana_api`
- **Status**: `docker service ls` or `docker stack ps saldana`
