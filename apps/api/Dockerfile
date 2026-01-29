FROM node:20-alpine AS builder
# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 1. Copy only package definitions first to cache dependencies
COPY package.json pnpm-lock.yaml turbo.json pnpm-workspace.yaml ./
# We need to copy the workspace package.jsons too if they are referenced, 
# but for a simple turborepo, often copying the root files + app specific might be needed or just copy all package.jsons.
# To be safe and simple for Turbo in Docker:
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/mobile/package.json ./apps/mobile/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json

# 2. Install dependencies
RUN pnpm install --no-frozen-lockfile

# 3. Copy source code (this changes frequently, so it's after install)
COPY . .

# 4. Build
RUN pnpm turbo run build --filter=api

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app .
CMD ["node", "apps/api/dist/main"]
