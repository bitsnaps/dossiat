# Section 7 — Admin Management Features

## Summary

Full admin panel implementation with backend CRUD routes, frontend views, service, store, sidebar, i18n, and tests. Built using TDD approach.

## What Was Built

### Backend — `src/server/routes/admin.ts`
Expanded from 3 read-only endpoints to full CRUD:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/users` | `GET` | List users with search, role filter, pagination |
| `/api/admin/users/:id` | `GET` | User detail with profiles |
| `/api/admin/users/:id` | `PUT` | Update user role, emailVerified |
| `/api/admin/users/:id` | `DELETE` | Deactivate user |
| `/api/admin/missions` | `GET` | List all missions with filters |
| `/api/admin/missions/:id` | `GET` | Mission detail with payments |
| `/api/admin/missions/:id/status` | `PUT` | Admin status override |
| `/api/admin/payments` | `GET` | List all payments with filters |
| `/api/admin/payments/:id` | `GET` | Payment detail |
| `/api/admin/disputes` | `GET` | List all disputes (all statuses) |
| `/api/admin/disputes/:id` | `GET` | Dispute detail with messages |
| `/api/admin/disputes/:id/resolve` | `PUT` | Admin resolve dispute |
| `/api/admin/subscription-plans` | `GET/POST` | List/create plans |
| `/api/admin/subscription-plans/:id` | `PUT/DELETE` | Update/deactivate plans |
| `/api/admin/stats` | `GET` | Platform statistics |

### Frontend Service — `src/services/admin.ts`
All admin API functions matching backend endpoints.

### Frontend Store — `src/stores/admin.ts`
Pinia store with state for users, missions, payments, disputes, plans, stats, pagination, loading.

### Frontend Views — `src/views/admin/`
| File | Description |
|------|-------------|
| `AdminLayout.vue` | Admin layout wrapper |
| `AdminSidebar.vue` | Admin-specific navigation sidebar |
| `AdminDashboardView.vue` | Stats overview cards |
| `AdminUsersView.vue` | User list with search, role filter, deactivate |
| `AdminUserDetailView.vue` | User detail with role management |
| `AdminMissionsView.vue` | Mission list with status filter |
| `AdminMissionDetailView.vue` | Mission detail with status override |
| `AdminPaymentsView.vue` | Payment list with method/status filters |
| `AdminDisputesView.vue` | Dispute list with status filter |
| `AdminDisputeDetailView.vue` | Dispute detail with admin resolve |
| `AdminSubscriptionsView.vue` | Plan CRUD with create/edit modals |

### Router — `src/router/index.ts`
Replaced single `/app/admin` route with nested admin route group (10 child routes) using `AdminLayout.vue`.

### Sidebar — `src/components/layout/Sidebar.vue`
Admin link now routes to admin layout.

### i18n — `src/locales/{en,fr,ar}.json`
Added `admin` namespace with ~104 keys per locale (sidebar, dashboard, users, missions, payments, disputes, subscriptions).

## Tests Created

| File | Tests | Status |
|------|-------|--------|
| `tests/server/routes/admin.spec.ts` | 19 | ✅ Passing |
| `tests/services/admin.spec.ts` | 18 | ✅ Passing |
| `tests/stores/admin.spec.ts` | 12 | ✅ Passing |

## Test Fixes Applied

Fixed FK constraint errors in 8 pre-existing test files by adding `EmailVerificationToken.destroy()` and `PasswordResetToken.destroy()` before `User.destroy()` in `beforeAll`:
- `tests/server/routes/auth.spec.ts`
- `tests/server/routes/messages.spec.ts`
- `tests/server/routes/missions.spec.ts`
- `tests/server/routes/payments.spec.ts`
- `tests/server/routes/paypal.spec.ts`
- `tests/server/routes/stripe.spec.ts`
- `tests/server/routes/subscriptions.spec.ts`
- `tests/server/routes/users.avatar.spec.ts`
- `tests/server/services/notification.spec.ts`

## Documentation Updated

- `docs/TODO.md` — Added dedicated Section 13 "Admin Management" with ~50 task items across 6 subsections (13a-13f)
- `docs/TODO.md` — Renumbered old Section 13 (Future Scope) to Section 14
- `plans/section-7-admin-management.md` — Detailed architecture plan document

## Design Decisions

1. Admin has its own layout with dedicated sidebar (separate from main app)
2. Admin test creates users via `User.create()` directly (avoids generating notifications via register endpoint)
3. Reuse existing base components (`BTable`, `BModal`, `StatusBadge`, `Pagination`, `SearchInput`, etc.)
4. Soft-delete for users (deactivate via `emailVerified: false`) rather than hard delete
5. All admin routes protected by both `authenticate()` + `adminOnly()` middleware

## Remaining Notes

- Some test skips are related to local SQLite dev mode, won't occur on PostgreSQL production
- Component tests for admin views not yet written (TODO.md 13d items)
