FROM node:18-alpine AS builder

WORKDIR /app
COPY . .
# Using npm strictly
RUN npm install
# ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build --filter=web

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
CMD ["npm", "start", "--prefix", "apps/web"]
