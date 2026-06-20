# Task Summary: Remaining Section 3 Tasks

**Date:** 2026-06-20
**Status:** Completed

## What Was Done

### 1. Avatar Upload (3c)
- Created [`POST /api/users/me/avatar`](src/server/routes/users.ts:205) — Upload profile photo endpoint
  - Uses Hono's built-in `c.req.formData()` for multipart parsing
  - Validates MIME type (JPEG, PNG, WebP) and max file size (5MB configurable)
  - Saves to `uploads/avatars/` directory, deletes old avatar on replace
  - Updates `AgentProfile.profilePhotoUrl` or `ClientProfile` accordingly
- Created [`tests/server/routes/users.avatar.spec.ts`](tests/server/routes/users.avatar.spec.ts) — 7 tests covering auth, validation, upload, replace, rejection, and edge cases

### 2. Notification Service (3k)
- Created [`src/server/services/notification.ts`](src/server/services/notification.ts) — Fire-and-forget notification creation
  - `createNotification()` — single notification with error handling
  - `bulkCreateNotifications()` — batch creation for multiple users
  - `NotificationType` type with 17 event types
- Created [`tests/server/services/notification.spec.ts`](tests/server/services/notification.spec.ts) — 6 tests covering creation, bulk creation, error handling

### 3. Notification Wiring into Routes
- [`missions.ts`](src/server/routes/missions.ts) — Notifications for: created, agreed, status changed, cancelled
- [`messages.ts`](src/server/routes/messages.ts) — Notifications for: message received
- [`payments.ts`](src/server/routes/payments.ts) — Notifications for: payment recorded, payment confirmed (both parties)
- [`disputes.ts`](src/server/routes/disputes.ts) — Notifications for: dispute created, resolved, escalated
- [`subscriptions.ts`](src/server/routes/subscriptions.ts) — Notifications for: activated, plan changed, cancelled

### 4. Real Stripe Integration (3h)
- Rewrote [`src/server/routes/stripe.ts`](src/server/routes/stripe.ts) with real Stripe SDK:
  - `POST /connect` — Creates Stripe Express Account + Account Link for onboarding
  - `POST /create-checkout-session` — Creates Checkout Session with destination charges (1% platform fee)
  - `POST /webhook` — Verifies webhook signature, handles `checkout.session.completed` and `payment_intent.payment_failed`
  - `GET /status` — Checks agent's Stripe connection status (charges_enabled, payouts_enabled)
- Updated [`tests/server/routes/stripe.spec.ts`](tests/server/routes/stripe.spec.ts) — 7 tests for real implementation

### 5. Real PayPal Integration (3h)
- Rewrote [`src/server/routes/paypal.ts`](src/server/routes/paypal.ts) with real PayPal Server SDK:
  - `POST /setup` — Returns onboarding URL for PayPal account linking
  - `POST /create-order` — Creates PayPal order via `OrdersController`
  - `POST /capture` — Captures approved order, records payment, calculates fees
  - `POST /webhook` — Handles PayPal webhook events
  - `GET /status` — Checks agent's PayPal connection status
- Updated [`tests/server/routes/paypal.spec.ts`](tests/server/routes/paypal.spec.ts) — 7 tests unchanged (still pass with 501 when not configured)

### 6. Stripe Billing Portal (3i)
- Added `POST /api/subscriptions/me/portal` — Creates Stripe Billing Portal session for subscription management

### 7. Scheduler Enhancements (3m)
- Updated [`netlify/functions/scheduler.ts`](netlify/functions/scheduler.ts) with:
  - **Stale mission cleanup** — Auto-cancels drafts older than 7 days, pending_agreement older than 30 days
  - **Invoice generation** — Monthly invoices for agents with confirmed payments, auto-deducts from platform credits
  - **Recurrence notifications** — Sends reminder notifications for missions scheduled within 24 hours

### 8. Infrastructure
- Added `uploads/` to [`.gitignore`](.gitignore)
- Updated [`docs/TODO.md`](docs/TODO.md) — All section 3 items now checked

## Files Created (3)
- `src/server/services/notification.ts` — Notification creation service
- `tests/server/routes/users.avatar.spec.ts` — Avatar upload tests
- `tests/server/services/notification.spec.ts` — Notification service tests

## Files Modified (12)
- `src/server/routes/users.ts` — Added avatar upload endpoint
- `src/server/routes/stripe.ts` — Real Stripe SDK integration
- `src/server/routes/paypal.ts` — Real PayPal SDK integration
- `src/server/routes/subscriptions.ts` — Added billing portal endpoint + notifications
- `src/server/routes/missions.ts` — Added notification triggers
- `src/server/routes/messages.ts` — Added notification triggers
- `src/server/routes/payments.ts` — Added notification triggers
- `src/server/routes/disputes.ts` — Added notification triggers
- `netlify/functions/scheduler.ts` — Stale cleanup, invoices, recurrence notifications
- `tests/server/routes/stripe.spec.ts` — Updated for real implementation
- `.gitignore` — Added uploads/
- `docs/TODO.md` — Updated checkboxes

## Test Results
- 29 test files, 289 tests passed, 1 pre-existing flaky test skipped
- No regressions introduced
