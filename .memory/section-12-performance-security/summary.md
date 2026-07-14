# Section 12 — Performance & Security

> Completed: 2026-07-14

## What was done

All 10 TODO items in `docs/TODO.md` §12 checked off. No new third-party dependencies added — used Hono built-ins and Node stdlib only.

### New middleware (5 files)

| File | Purpose |
|------|---------|
| `src/server/middleware/secureHeaders.ts` | Hono built-in `secureHeaders` (X-Content-Type-Options, X-Frame-Options, Referrer-Policy) |
| `src/server/middleware/sanitize.ts` | XSS input sanitization — strips HTML tags from JSON bodies recursively, neutralizes `javascript:` URIs |
| `src/server/middleware/csrf.ts` | CSRF defense-in-depth — rejects `text/plain`/`application/x-www-form-urlencoded` on state-changing methods (content-type confusion guard). Does NOT require `X-Requested-With` (Bearer-token auth is stateless) |
| `src/server/middleware/requestLogger.ts` | Structured JSON request logging — one line per request with method, path, status, latency, IP |
| `src/server/utils/uploadValidation.ts` | Centralized file upload validation (MIME type allowlist + max size) |

### Edits to existing files

- `src/server/index.ts` — Wrote new middleware in order: CORS → secureHeaders → requestLogger → rateLimiter → CSRF → sanitize → errorHandler. Enhanced `GET /api/health` to ping DB + report uptime.
- `src/server/middleware/errorHandler.ts` — Switched to structured JSON error logging via `logError()`.
- `src/server/routes/payments.ts` — Added pagination to all list endpoints (mission payments, credit transactions, agent payments, invoices).
- `src/server/routes/messages.ts` — Added pagination to conversations list endpoint.
- `src/server/routes/recurrence.ts` — Added pagination to recurrences list endpoint.
- `src/server/routes/subscriptions.ts` — Added pagination to subscription invoices list endpoint.
- `src/server/routes/users.ts` — Refactored avatar upload to use centralized `validateFileUpload()` helper.

### Verified existing (no changes needed)

- **SQL injection prevention** — All queries use Sequelize ORM. Only raw queries are in `dev-init.ts` (dev-only, no user input).
- **JWT token rotation** — Already implemented in `auth.ts` (refresh rotates the stored token). Documented secure storage recommendation (httpOnly cookie) in `docs/DEVELOPMENT.md`.

### Tests

- Created `tests/server/middleware/security.spec.ts` — 18 tests covering secure headers, XSS sanitization, CSRF, health check, upload validation, and pagination wiring. All pass.

### Docs updated

- `docs/TODO.md` §12 — All 10 items checked off with file references.
- `ARCHITECTURE.md` — Updated middleware table (4 new rows), entry point description, API conventions (pagination, upload validation), added Security Rules section.
- `docs/DEVELOPMENT.md` — Added JWT Token Storage security recommendation under Authentication section.
- `plans/section-12-performance-security.md` — Detailed implementation plan created and followed.

### Pre-existing test failures (NOT caused by this work)

Multiple route test files (`payments.spec.ts`, `missions.spec.ts`, `messages.spec.ts`, `subscriptions.spec.ts`, `users.discover.spec.ts`, `users.network.spec.ts`) fail in `beforeAll` because they register users without the `acceptTerms` field required by the ToS migration (`20260713000000-add-tos-acceptance.cjs`). Confirmed by stashing changes and running on original code — same failures. These need fixing separately.

## Key design decisions

- **CSRF scope**: Did NOT add `X-Requested-With` requirement (too invasive — would break all existing tests and API clients). Only blocks content-type confusion (form-encoded/text-plain on POST/PUT/PATCH/DELETE).
- **Sanitization approach**: Global middleware strips HTML tags from all JSON string values. For the sanitize middleware to work with Hono's `c.req.json()`, the sanitized JSON string is injected as `Promise.resolve(jsonString)` into `bodyCache["text"]` (Hono's internal cache key).
- **Pagination**: Capped `limit` at 100, default 20. Uses existing `paginatedResponse()` helper. Applied to: payments (4 endpoints), messages conversations, recurrence configs, subscription invoices.
