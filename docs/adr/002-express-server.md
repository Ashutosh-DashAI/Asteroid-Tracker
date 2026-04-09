# ADR-002: Express.js as HTTP Server

## Status: Accepted

## Context
We need a battle-tested HTTP framework with middleware ecosystem for:
- Authentication (JWT)
- Rate limiting
- Input validation
- Error handling
- CORS

## Decision
Express 5.x provides the best balance of maturity, middleware availability,
and async support. The middleware ecosystem (helmet, cors, express-rate-limit)
is production-proven.

## Trade-offs
- Express routing is not type-safe by default
- We mitigate with Zod middleware and TypeScript
- Fastify offers better TypeScript support but fewer middleware options

## Alternatives Considered
- Fastify: Better TypeScript support but fewer middleware options
- Hono: Lightweight but less battle-tested middleware ecosystem
- raw Node http: Too much boilerplate for production features
