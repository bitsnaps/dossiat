# Task: Admin Users CRUD — Full Implementation

## Problem
The admin users page ([`AdminUsersView.vue`](src/views/admin/AdminUsersView.vue)) had only two actions: `View` and `Deactivate`. The `Deactivate` action was misnamed — it called `adminStore.deleteUser()` which performed a soft-deactivation (setting `emailVerified: false`) via the `DELETE` endpoint. There was no way to create, activate, or hard-delete users from the admin panel. The admin needed full CRUD operations with clear separation between deactivation (soft) and deletion (hard).

## Solution

### Backend Changes ([`src/server/routes/admin.ts`](src/server/routes/admin.ts:63))

| Endpoint | Method | Action |
|----------|--------|--------|
| `POST /api/admin/users` | Create | Creates user with bcrypt-hashed password, validates email uniqueness, sets `emailVerified: false` |
| `PATCH /api/admin/users/:id/deactivate` | Soft-deactivate | Sets `emailVerified: false` |
| `PATCH /api/admin/users/:id/activate` | Reactivate | Sets `emailVerified: true` |
| `DELETE /api/admin/users/:id` | Hard-delete | Permanently removes user from database via `user.destroy()` |
| `PUT /api/admin/users/:id` | Update | Updates role/emailVerified (unchanged) |

### Frontend Service ([`src/services/admin.ts`](src/services/admin.ts:19))

Added [`createUser()`](src/services/admin.ts:19), [`deactivateUser()`](src/services/admin.ts:28), [`activateUser()`](src/services/admin.ts:32). Also added [`patch()`](src/services/api.ts:74) to the API module since only `get`, `post`, `put`, `del` existed.

### Frontend Store ([`src/stores/admin.ts`](src/stores/admin.ts:159))

Added [`createUser()`](src/stores/admin.ts:159), [`deactivateUser()`](src/stores/admin.ts:183), [`activateUser()`](src/stores/admin.ts:196) actions. Each updates the store reactively and also syncs `selectedUser` if viewing the detail page.

### Frontend Views

- [`AdminUsersView.vue`](src/views/admin/AdminUsersView.vue:121) — "Create User" button + modal (with firstName, lastName, email, role, password fields), Deactivate/Activate toggle per row (based on `emailVerified`), Delete button per row with confirmation dialog
- [`AdminUserDetailView.vue`](src/views/admin/AdminUserDetailView.vue:127) — "Account Actions" card with Deactivate/Activate toggle and Delete button, redirects to list after deletion

### i18n Translations

Added 20 new translation keys across all 3 locales ([`en.json`](src/locales/en.json:1080), [`fr.json`](src/locales/fr.json:97), [`ar.json`](src/locales/ar.json:97)): `createUser`, `firstName`, `lastName`, `password`, `create`, `creating`, `created`, `createError`, `activate`, `activateConfirm`, `activated`, `activateError`, `delete`, `deleteConfirm`, `deleted`, `deleteError`, `accountActions`, plus placeholder keys. Verified sync via `scripts/sync-i18n.mjs`.

### Tests (67 admin-specific tests, all passing)

| File | Tests | Coverage |
|------|-------|----------|
| [`tests/server/routes/admin.spec.ts`](tests/server/routes/admin.spec.ts:140) | 27 | POST create, PATCH deactivate/activate, DELETE hard-delete, GET/PUT existing |
| [`tests/services/admin.spec.ts`](tests/services/admin.spec.ts:69) | 21 | createUser, deactivateUser, activateUser, deleteUser service functions |
| [`tests/stores/admin.spec.ts`](tests/stores/admin.spec.ts:120) | 19 | createUser, deactivateUser, activateUser store actions + error handling |

## Key Decisions

- **Separate deactivate/activate endpoints** instead of a toggle endpoint — clearer semantics, each action has its own route and confirmation dialog
- **Hard-delete for DELETE** — `DELETE` now truly removes from DB. Deactivation is handled by the dedicated `PATCH /deactivate` endpoint
- **`emailVerified` as the deactivation flag** — reused existing boolean field rather than adding a new `isActive` column, avoiding a migration
- **`BButton` variant constraint** — the component only supports `'accent' | 'outline' | 'gradient' | 'ghost' | 'danger'`. Used `accent` for primary actions and `danger` for destructive ones
- **Create user modal** on the list page — simple form with email, name, role, password fields
- **Confirmation dialogs** for all destructive actions (deactivate, activate, delete) using the existing `useConfirmDialog` composable

## Test Results
Full test suite: **113 files, 1081 tests passed, 7 skipped, 2 pre-existing failures** (in `create-admin.spec.ts` — unrelated to this change, fails because an admin user already exists in the test DB). Zero regressions from this implementation.
