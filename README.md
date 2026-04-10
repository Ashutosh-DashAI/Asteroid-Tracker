# Asteroid Tracker — Backend API

> Production-ready REST API for real-time Near-Earth Object tracking

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Bun-1.3+-White?style=flat&logo=bun)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-FBBF09?style=flat)](LICENSE)

---

## What This API Delivers

A robust, production-grade backend that:
- Integrates with NASA's NeoWs API with intelligent caching and rate-limit handling
- Provides user authentication with JWT access + refresh tokens
- Manages saved asteroids, watchlists, and alert preferences
- Powers a real-time analytics dashboard

This isn't a simple proxy. It's a complete API layer with caching, validation, error handling, and comprehensive monitoring.

---

## Why It Works

### Resilient API Integration
- **Cache-aside pattern** — 1-hour TTL reduces NASA API calls by 90%+
- **Exponential backoff** — Automatic retry on rate limits (429/503)
- **Daily buffer management** — Keeps 50 requests in reserve

### Production-Ready
- **Structured logging** — Pino with request IDs for traceability
- **Rate limiting** — 100 req/min/IP, 1000 req/day/user
- **Security headers** — Helmet.js, CORS, input sanitization

### Developer Experience
- **Type-safe** — End-to-end TypeScript with Prisma
- **Validated** — Zod schemas on every input
- **Standardized responses** — `{ success, message, data, meta }`

---

## Quick Start

```bash
# Install dependencies
bun install

# Configure environment
cp .env.example .env
# Set DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, NASA_API_KEY

# Database setup
bun run prisma:generate
bun run prisma:migrate

# Start server
bun run dev
```

Server runs on `http://localhost:3000`

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get JWT tokens |
| POST | `/api/auth/refresh` | Rotate tokens |
| POST | `/api/auth/forgot-password` | Reset request |
| POST | `/api/auth/reset-password` | Execute reset |

### Asteroids (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/asteroids/feed` | NEO feed (7-day window) |
| GET | `/api/asteroids/search` | Search by name/ID |
| GET | `/api/asteroids/stats` | Dashboard aggregates |
| GET | `/api/asteroids/hazardous` | Hazardous only filter |
| GET | `/api/asteroids/:nasaId` | Detail by NASA ID |

### User Data (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/saved-asteroids` | User favorites |
| POST | `/api/saved-asteroids` | Save asteroid |
| DELETE | `/api/saved-asteroids/:nasaId` | Remove |
| GET | `/api/saved-searches` | Saved searches |
| GET/PUT | `/api/alerts/preferences` | Alert settings |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service diagnostics |

---

## Architecture

```
src/
├── controllers/     # Request handlers (12 endpoints)
├── services/        # Business logic + NASA API client
├── routes/          # Express route definitions
├── middleware/     # Auth, validation, rate limiting
├── validators/     # Zod schemas
├── utils/          # JWT, hashing, logging
└── config/         # Environment, Socket.IO
```

---

## Environment Variables

```env
# Required
DATABASE_URL=postgresql://user:pass@localhost:5432/asteroid_tracker
JWT_SECRET=your-32-char-minimum-secret
JWT_REFRESH_SECRET=another-32-char-minimum-secret
NASA_API_KEY=your-nasa-api-key

# Optional
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

---

## Testing & Quality

```bash
# Run tests
bun run test

# Type check
bun run type-check

# Watch mode
bun run test:watch
```

---

## Deployment

### Docker
```bash
docker-compose up -d
```

### Manual
```bash
bun run build
NODE_ENV=production bun run src/index.ts
```

---

## License

MIT - see [LICENSE](LICENSE) for details.

---

**Built by Ashutosh Dash** — [GitHub](https://github.com/Ashutosh-DashAI)
