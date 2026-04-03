
# NASA Asteroid Tracker Backend

A **production-ready** backend for tracking Near-Earth Objects (NEOs) using NASA's NeoWs API. Built with **Bun**, **Express**, **TypeScript**, **Prisma**, and **PostgreSQL**.

---

## 🚀 Features

### Asteroid Tracking
- **Real-time NEO Data**: Fetch asteroid data from NASA's NeoWs API
- **Advanced Search**: Search asteroids by name or ID
- **Hazardous Filtering**: Filter and identify potentially hazardous asteroids
- **Close Approach Data**: Detailed information about upcoming asteroid approaches
- **Caching**: Automatic caching of NASA API responses (1 hour default)
- **Rate Limit Protection**: Built-in retry logic with exponential backoff

### User Features
- **Authentication**: JWT-based signup, login, and refresh tokens
- **User Profiles**: Personalized user accounts with email verification
- **Saved Asteroids**: Users can save and organize asteroids
- **Saved Searches**: Store frequently used search parameters
- **Alert Preferences**: Customize asteroid alert thresholds and filters

### Dashboard
- **Statistics**: Aggregate statistics on asteroids in date range
- **Largest Asteroids**: Track the biggest asteroids
- **Nearest Approaches**: Monitor the closest asteroid passes
- **Fastest Objects**: Identify the fastest known asteroids

### Security & Reliability
- **JWT Authentication**: Secure token-based access control
- **Rate Limiting**: Protect API from abuse
- **Input Validation**: Zod schemas for all endpoints
- **Error Handling**: Comprehensive error responses
- **CORS**: Configurable cross-origin resource sharing

---

## 📚 Tech Stack

- **Runtime**: [Bun](https://bun.sh/) v1.3+
- **Server**: Express v5
- **Language**: TypeScript  (strict mode)
- **Database**: PostgreSQL
- **ORM**: Prisma v7
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Pino
- **HTTP Client**: Native Fetch API

---

## 🛠️ Getting Started

### Prerequisites
- **Bun** v1.3+
- **PostgreSQL** 13+
- **NASA API Key** (free from https://api.nasa.gov/)

### 1. Clone & Install Dependencies

```bash
git clone <repository>
cd astra
bun install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your configuration:

```bash
cp .env.example .env
```

Key environment variables:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/astra_db
JWT_SECRET=your-super-secret-key
NASA_API_KEY=your-nasa-api-key
PORT=3000
```

### 3. Setup Database

Create migrations and generate Prisma client:

```bash
bun run prisma:generate
bun run prisma:migrate
```

### 4. Start Development Server

```bash
bun run dev
```

Server runs on `http://localhost:3000`

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset

### Asteroids (Public)
- `GET /api/asteroids/feed` - Get asteroids for date range
- `GET /api/asteroids/search` - Search asteroids by name
- `GET /api/asteroids/stats` - Get dashboard statistics
- `GET /api/asteroids/hazardous` - Get only hazardous asteroids
- `GET /api/asteroids/:nasaId` - Get asteroid details

### Saved Asteroids (Authenticated)
- `GET /api/saved-asteroids` - Get user's saved asteroids
- `POST /api/saved-asteroids` - Save an asteroid
- `DELETE /api/saved-asteroids/:id` - Remove saved asteroid

### Saved Searches (Authenticated)
- `GET /api/saved-searches` - Get user's saved searches
- `POST /api/saved-searches` - Save a search
- `DELETE /api/saved-searches/:id` - Delete saved search

### Alert Preferences (Authenticated)
- `GET /api/alerts/preferences` - Get alert settings
- `POST /api/alerts/preferences` - Update alert preferences

---

## 📋 Request/Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed",
  "data": {},
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

---

## 🔐 Authentication

All endpoints except public asteroid endpoints require a Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://localhost:3000/api/saved-asteroids
```

---

## 🗄️ Database Schema

### Core Models

**User**
- UUID primary key
- Email and password authentication
- JWT tokens
- Role-based access (USER, ADMIN)

**Asteroid**
- NASA ID (unique)
- Physical properties (diameter, hazard status)
- Orbital data

**CloseApproach**
- Approach date
- Velocity, miss distance
- Orbiting body

**SavedAsteroid**
- User-specific saved asteroids
- Track customized data snapshots

**SavedSearch**
- Store search parameters
- Date ranges and filters

**AlertPreference**
- User alert thresholds
- Email notification settings

**AsteroidCache**
- NASA API response caching
- Expires after configurable duration

---

## 🧪 Testing

### Get Asteroids for Date Range
```bash
curl "http://localhost:3000/api/asteroids/feed?startDate=2024-02-01&endDate=2024-02-07"
```

### Search Asteroids
```bash
curl "http://localhost:3000/api/asteroids/search?q=Apophis"
```

### Get Dashboard Stats
```bash
curl "http://localhost:3000/api/asteroids/stats?days=7"
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

---

## 🚨 Error Handling

The API returns standard HTTP status codes:

- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limited
- `500 Internal Server Error` - Unexpected error

---

## 📖 Development

### Project Structure

```
src/
├── controllers/     # Request handlers
├── routes/         # Express route definitions
├── services/       # Business logic
├── middleware/     # Express middleware
├── validators/     # Zod validation schemas
├── types/          # TypeScript types
├── utils/          # Helper functions
├── config/         # Configuration
└── db.ts           # Prisma client
```

### Key Services

- **nasa.service.ts**: NASA API integration with retry logic
- **asteroid.services.ts**: Asteroid data processing
- **auth.services.ts**: User authentication
- **jwt.ts**: JWT token generation/verification

### Adding New Endpoints

1. Add Zod schema in `validators/`
2. Create service method in `services/`
3. Create controller in `controllers/`
4. Add route in `routes/`
5. Update Prisma schema if needed

---

## 🚀 Deployment

### Production Build

```bash
bun run build
NODE_ENV=production bun run src/index.ts
```

### Environment Checklist

- [ ] Update `JWT_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ORIGIN` for your frontend domain
- [ ] Set secure database URL
- [ ] Enable HTTPS (use reverse proxy like Nginx)
- [ ] Configure rate limiting appropriately
- [ ] Set up logging/monitoring

---

## 📞 Support

For API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

For Postman collection, import [ASTRA_Postman_Collection.json](./ASTRA_Postman_Collection.json)

---

## 📄 License

MIT

---

## 🤝 Contributing

We welcome contributions! Please follow the existing code style and ensure all tests pass before submitting a PR.

---

**Built with ❤️ for tracking Near-Earth Objects**
```

### 3. Database Setup

Run Prisma migrations and generate the client:

```bash
bun run prisma:migrate
bun run prisma:generate
```

### 4. Start the Server

```bash
bun run dev
# or
bun run start
```

Server runs on `http://localhost:3000` by default.

---

##  Project Structure

```
src/
	controllers/   # Route handlers (auth, user, chat, admin, etc)
	services/       # Business logic (auth, user, chat, notification, etc)
	routes/         # Express route definitions
	middleware/     # Auth, error, validation, rate limit, etc
	validators/     # Zod schemas for input validation
	utils/          # Helpers (hash, jwt, asyncHandler, etc)
	config/         # Env, socket, etc
	db.ts           # Prisma client setup
	index.ts        # App entry point
prisma/
	schema.prisma  # Database schema
	migrations/     # Prisma migrations
```

---

##  Security & Best Practices

- All sensitive config via `.env`
- Passwords hashed with bcrypt
- JWT secrets required for auth
- Helmet, CORS, and rate limiting enabled
- Zod validation for all endpoints

---

##  Key Endpoints

- `POST /api/auth/signup` — Register new user
- `POST /api/auth/login` — Login and get tokens
- `POST /api/auth/refresh` — Refresh JWT
- `POST /api/auth/forgot-password` — Request password reset
- `POST /api/auth/reset-password` — Reset password
- `GET /api/users/:id` — Get user profile
- `POST /api/users/:id/follow` — Follow user
- `POST /api/users/:id/unfollow` — Unfollow user
- `GET /api/chat/:conversationId/messages` — Get chat messages
- `POST /api/chat/:conversationId/message` — Send message
- `GET /api/notifications` — List notifications
- `POST /api/bookmarks/:messageId` — Bookmark a message
- `GET /api/admin/users` — Admin: list users

...and many more! See routes/ and controllers/ for the full API.

---

##  Prisma Schema Highlights

- **User**: Auth, profile, status, relations
- **RefreshToken**: JWT refresh tokens
- **Follow**: User follow relationships
- **Conversation/Message**: Real-time chat
- **Notification**: System/user notifications
- **Bookmark**: Saved messages

---

##  Contributing

PRs and issues welcome! Please open an issue for bugs or feature requests.

---

## © 2026 Ashutosh DashAI — ASTRA Backend
