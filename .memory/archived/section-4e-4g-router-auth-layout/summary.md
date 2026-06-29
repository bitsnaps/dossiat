# Section 4e–4g — Router Configuration, Auth Pages & App Layout

## Task Summary

Implemented Vue Router with full route definitions, navigation guards, NProgress loading bar, 5 authentication pages, and 5 layout components (AppLayout, AuthLayout, Sidebar, TopNavbar, NotificationDropdown). All implemented using TDD with 102 new tests.

## Files Created

### Test Files
- `tests/router/router.spec.ts` — 41 tests covering route definitions, meta fields, auth guards, role-based access, NProgress
- `tests/components/auth/LoginView.spec.ts` — 10 tests for login form, inputs, links, error states
- `tests/components/auth/RegisterView.spec.ts` — 9 tests for registration form, role selection, inputs
- `tests/components/auth/ForgotPasswordView.spec.ts` — 5 tests for forgot password form, success state
- `tests/components/auth/ResetPasswordView.spec.ts` — 6 tests for password reset form, confirm password
- `tests/components/auth/VerifyEmailView.spec.ts` — 3 tests for email verification page
- `tests/components/layout/AuthLayout.spec.ts` — 4 tests for centered card layout, child rendering
- `tests/components/layout/Sidebar.spec.ts` — 10 tests for nav links, collapse, toggle, sections
- `tests/components/layout/TopNavbar.spec.ts` — 6 tests for search, notifications, toggle
- `tests/components/layout/NotificationDropdown.spec.ts` — 8 tests for notifications, mark-as-read

### Source Files
- `src/router/index.ts` — Full route definitions with lazy loading, navigation guards, NProgress integration
- `src/views/auth/LoginView.vue` — Email/password login with "Forgot password" link, error display, loading state
- `src/views/auth/RegisterView.vue` — Registration with role selection (Agent/Client), all form fields
- `src/views/auth/ForgotPasswordView.vue` — Request password reset, success message display
- `src/views/auth/ResetPasswordView.vue` — Set new password with confirm, token from route params
- `src/views/auth/VerifyEmailView.vue` — Email verification with loading/success/error states
- `src/components/layout/AppLayout.vue` — Sidebar + TopNavbar + main content area
- `src/components/layout/AuthLayout.vue` — Centered card layout for auth pages
- `src/components/layout/Sidebar.vue` — Role-based navigation with collapse support
- `src/components/layout/TopNavbar.vue` — Search, notifications bell, user avatar
- `src/components/layout/NotificationDropdown.vue` — Notification list with mark-as-read
- `src/views/DashboardView.vue` — Placeholder dashboard view for route targets

### Modified Files
- `vitest.config.ts` — Added `tests/router/**` to jsdom environment
- `src/assets/main.css` — Added NProgress dark theme, auth layout, app layout, sidebar, topbar, notification dropdown styles (~250 lines)
- `src/locales/en.json` — Added `auth.*` and `layout.*` translation namespaces
- `docs/TODO.md` — Checked off all 4e, 4f, 4g items + auth component tests

### Installed Dependencies
- `@types/nprogress` (devDependency) — TypeScript type definitions for NProgress

## Test Results

- All 60 test files pass (575 tests pass, 2 skipped)
- 102 new tests added across router, auth, and layout test files
- No regressions in existing tests

## Design Decisions

1. **Lazy loading** — All auth and layout views use dynamic `import()` for code splitting. Only LandingPage and Demo are eagerly loaded.

2. **Route meta fields** — `requiresAuth: true` for protected routes, `requiresGuest: true` for login/register. `roles` array for admin/agent/client-only routes.

3. **Navigation guard pattern** — Single `beforeEach` guard with one-time `loadUser()` call on first navigation. Handles auth redirect, guest redirect, and role-based access.

4. **NProgress** — Custom CSS matching dark theme with `--ds-accent` color. Configured with `showSpinner: false` and fast speed.

5. **Sidebar role-based links** — Agent sees: Dashboard, Missions, Messages, Payments, Credits, Invoices, Disputes, Settings. Client sees: Dashboard, Missions, Messages, Payments, Subscriptions, Disputes, Settings. Admin additionally sees Admin link.

6. **i18n** — All auth strings under `auth.*` namespace, layout strings under `layout.*`. Email placeholders escaped with `{'@'}` to avoid vue-i18n linked message format conflicts.

7. **Auth views use base components** — BInput-style patterns (ds-input classes) for consistency with existing design system. Forms use native HTML validation + store error display.

8. **NotificationDropdown** — Emits `mark-read` and `mark-all-read` events, parent (TopNavbar) delegates to notifications store.

## Issues Encountered

- **vue-i18n `@` syntax conflict** — Email placeholders like `you@example.com` triggered vue-i18n's linked message format. Fixed by escaping as `you{'@'}example.com` in locale files.
- **Shell integration error** — One terminal command failed due to shell integration. Resolved by retrying the command.
