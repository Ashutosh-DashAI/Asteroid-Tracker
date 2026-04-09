# ADR-004: React + Vite + TypeScript

## Status: Accepted

## Context
Frontend needs to be interactive (real-time asteroid data, 3D visualization,
charts). TypeScript for type safety across API contracts.

## Decision
React 18 + Vite 5 + TypeScript 5. Vite provides fast HMR, TypeScript for
type safety, React ecosystem for component libraries.

## Trade-offs
- React server components still maturing
- Vite build can be slow for large apps
- TypeScript compilation adds CI time

## Alternatives Considered
- Next.js: SSR beneficial for SEO but adds complexity
- SvelteKit: Excellent DX but smaller ecosystem
- SolidJS: Performance benefits but less library support
