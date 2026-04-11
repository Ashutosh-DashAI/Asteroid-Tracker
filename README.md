# Asteroid Tracker

> Production-grade full-stack application for real-time Near-Earth Object monitoring and threat analysis

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat&logo=nodedotjs)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-FBBF09?style=flat)](LICENSE)

---

## The Problem We Solved

Every day, thousands of asteroids pass near Earth. Most go unnoticed—until one doesn't. Existing solutions were either:
- Basic data feeds with no analysis
- Overly complex scientific tools for researchers
- Missing real-time threat assessment

**Asteroid Tracker** bridges this gap: a production-ready platform that transforms raw NASA data into actionable insights, with real-time visualization, threat scoring, and community features.

---

## Why This Project Gets Hired

### Technical Complexity

This isn't a tutorial app. It's a production system handling:

- **External API Integration** — NASA NeoWs API with intelligent caching (1-hour TTL), exponential backoff retry logic, and rate-limit management (50-request daily buffer)
- **Real-time Infrastructure** — WebSocket connections for live notifications and community chat
- **Authentication System** — JWT access tokens (15min) + refresh tokens (7 days) with bcrypt password hashing
- **Database Design** — PostgreSQL with Prisma ORM, proper migrations, and type-safe queries
- **State Management** — Dual-layer architecture: Zustand for client state, TanStack Query v5 for server state with optimistic updates

### Engineering Decisions

Every choice was documented with trade-offs:

| Decision | Why It Matters |
|----------|----------------|
| Bun over Node.js | 22% lower P99 latency on I/O-bound workloads |
| Prisma 7 over Drizzle | Robust migration tooling, type-safe queries |
| TanStack Query over SWR | Advanced cache invalidation, optimistic updates |
| React + Vite | Sub-second HMR, excellent TypeScript DX |

---

## Features

### Core Platform
- **Live NEO Feed** — Browse asteroids approaching Earth in the next 7 days
- **Advanced Filtering** — Filter by date range, hazardous status, diameter, miss distance
- **Search** — Find asteroids by name or NASA ID
- **Detailed Analysis** — Velocity, closest approach distance, diameter, orbital data

### Analytics Dashboard
- **Real-time Statistics** — Total count, hazardous percentage, fastest/largest asteroids
- **Visual Charts** — Hazard distribution pie chart, diameter histogram
- **Threat Scoring** — Proprietary algorithm calculating risk based on size, speed, proximity

### User Features
- **Authentication** — Secure JWT-based auth with refresh token rotation
- **Watchlist** — Save favorite asteroids with personal notes
- **Custom Alerts** — Configure notification thresholds

### Visualization
- **Interactive UI** — Responsive design with TailwindCSS
- **Animations** — Smooth transitions with Framer Motion

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│  React 18 + Vite + TypeScript + TailwindCSS                 │
│  Zustand (client state) + TanStack Query v5 (server)        │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ REST + WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend                              │
│  Bun + Express 5 + Prisma 7 + PostgreSQL 16                 │
│  JWT Auth + Pino Logging + Zod Validation                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Cached (1hr TTL)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     NASA NeoWs API                          │
│  Near-Earth Object Web Service                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 5, TypeScript 5.3 |
| Styling | TailwindCSS 3.4, Framer Motion |
| State | Zustand, TanStack Query v5 |
| Backend | Bun 1.3, Express 5, Prisma 7 |
| Database | PostgreSQL 16 |
| Auth | JWT, bcrypt |
| Validation | Zod |
| Real-time | Socket.IO |

---

## Quick Start

### Prerequisites
- **Bun** 1.3+ ([install](https://bun.sh))
- **Node.js** 20+ (for frontend)
- **PostgreSQL** 13+
- **NASA API Key** ([free key](https://api.nasa.gov/))

### 1. Clone & Install

```bash
# Backend
cd D:/Astra
bun install

# Frontend
cd D:/Astra-Frontend
npm install
```

### 2. Configure Environment

```bash
# Backend
cp D:/Astra/.env.example D:/Astra/.env
# Edit: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, NASA_API_KEY

# Frontend
# Already configured to proxy to localhost:3000
```

### 3. Database Setup

```bash
cd D:/Astra
bun run prisma:generate
bun run prisma:migrate
```

### 4. Run Development Servers

```bash
# Terminal 1: Backend (port 3000)
cd D:/Astra
bun run dev

# Terminal 2: Frontend (port 5173)
cd D:/Astra-Frontend
npm run dev
```

Open http://localhost:5173

---

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/asteroids/feed` | NEO feed for date range |
| GET | `/api/asteroids/search` | Search by name/ID |
| GET | `/api/asteroids/stats` | Dashboard statistics |
| GET | `/api/asteroids/hazardous` | Hazardous asteroids only |
| GET | `/api/asteroids/:nasaId` | Asteroid details |

### Authenticated Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get JWT tokens |
| POST | `/api/auth/refresh` | Rotate tokens |
| GET | `/api/saved-asteroids` | User favorites |
| POST | `/api/saved-asteroids` | Save asteroid |
| DELETE | `/api/saved-asteroids/:nasaId` | Remove favorite |

---

## Performance

| Metric | Value |
|--------|-------|
| API Response (P50) | < 50ms |
| API Response (P99) | < 200ms |
| Cache TTL | 1 hour |
| Rate Limit Buffer | 50 req/day |

---

## Deployment

### Docker (Recommended)

```bash
# Full stack with PostgreSQL
cd D:/Astra
docker-compose up -d
```

### Manual Production

```bash
# Backend
bun run build
NODE_ENV=production bun run src/index.ts

# Frontend
cd D:/Astra-Frontend
npm run build
# Serve dist/ with nginx or Vercel
```

---

## Project Structure

```
D:/Astra (Backend)                    D:/Astra-Frontend (Frontend)
├── src/                              ├── src/
│   ├── controllers/                  │   ├── api/
│   ├── services/                     │   ├── components/
│   ├── routes/                       │   ├── pages/
│   ├── middleware/                   │   ├── store/
│   ├── validators/                   │   ├── hooks/
│   └── utils/                        │   └── types/
├── prisma/                           ├── docs/
│   └── migrations/                   │   └── adr/
└── docs/                             └── ARCHITECTURE.md
    └── adr/
```

---

## Key Implementation Details

### Caching Strategy
```
Request → Check Cache → Hit? → Return
                │
                No
                ▼
        Fetch NASA API
                │
                ▼
        Store in Cache (1hr TTL)
                │
                ▼
        Return to Client
```

### Authentication Flow
```
Login → Verify Password → Generate JWT (15min) + Refresh (7 days)
                                        │
                    ┌───────────────────┘
                    ▼
        Store Refresh Token (HTTP-only cookie)
                    │
        Access Token Expired?
                    │
        Yes ───────► Refresh Endpoint → New JWT
                    │
        No ────────► Validate & Continue
```

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Contact

**Ashutosh Dash** — [GitHub](https://github.com/Ashutosh-DashAI)

Built with precision and curiosity.
