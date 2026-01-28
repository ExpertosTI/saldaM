FROM node:18-alpine AS builder

WORKDIR /app
COPY . .
# Using npm strictly as per project setup
RUN npm install
# Explicitly use turbo via npx to ensure arguments work
RUN npx turbo run build --filter=api

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app .
CMD ["node", "apps/api/dist/main"]
