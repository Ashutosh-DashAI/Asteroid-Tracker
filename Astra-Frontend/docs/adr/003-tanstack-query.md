# ADR-006: TanStack Query for Server State

## Status: Accepted

## Context
All data fetching (NASA API, user data, asteroid stats) needs:
- Caching with stale-while-revalidate
- Loading/error states
- Background refetching
- Optimistic updates

## Decision
TanStack Query v5. Provides all server-state needs with minimal boilerplate.
Integrates well with Zustand (client state) and Axios (HTTP client).

## Trade-offs
- Adds dependency for what useEffect + fetch can do
- Learning curve for query keys and cache invalidation
- Overkill for rarely-changing data

## Alternatives Considered
- SWR: Simpler API but fewer features
- RTK Query: Good Redux integration but heavy
- raw useEffect: Maximum control but no caching
