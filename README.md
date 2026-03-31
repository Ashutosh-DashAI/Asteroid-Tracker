
# ASTRA Backend

**Astra** is a modern, production-ready SaaS backend for real-time chat, user management, authentication, notifications, and more—built with Bun, Express, TypeScript, Prisma, PostgreSQL, JWT, bcrypt, Zod, and Socket.IO.

---

##  Features

- **Authentication**: JWT-based signup, login, refresh, password reset, and role-based access
- **User Management**: Profiles, follow/unfollow, bookmarks, admin dashboard
- **Real-Time Chat**: 1:1 conversations, message read status, Socket.IO integration
- **Notifications**: Real-time and persistent notifications for follows, messages, system events
- **Security**: Helmet, CORS, rate limiting, bcrypt password hashing
- **Validation**: Zod schemas for all endpoints
- **Prisma ORM**: Modern PostgreSQL schema, migrations, and type safety
- **Scalable Structure**: Modular services, controllers, routes, middleware, and validators

---

##  Tech Stack

- **Runtime**: [Bun](https://bun.sh/) v1.3+
- **Server**: Express v5
- **Database**: PostgreSQL (via Prisma ORM)
- **ORM**: Prisma v7
- **Auth**: JWT, bcrypt
- **Validation**: Zod
- **Real-Time**: Socket.IO
- **Security**: Helmet, CORS, express-rate-limit
- **TypeScript**: Strict mode, modern project structure

---

##  Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Configure Environment

Create a `.env` file with your secrets:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/astra
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
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
