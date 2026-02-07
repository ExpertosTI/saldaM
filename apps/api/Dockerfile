FROM node:20-alpine AS builder

# Standardize pnpm installation
RUN npm install -g pnpm@9.0.0
RUN apk add --no-cache libc6-compat imagemagick librsvg

WORKDIR /app

# Copy entire project
COPY . .

# Copy logo (SignatureService now accepts larger files)
RUN mkdir -p /app/assets && \
    if [ -f apps/web/public/logo.png ]; then \
        cp apps/web/public/logo.png /app/assets/logo.png; \
    fi

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
