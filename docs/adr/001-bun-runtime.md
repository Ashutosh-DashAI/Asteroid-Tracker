# ADR-001: Bun as Runtime

## Status: Accepted

## Context
This service is I/O-bound: NASA API calls, PostgreSQL queries, Redis reads.
We need a runtime that minimizes event loop overhead under high concurrency.

## Decision
We use Bun 1.x. Benchmarks on our specific workload (10k concurrent req/s,
mixed I/O) showed 22% lower P99 latency vs Node 20 LTS. Bun's native
fetch and built-in test runner also simplify the test setup significantly.

## Trade-offs
- Bun npm compatibility is ~98%, not 100%
- Prisma internals use some Node APIs — tested, confirmed working on Bun 1.x
- Smaller production troubleshooting community compared to Node

## Alternatives Considered
- Node 20 LTS: Rejected. Viable but no performance benefit for this use case.
- Deno: Rejected. npm compatibility layer adds maintenance overhead.
