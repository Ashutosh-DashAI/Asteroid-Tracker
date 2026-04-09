# Asteroid Tracker Backend - Claude Memory

## Project Overview
**Project**: Asteroid Tracker Backend (formerly "ASTRA")
- **Location**: D:\Astra
- **Stack**: Bun + Express 5 + Prisma 7 + PostgreSQL
- **Purpose**: Backend API for NASA's NeoWs asteroid data

## Naming Standardization
All files use "Asteroid Tracker" (not "ASTRA", "astra"):
- package.json: `"name": "asteroid-tracker"`
- APP_NAME env: "Asteroid Tracker"

## Critical Patterns

### Health Check Response (src/index.ts:75)
```typescript
app.get("/health", async (req, res) => {
  const [dbCheck] = await Promise.allSettled([prisma.$queryRaw`SELECT 1`]);
  res.status(status === 'ok' ? 200 : 503).json({
    status, uptime, responseTimeMs, timestamp, version,
    services: { database: dbCheck.status === 'fulfilled' ? 'healthy' : 'degraded' }
  });
});
```

### Database Connection (src/db.ts)
Uses Prisma with Pg adapter:
```typescript
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
```

### API Response Format
Standard envelope:
```json
{ "success": true, "message": "...", "data": {}, "meta": { "pagination": {...} } }
```

### Environment Variables (src/config/env.ts)
Required:
- DATABASE_URL
- JWT_SECRET (min 32 chars)
- JWT_REFRESH_SECRET (min 32 chars)

Optional:
- NASA_API_KEY (defaults to DEMO_KEY)
- SMTP_* (for email)

## Files Added

### CI/CD
- `.github/workflows/ci.yml` - lint, type-check, test, build

### Docker
- `Dockerfile` - Bun multi-stage build
- `docker-compose.yml` - API + PostgreSQL

### Documentation
- `docs/adr/001-bun-runtime.md` - ADR for Bun
- `docs/adr/002-express-server.md` - ADR for Express
- `docs/adr/003-prisma-orm.md` - ADR for Prisma
- `docs/ARCHITECTURE.md` - System architecture

### Tests
- `src/utils/__tests__/jwt.test.ts` - JWT utils tests
- `src/services/__tests__/nasaService.test.ts` - NASA service tests

## Package Scripts
```bash
bun run dev           # Start dev server (--watch)
bun run start         # Production start
bun run build         # Same as start for Bun
bun run type-check     # bun tsc --noEmit
bun run test          # vitest
bun run test:unit      # vitest run
bun run test:watch     # vitest watch
bun run prisma:generate
bun run prisma:migrate
```

## Route Structure
```
/health - Health check
/api/auth - Register, login, refresh, forgot-password
/api/users - Profiles, follow/unfollow
/api/neo - NASA NEO feed
/api/asteroids - Feed, search, stats, hazardous
/api/saved-asteroids - User favorites
/api/saved-searches - Saved searches
/api/alerts - Alert preferences
/api/watchlist - Watchlist
```

## Key Services
- `src/services/nasaService.ts` - NASA API client
- `src/services/auth.services.ts` - JWT auth logic
- `src/services/asteroid.services.ts` - Asteroid data processing
