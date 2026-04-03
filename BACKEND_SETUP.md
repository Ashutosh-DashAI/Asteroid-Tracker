# NASA Asteroid Tracker - Backend Setup Guide

This guide will help you set up and run the production-ready NASA Asteroid Tracker backend.

---

## 🛠️ Prerequisites

- **Bun** v1.3+ ([Download](https://bun.sh))
- **PostgreSQL** 13+ ([Download](https://www.postgresql.org/download/))
- **NASA API Key** (free from [https://api.nasa.gov/](https://api.nasa.gov/))

---

## 📦 Installation

### 1. Install Dependencies

```bash
bun install
```

### 2. Generate Prisma Client

```bash
bun run prisma:generate
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/astra_db

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
CLIENT_URL=http://localhost:5173

# NASA API (Required)
# Get free key at: https://api.nasa.gov/
NASA_API_KEY=your-nasa-api-key
NASA_NEOWS_API_URL=https://api.nasa.gov/neo/rest/v1
NASA_API_CACHE_DURATION=3600000
SYNC_INTERVAL_HOURS=6

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Initialize Database

```bash
# Create migration
bun run prisma:migrate

# Optional: View database with Prisma Studio
bun run prisma:studio
```

---

## 🚀 Running the Backend

### Development Mode

```bash
bun run dev
```

Server will start on `http://localhost:3000`

### Production Mode

```bash
bun run start
```

---

## 🧪 Testing the Backend

### Health Check
```bash
curl http://localhost:3000/health
```

### Test Asteroid Feed
```bash
curl "http://localhost:3000/api/asteroids/feed?startDate=2024-02-01&endDate=2024-02-07"
```

### Test Dashboard Stats
```bash
curl "http://localhost:3000/api/asteroids/stats?days=7"
```

---

## 📝 API Endpoints

### Public Endpoints (No Authentication)
- `GET /api/asteroids/feed` - Asteroids for date range
- `GET /api/asteroids/search` - Search asteroids
- `GET /api/asteroids/:nasaId` - Asteroid details
- `GET /api/asteroids/hazardous` - Hazardous asteroids
- `GET /api/asteroids/stats` - Dashboard statistics

### Authentication Endpoints
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token

### Authenticated User Endpoints
- `GET /api/saved-asteroids` - List saved asteroids
- `POST /api/saved-asteroids` - Save asteroid
- `DELETE /api/saved-asteroids/:id` - Remove saved

- `GET /api/saved-searches` - List saved searches
- `POST /api/saved-searches` - Save search
- `DELETE /api/saved-searches/:id` - Remove search

- `GET /api/alerts/preferences` - Get alert settings
- `POST /api/alerts/preferences` - Update alerts

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 🗄️ Database Schema

Key tables:
- **User** - User accounts with authentication
- **Asteroid** - Asteroid data from NASA
- **CloseApproach** - Upcoming asteroid approaches
- **SavedAsteroid** - User-saved asteroids
- **SavedSearch** - User-saved searches
- **AlertPreference** - User alert settings
- **Notification** - User notifications

View schema: `prisma/schema.prisma`

---

## 🔧 Development

### Environment Details

- **Runtime**: Bun (fast JavaScript runtime)
- **Server**: Express v5
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Validation**: Zod schemas
- **Logging**: Pino

### Project Structure

```
src/
├── controllers/     # Request handlers
├── routes/         # Express routes
├── services/       # Business logic
├── middleware/     # Express middleware
├── validators/     # Zod validation schemas
├── types/          # TypeScript types
├── utils/          # Helper functions
├── config/         # Configuration
└── db.ts          # Prisma client
```

### Adding New Endpoints

1. **Define Schema** (`src/validators/*.schema.ts`)
   ```typescript
   export const newEndpointSchema = z.object({
     field: z.string().min(1)
   });
   ```

2. **Create Service** (`src/services/*.services.ts`)
   ```typescript
   export const newService = {
     async doSomething(data: any) {
       // Business logic
     }
   };
   ```

3. **Create Controller** (`src/controllers/*.controller.ts`)
   ```typescript
   export const newController = {
     action: asyncHandler(async (req, res) => {
       // Handle request
     })
   };
   ```

4. **Add Route** (`src/routes/*.routes.ts`)
   ```typescript
   router.post('/endpoint', 
     validate('body', newEndpointSchema),
     newController.action
   );
   ```

---

## ⚠️ Common Issues

### "Cannot find module" errors
```bash
bun run prisma:generate
```

### Database connection fails
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists: `createdb astra_db`

### NASA API errors
- Verify NASA_API_KEY is set in .env
- Check API key at https://api.nasa.gov/
- API rate limits: 1000 requests/hour

### Port already in use
```bash
# Change PORT in .env or
lsof -i :3000  # Find process
kill -9 <PID>  # Kill process
```

---

## 📊 Monitoring

### Check NASA API Status
The service includes rate limit detection and retry logic (exponential backoff).

### Monitor Logs
With NODE_ENV=development, logs show:
- API requests
- Cache hits/misses
- Database queries
- Errors with stack traces

---

## 🚀 Deployment

### Production Checklist

- [ ] Update `JWT_SECRET` (generate strong random key)
- [ ] Update `JWT_REFRESH_SECRET`
- [ ] Set `NODE_ENV=production`
- [ ] Update `CORS_ORIGIN` to production domain
- [ ] Update `CLIENT_URL` to production frontend
- [ ] Use external PostgreSQL database
- [ ] Set `NASA_API_KEY` for production
- [ ] Enable HTTPS
- [ ] Set up logging/monitoring
- [ ] Configure rate limits appropriately
- [ ] Add database backups
- [ ] Implement CI/CD

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:complex_password@prod_db_host.com:5432/astra_prod
JWT_SECRET=<generate-with-crypto-randomBytes>
JWT_REFRESH_SECRET=<generate-with-crypto-randomBytes>
CORS_ORIGIN=https://yourfrontend.com
NASA_API_KEY=<production-key>
```

---

## 🆘 Support & Documentation

- API Reference: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Postman Collection: [ASTRA_Postman_Collection.json](./ASTRA_Postman_Collection.json)
- Prisma Docs: https://www.prisma.io/docs/
- Bun Docs: https://bun.sh/docs
- Express Docs: https://expressjs.com/

---

## 📄 License

MIT

---

**For questions or issues, please check the documentation or open an issue in the repository.**

# CORS
CORS_ORIGIN=http://localhost:5173

# App
APP_URL=http://localhost:3000
APP_NAME=ASTRA

# Email (optional, for password reset)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
SMTP_FROM=noreply@astra.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🗄️ Database Setup

### 1. Create PostgreSQL Database

```bash
createdb astra
```

### 2. Run Migrations

```bash
bun run prisma:migrate
```

### 3. Generate Prisma Client

```bash
bun run prisma:generate
```

### 4. View Database (optional)

```bash
bun run prisma:studio
```

## 🏃 Running the Backend

### Development Mode
```bash
bun run dev
```

The server will start on **http://localhost:3000**

### Production Mode
```bash
bun run start
```

## 🔗 API Endpoints

### Authentication Routes (`POST /api/auth/*`)

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/auth/signup` | POST | ❌ | Register new user |
| `/auth/login` | POST | ❌ | Login user |
| `/auth/refresh-token` | POST | ❌ | Refresh access token |
| `/auth/logout` | POST | ✅ | Logout user (revoke tokens) |
| `/auth/me` | GET | ✅ | Get current user info |
| `/auth/forgot-password` | POST | ❌ | Request password reset |
| `/auth/reset-password` | POST | ❌ | Reset password with token |
| `/auth/change-password` | POST | ✅ | Change password (logged in) |

### Users Routes (`/api/users/*`)

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/users` | GET | ✅ | Get all users (with pagination) |
| `/users/:id` | GET | ✅ | Get user profile |
| `/users/:id/update` | PUT | ✅ | Update user profile |
| `/users/:id/follow` | POST | ✅ | Follow user |
| `/users/:id/unfollow` | POST | ✅ | Unfollow user |
| `/users/:id/followers` | GET | ✅ | Get user followers |

### Chat Routes (`/api/chat/*`)

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/chat/conversations` | GET | ✅ | Get all conversations |
| `/chat/conversations` | POST | ✅ | Create new conversation |
| `/chat/:conversationId/messages` | GET | ✅ | Get messages in conversation |
| `/chat/send` | POST | ✅ | Send message |
| `/chat/:conversationId/read` | POST | ✅ | Mark conversation as read |

### Notifications Routes (`/api/notifications/*`)

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/notifications` | GET | ✅ | Get user notifications |
| `/notifications/:id/read` | POST | ✅ | Mark notification as read |
| `/notifications/:id` | DELETE | ✅ | Delete notification |

### Bookmarks Routes (`/api/bookmarks/*`)

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/bookmarks` | GET | ✅ | Get user bookmarks |
| `/bookmarks` | POST | ✅ | Add bookmark |
| `/bookmarks/:messageId` | DELETE | ✅ | Remove bookmark |

## 📦 Request/Response Formats

### Signup Request
```json
POST /api/auth/signup
{
  "name": "John Doe",
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

### Signup Response (201)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "name": "John Doe",
      "username": "john_doe",
      "role": "USER",
      "avatar": null,
      "bio": null,
      "isVerified": false
    },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### Login Request
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "Password123"
}
```

### Login Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "name": "John Doe",
      "username": "john_doe",
      "role": "USER",
      "avatar": null,
      "bio": null,
      "isVerified": false
    },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### Get Conversations Request
```json
GET /api/chat/conversations?limit=20&offset=0

Headers:
Authorization: Bearer {jwt_access_token}
```

### Get Conversations Response (200)
```json
{
  "success": true,
  "message": "Conversations fetched",
  "data": {
    "conversationCount": 5,
    "conversations": [
      {
        "id": "uuid",
        "participantOneId": "uuid",
        "participantTwoId": "uuid",
        "participant": {
          "id": "uuid",
          "name": "Jane Doe",
          "username": "jane_doe",
          "email": "jane@example.com",
          "avatar": null
        },
        "lastMessage": {
          "id": "uuid",
          "content": "Hello!",
          "senderId": "uuid",
          "timestamp": "2026-04-01T10:00:00Z",
          "isRead": false
        },
        "unreadCount": 2
      }
    ]
  }
}
```

### Send Message Request
```json
POST /api/chat/send

{
  "conversationId": "uuid",
  "receiverId": "uuid",
  "content": "Hello there!"
}

Headers:
Authorization: Bearer {jwt_access_token}
```

### Send Message Response (201)
```json
{
  "success": true,
  "message": "Message sent",
  "data": {
    "id": "uuid",
    "senderId": "uuid",
    "receiverId": "uuid",
    "conversationId": "uuid",
    "content": "Hello there!",
    "isRead": false,
    "createdAt": "2026-04-01T10:00:00Z",
    "updatedAt": "2026-04-01T10:00:00Z"
  }
}
```

## 🔐 Authentication

All protected endpoints require JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGc...
```

### Token Refresh

When access token expires:
```json
POST /api/auth/refresh-token

{
  "refreshToken": "jwt_refresh_token"
}
```

Response:
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "token": "new_jwt_access_token"
  }
}
```

## 🔌 Socket.IO Events

Real-time communication for chat:

### Client → Server Events

```javascript
// Connect
socket.on('connect', () => {
  socket.emit('user:online', { userId });
});

// Send message
socket.emit('message:send', {
  conversationId,
  receiverId,
  content
});

// User typing
socket.emit('typing', {
  conversationId,
  userId
});

// Stop typing
socket.emit('stop:typing', {
  conversationId,
  userId
});
```

### Server → Client Events

```javascript
// Receive message
socket.on('message:received', (message) => {
  // New message from other user
});

// Message confirmed
socket.on('message:sent', (message) => {
  // Your message was sent
});

// User typing
socket.on('typing', ({ userId, conversationId }) => {
  // User is typing
});

// Stop typing
socket.on('stop:typing', ({ userId, conversationId }) => {
  // User stopped typing
});

// User online/offline
socket.on('user:online', ({ userId }) => {});
socket.on('user:offline', ({ userId }) => {});
```

## ⚙️ Configuration

### Rate Limiting

Default: 100 requests per 15 minutes for auth endpoints

Change in `src/middleware/rateLimit.middleware.ts`:
```typescript
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
  message: "Too many requests"
});
```

### JWT Expiration

In `.env`:
- Access token: `JWT_EXPIRE=15m` (default 15 minutes)
- Refresh token: `JWT_REFRESH_EXPIRE=7d` (default 7 days)

## 🧪 Testing Endpoints

### Using curl

```bash
# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "username": "john_doe",
    "email": "john@example.com",
    "password": "Password123"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'

# Get Current User (with auth)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. Set base URL: `http://localhost:3000`
2. Create requests for each endpoint
3. Add JWT token in Authorization header for protected routes
4. Test the full flow: signup → login → get conversations → send message

## 📚 Database Schema

### User Model
- id, name, username (unique), email (unique)
- passwordHash, avatar, bio
- role (USER/ADMIN), isVerified, isBanned
- resetTokenHash, resetTokenExpire
- timestamps: createdAt, updatedAt

### Conversation Model
- id, participantOneId, participantTwoId
- Unique constraint on participant pair
- timestamps: createdAt, updatedAt

### Message Model
- id, senderId, receiverId, conversationId
- content, isRead, readAt
- deletedBy (for soft deletes)
- timestamps: createdAt, updatedAt

### Notification Model
- id, userId, type, title, message
- isRead, timestamps: createdAt, updatedAt

## 🐛 Common Issues

### 1. Database Connection Error
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify credentials are correct

### 2. Rate Limit (429) Error
- Wait 15 minutes or clear rate limit cache
- Or increase `max` in `src/middleware/rateLimit.middleware.ts`

### 3. JWT Token Expired
- Use refresh token to get new access token
- POST to `/api/auth/refresh-token`

### 4. CORS Error
- Check `CORS_ORIGIN` in `.env`
- Frontend URL should be: `http://localhost:5173`

## 📖 Project Structure

```
src/
├── config/           # Configuration files
│   ├── env.ts
│   └── socket.ts
├── controllers/      # Request handlers
│   ├── auth.controller.ts
│   ├── chat.controller.ts
│   └── ...
├── services/         # Business logic
│   ├── auth.services.ts
│   ├── chat.services.ts
│   └── ...
├── middleware/       # Express middleware
│   ├── auth.middleware.ts
│   ├── rateLimit.middleware.ts
│   └── ...
├── routes/          # API routes
│   ├── auth.routes.ts
│   ├── chat.routes.ts
│   └── ...
├── validators/      # Zod schemas
│   └── auth.schema.ts
├── utils/           # Utility functions
├── types/           # TypeScript types
├── db.ts           # Prisma client
└── index.ts        # App entry point
```

## ✅ Checklist Before Deployment

- [ ] `.env` configured with secure secrets
- [ ] PostgreSQL database created and migrated
- [ ] All endpoints tested and working
- [ ] JWT secrets changed from defaults
- [ ] CORS origin set correctly
- [ ] Rate limiting configured
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Database backups enabled
- [ ] Security headers enabled (Helmet)

## 🚀 Deployment Notes

1. Update `CORS_ORIGIN` to your frontend domain
2. Update `APP_URL` to your backend domain
3. Use strong JWT secrets in production
4. Enable HTTPS
5. Set `NODE_ENV=production`
6. Use a process manager like PM2
7. Set up monitoring and alerting
8. Configure proper logging

---

**Backend is ready for development!** Start with `bun run dev` 🎉
