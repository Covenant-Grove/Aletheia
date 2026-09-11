# Published Pedagogical Catalog Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans. Follow the approved scope from the user: connect curriculum application to published catalog data, retain initial models, protect published seed rows, and demonstrate an admin-created model end to end.

**Goal:** Applying a pedagogical template reads a published version from PostgreSQL, including codes unknown to application code.

**Architecture:** Keep the existing template application endpoint and legacy framework response for compatibility. Resolve published catalog metadata by code, pin the selected definition ID on the learner plan, and reject missing/unpublished codes before writes. Existing codes keep their legacy framework value; new codes use CUSTOM in that compatibility field. Bootstrap existing content through a data migration; runtime does not fall back to the old engine.

**Tech Stack:** NestJS, Prisma/PostgreSQL, Zod, Jest, Vitest.

## Constraints and rulings

- Preserve family isolation: learner and academic year must belong to the requesting family before any template writes.
- Preserve existing CUSTOM application behavior as an alias for TRADITIONAL catalog content, as confirmed in the old engine's default branch.
- Published seed content must not change on rerun, including status and publication timestamp.
- Ruling: retain the legacy enum only for compatibility; catalog selection and content are open data. Full UI catalog discovery is a later slice.
- Ruling: pin the exact definition on the learner plan without rewriting existing objectives or historical achievements.

## Tasks

- [x] Catalog application: add failing contract/service tests, allow template codes, resolve published data, persist definition ID, reject unavailable definitions and foreign-family IDs. Add Prisma migration for the reference and run tests/typecheck.
- [x] Bootstrap: test seed rerun immutability, change upsert updates to no-op, add a migration with the eight original model snapshots. Verify migration against a separate PostgreSQL database and resolver equivalence.
- [x] Acceptance: real PostgreSQL admin creates and publishes an unknown model; guardian applies it through the existing endpoint and receives its subjects/objectives, pinned version and tenant isolation. Verify unpublished rejection and version behavior.
- [x] Review and final validation: contracts, API unit/E2E/integration, lint/typecheck/build and module boundaries; resolve review findings and commit the finished branch.

## Execution ledger

- Started from origin/main c2d151e in the existing isolated worktree, on feat/published-pedagogical-catalog.

- Completed catalog application, bootstrap migration, acceptance tests and independent review.
- Review finding: concurrent framework edits could retain an incompatible pin. Fixed with a serializable transaction and bounded conflict retries; scoped re-review passed.
- Validation: 199 contract tests, 97 API E2E tests, 28 targeted PostgreSQL integration tests, full workspace typecheck, API build, API/contracts lint and module boundaries passed. Final unit run includes the concurrency regressions.
