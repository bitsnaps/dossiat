# Admin Disputes CRUD - Task Summary

## Goal
Implement full CRUD (Create, Read, Update, Delete) operations for admin Dispute Management pages with comprehensive tests across all layers.

## Status: ✅ Complete

---

## What Was Implemented

### Backend Routes (`src/server/routes/admin.ts`)
- **Enhanced `GET /api/admin/disputes`** — Added `search` query param to filter by reason text using `Op.like`
- **`POST /api/admin/disputes`** — Admin creates dispute on behalf of a user. Body: `{ missionId, initiatedBy, reason }`. Validates mission and initiator exist. Creates with status `open`.
- **`PUT /api/admin/disputes/:id`** — Updates dispute (reason, status, resolution). Sets `resolvedAt` when status becomes `resolved`.
- **`DELETE /api/admin/disputes/:id`** — Hard-deletes a dispute record.
- **`PUT /api/admin/disputes/:id/escalate`** — Escalates dispute by setting status to `escalated`.
- **`PATCH /api/admin/disputes/:id/status`** — Quick status update. Validates against allowed statuses: open, reconciling, resolved, escalated.
- **`POST /api/admin/disputes/:id/messages`** — Admin sends message in dispute room. Uses auth context (`c.get('auth')`) to get sender userId.

### Backend Tests (`tests/server/routes/admin.spec.ts`)
- 24 new dispute CRUD tests added in a `describe('Dispute CRUD')` block:
  - GET /:id: detail with messages, 404, 422 invalid ID
  - POST: create valid, 422 missing fields, 404 bad mission, 404 bad initiator
  - PUT /:id: update reason, 404, 422 no fields
  - DELETE /:id: delete, 404
  - PUT /:id/resolve: resolve with note, 404, 422 no resolution
  - PUT /:id/escalate: escalate, 404
  - PATCH /:id/status: status to reconciling, 422 invalid, 404
  - POST /:id/messages: send message, persistence check, 422 no content, 404

### Frontend Service (`src/services/admin.ts`)
- Added 6 functions: `createDispute()`, `updateDispute()`, `deleteDispute()`, `escalateDispute()`, `updateDisputeStatus()`, `sendDisputeMessage()`
- Enhanced `getDisputes()` params type to include optional `search` field

### Frontend Service Tests (`tests/services/admin.spec.ts`)
- 6 new tests verifying correct API calls for each new function

### Frontend Store (`src/stores/admin.ts`)
- Added 6 actions: `createDispute()` (unshifts to array), `updateDispute()` (updates array + selectedDispute), `deleteDispute()` (removes from array), `escalateDispute()` (updates selectedDispute), `updateDisputeStatus()` (updates selectedDispute), `sendDisputeMessage()` (appends to selectedDispute.messages)
- Enhanced `fetchDisputes()` params type to include optional `search` field
- All 6 new actions exported in the store return block

### Frontend Store Tests (`tests/stores/admin.spec.ts`)
- 18 new tests covering success + failure cases for all 6 new actions:
  - fetchDisputes error, fetchDispute success/error
  - createDispute success/error
  - updateDispute in list + selectedDispute, error
  - deleteDispute success/error
  - resolveDispute success/error
  - escalateDispute success/error
  - updateDisputeStatus success/error
  - sendDisputeMessage success/error

### i18n Translations (`src/locales/en.json`)
- 30+ new keys under `admin.disputes` covering:
  - CRUD labels (create, edit, delete, view, actions)
  - Form fields (reason, mission, initiatedBy, status, resolution)
  - Confirmation messages and error messages
  - Status management (manageStatus, currentStatus, changeStatus)
  - Message sending (sendMessage, messagePlaceholder, messageSent, messageError)
  - Search (search)

### Component Tests
- **`tests/components/admin/AdminDisputesView.spec.ts`** (7 tests) — Renders container, title, loading state, calls fetchDisputes on mount, renders BTable, BSelect filter, Pagination
- **`tests/components/admin/AdminDisputeDetailView.spec.ts`** (5 tests) — Renders container, back link, calls fetchDispute on mount, loading state, page title

---

## Files Modified/Created

| File | Action |
|------|--------|
| `src/server/routes/admin.ts` | Modified — Added 6 dispute CRUD routes + search filter |
| `tests/server/routes/admin.spec.ts` | Modified — Added 24 dispute CRUD tests |
| `src/services/admin.ts` | Modified — Added 6 dispute functions |
| `tests/services/admin.spec.ts` | Modified — Added 6 test blocks |
| `src/stores/admin.ts` | Modified — Added 6 dispute actions |
| `tests/stores/admin.spec.ts` | Modified — Added 18 test blocks |
| `src/locales/en.json` | Modified — Added 30+ dispute CRUD keys |
| `src/views/admin/AdminDisputesView.vue` | Modified — Full CRUD UI: create button, delete action, create modal (mission/user/reason), search input, confirm dialog |
| `src/views/admin/AdminDisputeDetailView.vue` | Modified — Escalate/delete buttons, status management dropdown, message composer, confirm dialog |
| `tests/components/admin/AdminDisputesView.spec.ts` | **Created** — 7 component tests |
| `tests/components/admin/AdminDisputeDetailView.spec.ts` | **Created** — 5 component tests |
| `plans/admin-disputes-crud.md` | **Created** — Implementation plan |

## Test Results
- **122/123 test files pass** (1 pre-existing flaky SQLite_BUSY in seeders.spec.ts)
- **1306 tests pass** across the full suite
- All admin dispute-specific tests pass:
  - 75 backend route tests (24 new dispute CRUD)
  - 34 service tests (6 new dispute)
  - 55 store tests (18 new dispute)
  - 7 AdminDisputesView component tests (new)
  - 5 AdminDisputeDetailView component tests (new)

## Key Decisions
- **Auth context**: Used `c.get('auth')` (not `c.get('user')`) for the messages endpoint, matching the auth middleware's `set('auth', ...)` pattern
- **Status validation**: Backend validates against `['open', 'reconciling', 'resolved', 'escalated']` — the same statuses used by the existing `Dispute` model
- **Dispute creation**: Requires `missionId`, `initiatedBy`, and `reason` — validates both mission and initiator exist before creating
- **PATCH /status**: Separate from PUT to allow quick status changes without touching other fields (consistent with payments pattern)
- **Search filter**: Added `Op.like` search on `reason` field for the list endpoint, matching the pattern used by user/mission search

## Remaining Items (not part of this task)
- `fr.json` and `ar.json` locale updates for the new dispute keys
- `GET /api/admin/stats/revenue` — Revenue breakdown by period
- `GET /api/admin/stats/activity` — Recent platform activity feed
