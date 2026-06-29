# Section 5h — Subscription Frontend Pages

## Summary

Implemented all 3 subscription-related view components for the Dossiat platform, completing the Section 5h TODO items. Extended the existing backend routes, service layer, and store with invoice fetching and billing portal support.

## What Was Done

### Backend
- **New endpoint**: `GET /api/subscriptions/me/invoices` — Lists subscription invoices for the authenticated client, ordered by `createdAt DESC`. Added to [`src/server/routes/subscriptions.ts`](src/server/routes/subscriptions.ts).

### Service Layer
- Added `getSubscriptionInvoices()` → `GET /subscriptions/me/invoices` and `openBillingPortal()` → `POST /subscriptions/me/portal` to [`src/services/subscriptions.ts`](src/services/subscriptions.ts).

### Store
- Extended [`src/stores/subscriptions.ts`](src/stores/subscriptions.ts) with:
  - Exported `Plan`, `Subscription`, `SubscriptionInvoice` interfaces
  - `invoices` ref for subscription invoices state
  - `isSubscribed` computed property
  - New actions: `fetchInvoices`, `subscribeToPlan`, `updatePlan`, `cancelPlan`, `openPortal`

### i18n
- Added complete `subscriptions` namespace to all 3 locale files: [`src/locales/en.json`](src/locales/en.json), [`src/locales/fr.json`](src/locales/fr.json), [`src/locales/ar.json`](src/locales/ar.json) — with keys for plans view, manage view, and billing view

### Views Created (3)
1. **[`SubscriptionPlansView.vue`](src/views/subscription/SubscriptionPlansView.vue)** — 3-tier plan cards with feature comparison, price display, seats/recurrent limits, subscribe CTA
2. **[`SubscriptionManageView.vue`](src/views/subscription/SubscriptionManageView.vue)** — Current plan card with status/period details, plan switcher with upgrade/downgrade labels, cancel with confirmation modal, billing portal link
3. **[`SubscriptionBillingView.vue`](src/views/subscription/SubscriptionBillingView.vue)** — Subscription invoice table with date, amount, status badges, paid-at columns, empty state

### Router
- Updated [`src/router/index.ts`](src/router/index.ts):
  - `/app/subscriptions` → redirect to `/app/subscriptions/manage`
  - `/app/subscriptions/plans` → `SubscriptionPlansView.vue`
  - `/app/subscriptions/manage` → `SubscriptionManageView.vue`
  - `/app/subscriptions/billing` → `SubscriptionBillingView.vue`
  - All routes are `roles: ['client']` only

### Tests (3 spec files)
- [`tests/components/subscription/SubscriptionPlansView.spec.ts`](tests/components/subscription/SubscriptionPlansView.spec.ts) — 7 tests
- [`tests/components/subscription/SubscriptionManageView.spec.ts`](tests/components/subscription/SubscriptionManageView.spec.ts) — 8 tests
- [`tests/components/subscription/SubscriptionBillingView.spec.ts`](tests/components/subscription/SubscriptionBillingView.spec.ts) — 8 tests

## Issues Encountered & Fixes

1. **Plan name i18n key mismatch**: DB uses `small_business` (snake_case) but i18n keys use `pricing.smallBusiness` (camelCase). Added a `planNameKey()` helper function in both `SubscriptionPlansView.vue` and `SubscriptionManageView.vue` to map between the two formats.

## Files Modified
- `src/server/routes/subscriptions.ts`
- `src/services/subscriptions.ts`
- `src/stores/subscriptions.ts`
- `src/locales/en.json`, `src/locales/fr.json`, `src/locales/ar.json`
- `src/router/index.ts`
- `docs/TODO.md`

## Files Created
- `src/views/subscription/SubscriptionPlansView.vue`
- `src/views/subscription/SubscriptionManageView.vue`
- `src/views/subscription/SubscriptionBillingView.vue`
- `tests/components/subscription/SubscriptionPlansView.spec.ts`
- `tests/components/subscription/SubscriptionManageView.spec.ts`
- `tests/components/subscription/SubscriptionBillingView.spec.ts`
- `plans/section-5h-subscriptions.md`
- `.memory/section-5h-subscriptions/summary.md`

## Test Results
All 23 new subscription tests passing (3 test files). No regressions reported by user.
