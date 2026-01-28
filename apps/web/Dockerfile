FROM node:20-alpine AS builder
# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN apk add --no-cache libc6-compat

WORKDIR /app
COPY . .

# Install dependencies with pnpm
RUN pnpm install --no-frozen-lockfile
RUN pnpm turbo run build --filter=web

FROM node:20-alpine AS runner
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN apk add --no-cache libc6-compat curl

USER nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

# server.js is created by next build from the standalone output
CMD ["node", "apps/web/server.js"]
