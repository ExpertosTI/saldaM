FROM node:18-alpine AS builder

WORKDIR /app
COPY . .
# Using npm strictly as per project setup
RUN npm install
RUN npm run build --filter=api

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app .
CMD ["node", "apps/api/dist/main"]
