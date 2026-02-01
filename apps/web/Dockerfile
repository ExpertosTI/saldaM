FROM node:20-alpine AS builder

# Standardize pnpm installation (sometimes corepack is buggy in Alpine)
RUN npm install -g pnpm@9.0.0
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy everything (protected by .dockerignore)
COPY . .

# Bypass peer dependency strictness which can crash CI
RUN pnpm config set strict-peer-dependencies false
RUN pnpm config set auto-install-peers true

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Build
RUN pnpm turbo run build --filter=web

FROM node:20-alpine AS runner
WORKDIR /app

# Enable pnpm
RUN npm install -g pnpm@9.0.0

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN apk add --no-cache libc6-compat curl

USER nextjs

# Copy only what's needed for standalone
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/messages ./apps/web/messages

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
