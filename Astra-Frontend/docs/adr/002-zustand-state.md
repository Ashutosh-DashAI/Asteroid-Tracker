# ADR-005: Zustand for Client State

## Status: Accepted

## Context
React apps need lightweight state management for:
- Authentication state (user, tokens)
- Asteroid favorites and filters
- UI state (modals, sidebar)

TanStack Query handles server state; Zustand handles client state.

## Decision
Zustand provides minimal boilerplate, TypeScript support, and persist middleware
for localStorage. TanStack Query handles all API caching/refetching.

## Trade-offs
- Zustand has no built-in devtools time-travel
- Redux Toolkit offers more conventions but more boilerplate
- Jotai is also viable but Zustand's API is simpler

## Alternatives Considered
- Redux Toolkit: More conventions but verbose for simple state
- Jotai: Atomic model but learning curve
- useState/useContext: Sufficient for simple apps but not scalable
