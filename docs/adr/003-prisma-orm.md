# ADR-003: Prisma as ORM

## Status: Accepted

## Context
We need type-safe database access with:
- PostgreSQL support
- Migration management
- Type-safe queries
- Connection pooling

## Decision
Prisma 7.x with PostgreSQL adapter. Provides excellent TypeScript integration,
auto-generated types from schema, and straightforward migration workflow.

## Trade-offs
- Prisma's query engine adds overhead vs raw SQL
- Connection pooling requires adapter setup
- Migration system is declarative but less flexible than raw SQL

## Alternatives Considered
- Drizzle: Lighter, faster, but less mature migration tooling
- Knex: More flexible but less type-safe
- Raw SQL: Maximum performance but no type safety
