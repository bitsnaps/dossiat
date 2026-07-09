# Fix Agent Discovery Feature

## Problem
The "Discover Agents" feature (`/app/discover`) was non-functional. Clicking the sidebar link showed a page with an empty agent list and no way to find agents.

## Root Cause
Two issues:

1. **Frontend stub** — [`AgentDiscoveryView.vue`](src/views/client/AgentDiscoveryView.vue:29) `searchAgents()` was a placeholder that always returned `[]` with a `TODO: Replace with actual API call`.

2. **No backend endpoint** — There was no `GET /api/users/agents/discover` endpoint. The existing [`GET /api/users/network`](src/server/routes/users.ts:182) only returned `id/firstName/lastName/email` (no bio, specialties, slug, photo) and was meant for assignment dropdowns, not discovery.

## Solution

### 1. Added `GET /api/users/agents/discover` endpoint in [`users.ts`](src/server/routes/users.ts:90)
- `authenticate()` + `roleGuard('client')` — clients only; admins work via `X-View-As-Role: client`
- Query params: `q` (search by name/specialty), `clientType` (B2B/B2C/Both), `limit` (max 100), `offset`
- Returns `{ id, slug, firstName, lastName, bio, specialties, acceptedClientTypes, profilePhotoUrl }`
- Only returns verified agents (`emailVerified: true`)
- Route declared before `agents/:slug` to avoid param capture in Hono routing

### 2. Added `discoverAgents()` service function in [`users.ts`](src/services/users.ts:64)
- Calls `GET /users/agents/discover` with optional `q`, `clientType`, `limit`, `offset` params

### 3. Wired [`AgentDiscoveryView.vue`](src/views/client/AgentDiscoveryView.vue:29) to the service
- Calls `discoverAgents()` on mount and on search button click
- Displays agent cards with avatar, name, verified badge, bio, specialties, client type, and profile link
- Added error state display
- Added `onMounted` to load all agents initially

### 4. Admin role handling — already correct, no changes needed
- [`auth.ts`](src/server/middleware/auth.ts:38) swaps `auth.role` to `X-View-As-Role` header value for admins
- [`api.ts`](src/services/api.ts:24) sends `X-View-As-Role` header automatically from localStorage
- [`router/index.ts`](src/router/index.ts:372) uses `hasRole` (effective role) for non-admin routes
- Admins viewing as client can access `/app/discover` without changes

## Files Changed
- `src/server/routes/users.ts` — Added `GET /api/users/agents/discover` endpoint (roleGuard client, search by name/specialty, clientType filter)
- `src/services/users.ts` — Added `discoverAgents()` function
- `src/views/client/AgentDiscoveryView.vue` — Replaced stub with actual API call, added error state, `onMounted` load
- `tests/server/routes/users.discover.spec.ts` — New file: 8 backend integration tests
- `tests/services/users.spec.ts` — Added 2 tests for `discoverAgents()`
- `tests/components/client/AgentDiscoveryView.spec.ts` — Updated to mock service and test search/card rendering (9 tests)
- `docs/TODO.md` — Added discover endpoint entry (section 3c), updated view description (section 5c)

## Testing
All 128 test files pass (1423 tests passed, 7 skipped — all pre-existing). New tests cover:
- Backend: auth required, agent role rejected (403), client returns agents, name search, specialty search, clientType filter, admin view-as-client (200), admin without header (403)
- Service: params passed correctly, no-params call
- View: mount, search trigger, service called on mount, cards render, empty state

## Architecture Notes
- `specialties` is stored as JSON; filtering is done in JS (dialect-agnostic) rather than DB-level JSON queries to stay compatible with both SQLite (dev) and Postgres (prod)
- Route ordering: `discover` must be declared before `agents/:slug` in Hono (first match wins)
- The feature allows clients to browse all verified agents with profiles; admins can also use it when viewing as client
