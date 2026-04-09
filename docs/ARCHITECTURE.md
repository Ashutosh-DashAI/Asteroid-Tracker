# Asteroid Tracker - Architecture

## System Overview

Asteroid Tracker is a full-stack application for tracking Near-Earth Objects (NEOs) using NASA's NeoWs API.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend       │────▶│   Backend       │────▶│   NASA API       │
│   React + Vite   │     │   Bun + Express  │     │   NeoWs          │
│   Port 5173      │     │   Port 3000      │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   PostgreSQL    │
                        │   Prisma ORM    │
                        └─────────────────┘
```

## Tech Stack

### Backend (D:\Astra)
- **Runtime**: Bun 1.x
- **Server**: Express 5.x
- **Database**: PostgreSQL 13+ via Prisma 7
- **Auth**: JWT + bcrypt
- **Validation**: Zod
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Pino

### Frontend (D:\Astra-Frontend)
- **Framework**: React 18 + Vite 5
- **Language**: TypeScript 5
- **State**: Zustand (client) + TanStack Query (server)
- **Styling**: TailwindCSS
- **Animation**: Framer Motion
- **Charts**: Recharts

## Project Structure

### Backend
```
src/
├── controllers/     # Request handlers
├── routes/         # Express route definitions
├── services/       # Business logic (NASA API, auth, etc.)
├── middleware/      # Auth, error, rate limit, validation
├── validators/      # Zod schemas
├── types/          # TypeScript types
├── utils/          # Helpers (jwt, hash, logger)
├── config/         # Environment, socket config
└── db.ts           # Prisma client
```

### Frontend
```
src/
├── api/            # Axios API clients
├── components/     # React components
│   ├── charts/     # Recharts wrappers
│   ├── filters/    # Filter components
│   ├── layout/     # AppLayout, MainLayout
│   └── ui/         # Reusable UI (Card, Button, etc.)
├── pages/          # Route pages
├── store/          # Zustand stores
├── hooks/          # Custom hooks
├── context/        # React context (toast)
└── types/          # TypeScript types
```

## Data Flow

### NASA NEO Feed
```
User Request → Frontend → /api/asteroids/feed → NASA NeoWs API
                 ↑                                      │
                 └──────────── Cache (1hr TTL) ←────────┘
```

### Authentication
```
User Login → /api/auth/login → JWT Access (15m) + Refresh (7d)
                                   ↓
                           Stored in HttpOnly cookies
```

## API Endpoints

### Public
- `GET /api/asteroids/feed` - NEO feed for date range
- `GET /api/asteroids/search` - Search by name/ID
- `GET /api/asteroids/stats` - Dashboard statistics
- `GET /api/asteroids/hazardous` - Hazardous only
- `GET /api/neo/feed` - Alternative NEO feed

### Authenticated
- `POST /api/auth/*` - Auth routes
- `GET/POST/DELETE /api/saved-asteroids` - User favorites
- `GET/POST/DELETE /api/saved-searches` - Saved searches
- `GET/PUT /api/alerts/preferences` - Alert settings

## Cache Strategy

| Data Type | TTL | Invalidation |
|-----------|-----|--------------|
| NEO Feed (7-day) | 1 hour | TTL expiry |
| Single Asteroid | 24 hours | User update |
| Dashboard Stats | 30 min | TTL expiry |
| Hazardous List | 2 hours | Admin flush |

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Server Error

### Response Format
```json
{
  "success": true,
  "message": "Operation completed",
  "data": {},
  "meta": {
    "pagination": {...}
  }
}
```

## Security

- JWT tokens with 15min access / 7day refresh
- Passwords hashed with bcrypt
- Rate limiting: 100 req/min/IP, 1000 req/day/user
- Helmet + CORS configured
- Zod validation on all inputs

## Deployment

### Docker
Both backend and frontend have Dockerfiles and docker-compose.yml.

```bash
# Backend
cd D:\Astra
docker-compose up -d

# Full stack (from D:\)
docker-compose -f docker-compose.yml up -d
```

### Environment Variables
See `.env.example` in each project for required variables.
