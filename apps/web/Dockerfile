FROM node:18-alpine AS builder
# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN apk add --no-cache libc6-compat

WORKDIR /app
COPY . .

# Install dependencies with pnpm
RUN pnpm install --no-frozen-lockfile
RUN pnpm turbo run build --filter=web

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
CMD ["pnpm", "--filter", "web", "start"]
