# ASTRA Backend - Quick Reference Guide

## Setup (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL and NASA API key

# 3. Setup database
npm run prisma:migrate
npm run prisma:generate

# 4. Start server
npm run dev
```

## Key Files

| File | Purpose |
|------|---------|
| `src/services/nasa.service.ts` | Fetch data from NASA NeoWs API |
| `src/services/riskAnalysis.service.ts` | Calculate risk scores (0-100) |
| `src/services/asteroid.services.ts` | Database operations for asteroids |
| `src/controllers/asteroid.controller.ts` | API endpoint handlers |
| `src/routes/asteroid.routes.ts` | Route definitions |
| `prisma/schema.prisma` | Database schema (Asteroid, WatchedAsteroid, AsteroidAlert) |

## API Endpoints at a Glance

### Discovery (Public)
- `GET /api/asteroids/feed` - NASA feed for date range
- `GET /api/asteroids/nearby` - Close approaches (next 30 days)
- `GET /api/asteroids/search` - Search by name
- `GET /api/asteroids/hazardous/ranking` - Top hazardous objects

### Details (Public)
- `GET /api/asteroids/{neoId}` - Asteroid details
- `GET /api/asteroids/{neoId}/risk-analysis` - Risk score & analysis

### Watchlist (Auth Required)
- `POST /api/asteroids/{id}/watch` - Add to watchlist
- `DELETE /api/asteroids/{id}/watch` - Remove from watchlist
- `GET /api/asteroids/watchlist` - Get user's list

### Alerts (Auth Required)
- `GET /api/asteroids/alerts` - Get alerts
- `PATCH /api/asteroids/alerts/{id}/read` - Mark as read
- `POST /api/asteroids/{id}/create-alert` - Create alert

## Risk Score Breakdown

| Factor | Weight | Range |
|--------|--------|-------|
| Miss Distance | 35% | 0-25 pts (closer = higher) |
| Diameter | 25% | 0-25 pts (larger = higher) |
| Velocity | 25% | 0-25 pts (faster = higher) |
| Hazard Status | 15% | 0-25 pts (flagged = higher) |

**Final Score:** 0-100
- 75+: CRITICAL ⚠️
- 50-74: HIGH 🔴
- 25-49: MEDIUM 🟡
- 0-24: LOW 🟢

## Environment Variables

```bash
NASA_API_KEY=DEMO_KEY                    # Get from https://api.nasa.gov/
NASA_API_CACHE_DURATION=3600000          # Cache time in ms (1 hour default)
DATABASE_URL=postgresql://...            # PostgreSQL connection
JWT_SECRET=your-secret-key               # JWT signing key
CORS_ORIGIN=http://localhost:3000        # CORS allowed origin
```

## Database Models

### Asteroid
- `neoId` - NASA reference ID (unique)
- `name, diameter, velocity, missDistance`
- `isPotentiallyHazardous`, `closeApproachDate`

### WatchedAsteroid
- Links users to asteroids with alert level
- `alertLevel`: LOW, MEDIUM, HIGH, CRITICAL

### AsteroidAlert
- `alertType`: CLOSE_APPROACH, HAZARD_WARNING, NEW_DISCOVERY, ORBITAL_UPDATE
- `severity`: LOW, MEDIUM, HIGH, CRITICAL
- Can be user-specific or system-wide (userId nullable)

## Testing

### In Postman
1. Import `ASTRA_Postman_Collection.json`
2. Login to get JWT token (auto-saved)
3. All requests use the token automatically

### Via cURL
```bash
# Get feed
curl "http://localhost:3000/api/asteroids/feed?startDate=2026-04-01&endDate=2026-04-07"

# Get risk analysis
curl "http://localhost:3000/api/asteroids/2099942/risk-analysis"

# With authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:3000/api/asteroids/watchlist"
```

## Common Issues

### "NASA API Error"
- Check `NASA_API_KEY` in `.env`
- Verify date format (YYYY-MM-DD)
- API limits: Use DEMO_KEY for testing

### "Database connection failed"
- Verify `DATABASE_URL` is correct
- PostgreSQL service running?
- Run `npm run prisma:migrate`

### "Unauthorized (401)"
- Include Bearer token in Authorization header
- Login first to get access token

## Performance Tips

1. **Caching:** NASA responses cached 1 hour
2. **Pagination:** Use `limit` parameter to reduce data
3. **Filtering:** Use `hazardousOnly` to reduce results
4. **Indexing:** Database indexed on frequent query fields

## Monitoring

```bash
# Check server health
curl http://localhost:3000/health

# Monitor in development
npm run dev  # Watches for file changes

# View database
npm run prisma:studio  # Opens Prisma UI at localhost:5555
```

## Next Steps

- [ ] Configure NASA API key
- [ ] Setup PostgreSQL database
- [ ] Run migrations
- [ ] Test endpoints with Postman
- [ ] Integrate with frontend
- [ ] Add Docker support
- [ ] Deploy to production

## Useful Commands

```bash
npm run dev              # Start dev server with hot reload
npm run start            # Start production server
npm run prisma:migrate   # Create/run migrations
npm run prisma:studio    # Open database UI
npm run prisma:generate  # Regenerate Prisma client
```

## Documentation

- **API_DOCUMENTATION.md** - Full endpoint reference
- **IMPLEMENTATION.md** - Architecture & setup details
- **ASTRA_Postman_Collection.json** - Ready-to-use API collection

## Support

Check API_DOCUMENTATION.md for:
- Detailed endpoint descriptions
- Request/response examples
- Error codes and solutions
- Data model schemas

---

**Backend Ready for Production** ✅
