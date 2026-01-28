FROM node:20-alpine AS builder
# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN apk add --no-cache libc6-compat

WORKDIR /app
COPY . .

# Install dependencies with pnpm
RUN pnpm install --no-frozen-lockfile
RUN pnpm turbo run build --filter=api

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app .
CMD ["node", "apps/api/dist/main"]
