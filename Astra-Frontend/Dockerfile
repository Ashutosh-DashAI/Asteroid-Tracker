# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Security: non-root user
RUN addgroup --system asteroid && adduser --system --ingroup asteroid appuser
USER appuser

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 5173

# Serve static files - in production, use nginx instead
CMD ["npx", "serve", "-s", "dist", "-l", "5173"]
