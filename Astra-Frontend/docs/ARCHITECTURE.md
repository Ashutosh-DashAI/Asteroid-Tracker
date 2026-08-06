# Asteroid Tracker Frontend - Architecture

## Overview

React SPA for browsing NASA asteroid data with real-time updates, 3D visualization, and user features.

## Tech Stack

- **Framework**: React 18 + Vite 5
- **Language**: TypeScript 5 (strict mode)
- **Styling**: TailwindCSS 3.4
- **State**: Zustand (client) + TanStack Query v5 (server)
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Routing**: React Router DOM 6
- **HTTP**: Axios

## Key Patterns

### Data Fetching (TanStack Query)
```typescript
const { data, isLoading, isError } = useQuery({
  queryKey: ['asteroids', page],
  queryFn: () => api.getAsteroids({ page }),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Store Pattern (Zustand)
```typescript
const useAsteroidsStore = create(persist(
  (set, get) => ({
    asteroids: [],
    favorites: [],
    // Actions...
  }),
  { name: 'asteroids-store' }
));
```

### API Response Handling
Always handle potentially undefined data:
```typescript
const asteroids = response.data || response.asteroids || [];
const total = pagination?.total || 0;
```

### favoriteIds Array Guard
Zustand persist may store `favoriteIds` as `null` on first load:
```typescript
const isFavorite = (id: string) => {
  const favoriteIds = get().favoriteIds;
  return Array.isArray(favoriteIds) && favoriteIds.includes(id);
};
```

## Pages

| Page | Component | Route |
|------|-----------|-------|
| Login | LoginPage | /login |
| Signup | SignupPage | /signup |
| Dashboard | DashboardPage | /dashboard |
| NEO Feed | NEOFeed | /feed |
| Watchlist | Watchlist | /watchlist |
| Alerts | Alerts | /alerts |
| Orbit Viewer | OrbitViewer | /orbit |
| Community | Community | /community |
| Asteroid Detail | AsteroidDetail | /asteroid/:id |

## Component Hierarchy

```
AppLayout
├── StarfieldBackground
├── Sidebar (fixed)
│   └── Navigation links
├── Header
│   ├── DataTicker
│   └── NotificationBell
└── Outlet
    ├── /dashboard → DashboardPage
    ├── /feed → NEOFeed
    └── ...
```

## API Proxies

Vite proxies `/api` and `/socket.io` to `http://localhost:3000`.

## Design System

### Colors
```css
--space-black: #0a0a0f
--neon-cyan: #00d4ff
--neon-purple: #7c3aed
--hazard-red: #ef4444
--safe-green: #22c55e
```

### Typography
- Headings: Orbitron (sci-fi feel)
- Body: Inter
- Code: JetBrains Mono

## Common Fixes Applied

1. **favoriteIds.includes error**: Fixed with `Array.isArray()` guard in store
2. **Scroll issue**: AppLayout uses flex-col with overflow-auto on content
3. **Chart 100% hazardous bug**: Ensure safe = total - hazardous in chart data
