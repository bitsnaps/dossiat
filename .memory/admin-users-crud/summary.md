# Admin Users CRUD — Task Summary

## Problem

The admin users page ([`AdminUsersView.vue`](src/views/admin/AdminUsersView.vue)) and detail page ([`AdminUserDetailView.vue`](src/views/admin/AdminUserDetailView.vue)) only supported:
- List (search + role filter)
- Create
- View detail
- Change role (detail page only)
- Activate/Deactivate (`emailVerified` toggle)
- Delete

Missing operations: **edit name**, **edit email**, **reset password**.

## What Was Done

### Backend — [`src/server/routes/admin.ts`](src/server/routes/admin.ts)

- **Extended `PUT /api/admin/users/:id`** — now accepts `firstName`, `lastName`, `email`, `role`, `emailVerified`. Email is lowercased, format-validated, and uniqueness-checked (excluding current user).
- **Added `PATCH /api/admin/users/:id/reset-password`** — admin sets a new password (bcrypt-hashed, min 8 chars). Invalidates all existing refresh tokens for the user.

### Frontend Service — [`src/services/admin.ts`](src/services/admin.ts)

- Extended [`updateUser()`](src/services/admin.ts) signature to include `firstName`, `lastName`, `email`.
- Added [`resetUserPassword(id, password)`](src/services/admin.ts) function.

### Frontend Store — [`src/stores/admin.ts`](src/stores/admin.ts)

- Extended [`updateUser()`](src/stores/admin.ts) action to accept new fields.
- Added [`resetUserPassword(id, password)`](src/stores/admin.ts) action.

### Admin Views

- **[`AdminUsersView.vue`](src/views/admin/AdminUsersView.vue)** — added **Edit** and **Reset Password** buttons in each row's action bar. Each opens a modal (Edit: pre-filled with user data; Reset: new password + confirm).
- **[`AdminUserDetailView.vue`](src/views/admin/AdminUserDetailView.vue)** — added **Edit Profile** card (opens modal with firstName, lastName, email, role) and **Reset Password** button in Account Actions section (opens modal with new password + confirm).

### i18n — [`en.json`](src/locales/en.json), [`fr.json`](src/locales/fr.json), [`ar.json`](src/locales/ar.json)

Added ~20 new keys: `editUser`, `editProfile`, `editProfileHint`, `resetPassword`, `resetPasswordTitle`, `resetPasswordHint`, `newPassword`, `confirmPassword`, `passwordMinLength`, `passwordMismatch`, `resetting`, `updating`, `passwordReset`, `passwordResetError`, `emailInvalid`, `emailTaken`.

### Tests

- [`tests/server/routes/admin.spec.ts`](tests/server/routes/admin.spec.ts) — added 11 new tests (PUT: name/email update, email validation, duplicate rejection, empty body; reset-password: success, short password, 404, refresh token invalidation)
- [`tests/services/admin.spec.ts`](tests/services/admin.spec.ts) — added tests for extended [`updateUser()`](src/services/admin.ts) and [`resetUserPassword()`](src/services/admin.ts)
- [`tests/stores/admin.spec.ts`](tests/stores/admin.spec.ts) — added tests for [`updateUser()`](src/stores/admin.ts) with new fields and [`resetUserPassword()`](src/stores/admin.ts) action
- Created [`tests/components/admin/AdminUsersView.spec.ts`](tests/components/admin/AdminUsersView.spec.ts) — tests for edit/reset-password modal triggers
- Created [`tests/components/admin/AdminUserDetailView.spec.ts`](tests/components/admin/AdminUserDetailView.spec.ts) — tests for edit/reset-password sections

### Full Test Suite

1357 tests passed, 0 failed — no regression.

## Files Modified/Created

| File | Action |
|------|--------|
| [`src/server/routes/admin.ts`](src/server/routes/admin.ts) | Modified (extended PUT, added reset-password) |
| [`src/services/admin.ts`](src/services/admin.ts) | Modified (extended updateUser, added resetUserPassword) |
| [`src/stores/admin.ts`](src/stores/admin.ts) | Modified (extended updateUser, added resetUserPassword) |
| [`src/views/admin/AdminUserDetailView.vue`](src/views/admin/AdminUserDetailView.vue) | Modified (edit profile + reset password) |
| [`src/views/admin/AdminUsersView.vue`](src/views/admin/AdminUsersView.vue) | Modified (edit + reset-password row actions) |
| [`src/locales/en.json`](src/locales/en.json) | Modified (added keys) |
| [`src/locales/fr.json`](src/locales/fr.json) | Modified (added keys) |
| [`src/locales/ar.json`](src/locales/ar.json) | Modified (added keys) |
| [`tests/server/routes/admin.spec.ts`](tests/server/routes/admin.spec.ts) | Modified (extended + new tests) |
| [`tests/services/admin.spec.ts`](tests/services/admin.spec.ts) | Modified |
| [`tests/stores/admin.spec.ts`](tests/stores/admin.spec.ts) | Modified |
| [`tests/components/admin/AdminUsersView.spec.ts`](tests/components/admin/AdminUsersView.spec.ts) | Created |
| [`tests/components/admin/AdminUserDetailView.spec.ts`](tests/components/admin/AdminUserDetailView.spec.ts) | Created |
| [`docs/TODO.md`](docs/TODO.md) | Modified (updated PUT description, added reset-password entry) |
| [`plans/admin-users-crud.md`](plans/admin-users-crud.md) | Created (initial plan) |

## Non-goals / Decisions

- Did **not** add a separate `active` boolean column. The existing activate/deactivate toggles `emailVerified`, which is the established pattern.
- Did **not** send email notifications on password reset (email sending is stubbed `TODO` in auth.ts).
- Email change checks uniqueness server-side to prevent collisions.
- Refresh tokens are invalidated on password reset to force re-login.
