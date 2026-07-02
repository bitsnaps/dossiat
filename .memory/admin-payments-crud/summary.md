# Admin Payments CRUD - Task Summary

## Goal
Implement full CRUD (Create, Read, Update, Delete) + status management for the `/admin/payments` pages.

## Status: ✅ Complete

---

## What Was Implemented

### Backend Routes (`src/server/routes/admin.ts`)
- **POST `/api/admin/payments`** — Creates a payment with auto-calculated fees via `calculateAllFees()` from the payment fee calculator service. Validates that mission, payer, and payee exist.
- **PUT `/api/admin/payments/:id`** — Updates payment fields (amount, method, currency, status). Recalculates fees when amount or method changes.
- **DELETE `/api/admin/payments/:id`** — Hard-deletes a payment record.
- **PATCH `/api/admin/payments/:id/status`** — Updates only the status field. Sets `confirmedAt` when status becomes `confirmed`. Validates against allowed statuses: pending, confirmed, failed, refunded.

### Backend Tests (`tests/server/routes/admin.spec.ts`)
- 12 new tests added:
  - POST: creates with auto fees, calculates gateway fees for stripe, rejects without required fields, rejects invalid method, rejects non-existent mission/payer
  - PUT: updates fields, recalculates fees on amount change, returns 404 for non-existent
  - DELETE: deletes payment, returns 404 for non-existent
  - PATCH /status: updates status (sets confirmedAt), rejects invalid status, returns 404

### Frontend Service (`src/services/admin.ts`)
- Added 4 functions: `createPayment()`, `updatePayment()`, `deletePayment()`, `updatePaymentStatus()`

### Frontend Service Tests (`tests/services/admin.spec.ts`)
- 4 new tests verifying correct API calls for each function

### Frontend Store (`src/stores/admin.ts`)
- Added `confirmedAt` to `AdminPayment` interface
- Added 4 actions: `createPayment()` (unshifts to array), `updatePayment()` (updates array + selectedPayment), `deletePayment()` (removes from array), `updatePaymentStatus()` (updates selectedPayment)

### Frontend Store Tests (`tests/stores/admin.spec.ts`)
- 10 new tests covering success + failure cases for all 4 actions

### i18n Translations (`en.json`, `fr.json`, `ar.json`)
- 41 new keys per locale under `admin.payments` covering:
  - CRUD labels (create, edit, delete, view, actions)
  - Form fields (mission, payer, payee, amount, currency, method, status)
  - Confirmation messages and error messages
  - Detail page labels (platformFee, gatewayFee, netAmount, confirmedAt, createdAt)
  - Status management (manageStatus, currentStatus, changeStatus)
- All locales verified in sync via `pnpm i18n:sync`

### Enhanced List View (`AdminPaymentsView.vue`)
- Actions column with View/Edit/Delete buttons (following AdminMissionsView pattern)
- "Create Payment" button in header
- Create/Edit modal with dropdowns for mission, payer, payee (loaded dynamically from admin API), plus amount, currency, method, status fields
- ConfirmDialog for delete confirmation
- Toast notifications for success/error

### New Detail View (`AdminPaymentDetailView.vue`)
- Back link to payments list
- BCard with payment details (amount, currency, method, fees, net amount, status, dates)
- BCard with payer and payee info
- BCard with mission link (navigates to mission detail)
- Status management section (change status dropdown)
- Edit modal (amount, currency, method)
- Delete with confirmation dialog

### Router (`src/router/index.ts`)
- Added route: `payments/:id` → `admin-payment-detail` with admin role guard

### TODO.md Updated
- Marked all admin payments CRUD items as complete
- Marked admin service/store/view test items as complete

---

## Files Modified/Created

| File | Action |
|------|--------|
| `src/server/routes/admin.ts` | Modified — Added 4 payment CRUD routes |
| `tests/server/routes/admin.spec.ts` | Modified — Added 12 payment CRUD tests |
| `src/services/admin.ts` | Modified — Added 4 payment functions |
| `tests/services/admin.spec.ts` | Modified — Added 4 test blocks |
| `src/stores/admin.ts` | Modified — Added 4 actions + confirmedAt interface field |
| `tests/stores/admin.spec.ts` | Modified — Added 10 test blocks |
| `src/locales/en.json` | Modified — Added 41 payment CRUD keys |
| `src/locales/fr.json` | Modified — Added 41 payment CRUD keys (French) |
| `src/locales/ar.json` | Modified — Added 41 payment CRUD keys (Arabic) |
| `src/views/admin/AdminPaymentsView.vue` | Modified — Full CRUD UI with modal, actions column |
| `src/views/admin/AdminPaymentDetailView.vue` | **Created** — Detail page with status management |
| `src/router/index.ts` | Modified — Added payment detail route |
| `docs/TODO.md` | Modified — Marked payment CRUD items complete |

## Test Results
- **120/121 test files pass**
- **1234/1246 tests pass** (5 pre-existing failures in auth-flow.spec.ts, 7 skipped)
- All admin-specific tests pass: 51 route tests, 28 service tests, 37 store tests

## Key Decisions
- **POST route**: Auto-calculates fees using the existing `calculateAllFees()` from the payment service — no manual fee entry needed
- **PUT route**: Recalculates fees automatically when amount or method changes
- **PATCH /status**: Separate from PUT to allow quick status changes without touching other fields
- **Detail view**: Follows the same pattern as AdminMissionDetailView for consistency
- **Form dropdowns**: Missions, payers (clients), and payees (agents) are loaded sequentially from admin API since the shared `users` ref gets overwritten on each fetch
- **SQLite compatibility**: Tests use `Number()` casts for DECIMAL fields since SQLite returns numbers instead of strings

## Remaining Items (not part of this task)
- `GET /api/admin/stats/revenue` — Revenue breakdown by period
- `GET /api/admin/stats/activity` — Recent platform activity feed
