# Asteroid Tracker Backend

> Production-ready API for real-time Near-Earth Object tracking

A robust backend service that interfaces with NASA's NeoWs API, providing asteroid data, user management, real-time notifications, and community features.

## Tech Stack

| Component | Technology |
|-----------|-------------|
| Runtime | Bun 1.3+ |
| Framework | Express 5 |
| Database | PostgreSQL 16 via Prisma 7 |
| Auth | JWT + bcrypt |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit |
| Logging | Pino |

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

## Architecture

```
src/
├── controllers/     # Request handlers (12 endpoints)
├── services/        # Business logic + NASA API client
├── routes/          # Express route definitions
├── middleware/      # Auth, validation, rate limiting
├── validators/     # Zod schemas
├── utils/          # JWT, hashing, logging
└── config/         # Environment, Socket.IO
```

## Key Features

### NASA Integration
- **Intelligent Caching** — 1-hour TTL with cache-aside pattern
- **Rate Limit Handling** — Exponential backoff with 50-request daily buffer
- **Retry Logic** — 3 retries on 429/503 with configurable backoff

### API Design
- **Standard Response Envelope** — `{ success, message, data, meta }`
- **Cursor Pagination** — All list endpoints
- **Comprehensive Validation** — Zod schemas on every input

### Security
- JWT access tokens (15min) + refresh tokens (7 days)
- Helmet.js security headers
- Rate limiting: 100 req/min/IP, 1000 req/day/user
- Bcrypt password hashing

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

## Testing

```bash
# Unit tests
bun run test

# Type check
bun run type-check

# Watch mode
bun run test:watch
```

## Deployment

```bash
# Docker
docker-compose up -d

# Manual
bun run build
NODE_ENV=production bun run src/index.ts
```

## License

MIT
