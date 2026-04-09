# Build stage
FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run prisma generate

# Production stage
FROM oven/bun:1-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Security: non-root user
RUN addgroup --system asteroid && adduser --system --ingroup asteroid appuser
USER appuser

COPY --from=builder /app .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["bun", "run", "src/index.ts"]
