FROM node:20-alpine AS builder

# Standardize pnpm installation
RUN npm install -g pnpm@9.0.0
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy entire project
COPY . .

# Bypass peer dependency strictness
RUN pnpm config set strict-peer-dependencies false
RUN pnpm config set auto-install-peers true

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Build
RUN pnpm turbo run build --filter=api

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app .
CMD ["node", "apps/api/dist/main"]
