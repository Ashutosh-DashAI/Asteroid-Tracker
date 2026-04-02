# ASTRA Asteroid Tracker API Documentation

## Overview
ASTRA is a full-stack web platform for real-time Near-Earth Object (NEO) monitoring and risk analysis. This document describes all available API endpoints.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require JWT authentication via Bearer token in the `Authorization` header:
```
Authorization: Bearer <accessToken>
```

## Response Format
All API responses follow this standard format:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success message",
  "data": {
    // Response data here
  }
}
```

---

## Endpoints

### Authentication

#### 1. **Sign Up**
- **Endpoint**: `POST /auth/signup`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }
  ```
- **Response**: User object with access and refresh tokens

#### 2. **Login**
- **Endpoint**: `POST /auth/login`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "SecurePass123"
  }
  ```
- **Response**: User object with tokens

#### 3. **Get Current User**
- **Endpoint**: `GET /auth/me`
- **Auth Required**: Yes

#### 4. **Forgot Password**
- **Endpoint**: `POST /auth/forgot-password`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "email": "john@example.com"
  }
  ```

---

### Asteroids - Discovery & Feed

#### 1. **Get NASA Feed (Date Range)**
- **Endpoint**: `GET /asteroids/feed`
- **Auth Required**: No
- **Query Parameters**:
  - `startDate` (required): ISO date (YYYY-MM-DD)
  - `endDate` (required): ISO date (YYYY-MM-DD)
  - `hazardousOnly` (optional): boolean, default false
  - `limit` (optional): int, max 1000, default 20
  - `offset` (optional): int, default 0
- **Description**: Fetches asteroids from NASA NeoWs API for the specified date range and stores them in the database
- **Example**:
  ```
  GET /asteroids/feed?startDate=2026-04-01&endDate=2026-04-07&hazardousOnly=false&limit=20
  ```

#### 2. **Get Nearby Asteroids**
- **Endpoint**: `GET /asteroids/nearby`
- **Auth Required**: No
- **Query Parameters**:
  - `days` (optional): Number of days to look ahead, default 30
- **Description**: Returns asteroids with close approaches in the next N days

#### 3. **Search Asteroids**
- **Endpoint**: `GET /asteroids/search`
- **Auth Required**: No
- **Query Parameters**:
  - `query` (optional): Search by name or NEO ID
  - `hazardousOnly` (optional): boolean
  - `limit` (optional): int, default 20
  - `offset` (optional): int, default 0
- **Description**: Search for asteroids by name or criteria

#### 4. **Get Hazardous Asteroids Ranking**
- **Endpoint**: `GET /asteroids/hazardous/ranking`
- **Auth Required**: No
- **Query Parameters**:
  - `limit` (optional): int, max 50, default 10
- **Description**: Returns hazardous asteroids ranked by risk score

---

### Asteroids - Details & Analysis

#### 1. **Get Asteroid Details**
- **Endpoint**: `GET /asteroids/{neoId}`
- **Auth Required**: No
- **URL Parameters**:
  - `neoId` (required): NASA NEO reference ID
- **Description**: Get detailed information about a specific asteroid
- **Response**:
  ```json
  {
    "asteroid": {
      "id": "uuid",
      "neoId": "2099942",
      "name": "Apophis (99942)",
      "diameter": 0.37,
      "isPotentiallyHazardous": true,
      "velocity": 5.52,
      "missDistance": 31600000,
      "closeApproachDate": "2026-04-14",
      "nasaUrl": "http://...",
      "estimatedClass": "S",
      "orbitingBody": "Earth"
    }
  }
  ```

#### 2. **Get Risk Analysis**
- **Endpoint**: `GET /asteroids/{neoId}/risk-analysis`
- **Auth Required**: No
- **URL Parameters**:
  - `neoId` (required): NASA NEO reference ID
- **Description**: Calculate and return detailed risk analysis for an asteroid
- **Response**:
  ```json
  {
    "analysis": {
      "neoId": "2099942",
      "asteroidName": "Apophis",
      "riskScore": 42.5,
      "riskLevel": "MEDIUM",
      "factors": {
        "diameterScore": 15.2,
        "velocityScore": 8.3,
        "missDistanceScore": 5.1,
        "hazardousScore": 25
      },
      "recommendation": "🟡 MEDIUM: Observable risk level. Regular monitoring suggested.",
      "details": {
        "diameter": { "min": 0.32, "max": 0.73, "unit": "km" },
        "velocity": { "value": 19872, "unit": "km/h" },
        "missDistance": { "value": 31600000, "unit": "km" },
        "closeApproachDate": "2026-04-14",
        "isPotentiallyHazardous": true
      }
    }
  }
  ```

---

### Asteroids - User Watchlist

#### 1. **Add Asteroid to Watchlist**
- **Endpoint**: `POST /asteroids/{asteroidId}/watch`
- **Auth Required**: Yes
- **URL Parameters**:
  - `asteroidId` (required): Database asteroid ID
- **Body**:
  ```json
  {
    "alertLevel": "HIGH"
  }
  ```
- **Alert Levels**: LOW, MEDIUM, HIGH, CRITICAL

#### 2. **Get User's Watched Asteroids**
- **Endpoint**: `GET /asteroids/watchlist`
- **Auth Required**: Yes
- **Description**: Returns all asteroids the authenticated user is watching

#### 3. **Remove Asteroid from Watchlist**
- **Endpoint**: `DELETE /asteroids/{asteroidId}/watch`
- **Auth Required**: Yes
- **URL Parameters**:
  - `asteroidId` (required): Database asteroid ID

---

### Alerts & Notifications

#### 1. **Get User Alerts**
- **Endpoint**: `GET /asteroids/alerts`
- **Auth Required**: Yes
- **Query Parameters**:
  - `includeRead` (optional): boolean, default false
- **Description**: Get unread alerts for the authenticated user

#### 2. **Mark Alert as Read**
- **Endpoint**: `PATCH /asteroids/alerts/{alertId}/read`
- **Auth Required**: Yes
- **URL Parameters**:
  - `alertId` (required): Alert ID

#### 3. **Create Manual Alert**
- **Endpoint**: `POST /asteroids/{asteroidId}/create-alert`
- **Auth Required**: Yes
- **URL Parameters**:
  - `asteroidId` (required): Database asteroid ID
- **Body**:
  ```json
  {
    "alertType": "CLOSE_APPROACH",
    "severity": "HIGH",
    "message": "Custom alert message"
  }
  ```
- **Alert Types**: CLOSE_APPROACH, HAZARD_WARNING, NEW_DISCOVERY, ORBITAL_UPDATE
- **Severity Levels**: LOW, MEDIUM, HIGH, CRITICAL

---

## Risk Analysis Engine

The risk analysis engine calculates a comprehensive risk score (0-100) based on:

### Scoring Factors:
1. **Diameter Score (0-25)**: Larger asteroids = higher risk
2. **Velocity Score (0-25)**: Higher velocity = higher risk
3. **Miss Distance Score (0-25)**: Closer proximity = higher risk
4. **Hazardous Status Score (0-25)**: NASA classification

### Risk Levels:
- **CRITICAL** (75-100): Requires immediate attention
- **HIGH** (50-74): Significant risk, continuous monitoring
- **MEDIUM** (25-49): Observable risk, regular monitoring
- **LOW** (0-24): Minimal risk, standard monitoring

---

## Error Handling

### Common HTTP Status Codes:
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid parameters
- `401 Unauthorized`: Missing or invalid authentication
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Error Response Format:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "error": "Additional error details"
}
```

---

## Rate Limiting

The API implements rate limiting:
- **Window**: 15 minutes (900,000 ms)
- **Max Requests**: 100 per window
- **Headers**:
  - `X-RateLimit-Limit`: Maximum requests
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets

---

## Pagination

Endpoints that return lists support pagination:
- `offset`: Starting position (default 0)
- `limit`: Number of items (default 20, max varies by endpoint)

**Response includes**:
```json
{
  "data": {
    "items": [...],
    "pagination": {
      "total": 150,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

## WebSocket Events (Real-time Chat)

Real-time chat functionality is available via Socket.IO connections.

### Emit Events:
- `send_message`: Send a message
- `join_chat`: Join a chat room
- `leave_chat`: Leave a chat room

### Listen Events:
- `receive_message`: New message received
- `user_joined`: User joined chat
- `user_left`: User left chat

---

## Testing

### Using Postman
1. Import `ASTRA_Postman_Collection.json` into Postman
2. Set `baseUrl` variable to `http://localhost:3000`
3. Authenticate by calling the Login endpoint
4. Access tokens will be automatically saved for subsequent requests

### Using cURL
```bash
# Get feed
curl -X GET "http://localhost:3000/api/asteroids/feed?startDate=2026-04-01&endDate=2026-04-07"

# Login
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123"}'

# Get risk analysis
curl -X GET "http://localhost:3000/api/asteroids/2099942/risk-analysis"
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database
- NASA API Key (get free from https://api.nasa.gov/)

### Installation
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env and add your configuration

# Setup database
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# Start development server
npm run dev
```

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `NASA_API_KEY`: Your NASA API key
- `JWT_SECRET`: Secret for JWT tokens
- `JWT_REFRESH_SECRET`: Secret for refresh tokens

---

## Data Models

### User
```
- id (UUID)
- name (String)
- username (String, unique)
- email (String, unique)
- passwordHash (String)
- role (USER | ADMIN)
- isVerified (Boolean)
- createdAt (DateTime)
- updatedAt (DateTime)
```

### Asteroid
```
- id (UUID)
- neoId (String, unique)
- name (String)
- diameter (Float, km)
- isPotentiallyHazardous (Boolean)
- velocity (Float, km/h)
- missDistance (Float, km)
- closeApproachDate (DateTime)
- nasaUrl (String)
- estimatedClass (String)
```

### WatchedAsteroid
```
- id (UUID)
- userId (UUID, FK)
- asteroidId (UUID, FK)
- alertLevel (LOW | MEDIUM | HIGH | CRITICAL)
- isActive (Boolean)
- createdAt (DateTime)
```

### AsteroidAlert
```
- id (UUID)
- asteroidId (UUID, FK)
- userId (UUID, FK, nullable)
- alertType (CLOSE_APPROACH | HAZARD_WARNING | NEW_DISCOVERY | ORBITAL_UPDATE)
- severity (LOW | MEDIUM | HIGH | CRITICAL)
- title (String)
- message (String)
- riskScore (Float, 0-100)
- isRead (Boolean)
- createdAt (DateTime)
```

---

## Features Implemented

✅ User Authentication with JWT  
✅ NASA NeoWs API Integration  
✅ Real-Time Data Feed  
✅ Risk Analysis Engine (Hazard Categorization)  
✅ Alert & Notification System  
✅ User Watchlist Management  
✅ Real-time Chat (Socket.IO)  
✅ Rate Limiting  
✅ Error Handling  
✅ PostgreSQL Database with Prisma ORM  
✅ Comprehensive API Documentation  
✅ Postman Collection for Testing  

---

## Future Enhancements

- 3D Visualization with Three.js
- Email notifications for alerts
- Advanced filtering and sorting
- Asteroid trajectory simulation
- Community forms and discussions
- Mobile app
- Cloud deployment with Docker

---

## Support

For issues or questions, please refer to the GitHub repository or contact the development team.
