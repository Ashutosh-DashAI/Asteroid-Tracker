# ASTRA Backend Setup Guide

## 🚀 Quick Start

The backend is built with:
- **Node.js/Bun** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM with PostgreSQL
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Zod** - Schema validation

## 📋 Environment Setup

Create a `.env` file in the backend root:

```env
# Server
PORT=3000
NODE_ENV=development

# Database - PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/astra

# JWT Secrets
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

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
