# Fix Translations, Login, Settings & UI Enhancements

## Status: COMPLETED

## Summary

Fixed three critical issues (missing translations, broken login, non-functional settings) plus implemented UI enhancements (landing page auth-aware navbar, logout functionality, user profile dropdown).

---

## What Was Done

### Phase 1: i18n Translations

**Problem**: `ar.json` was missing 75 keys across 2 entire sections (`common` and `settings`), causing Arabic UI to show raw translation keys.

**Solution**:
- Created [`scripts/sync-i18n.mjs`](scripts/sync-i18n.mjs) — reusable Node.js script that compares locale JSON files against `en.json` as reference, reports missing/extra keys, and with `--fix` flag adds missing keys with empty values
- Added `i18n:sync` and `i18n:sync:fix` npm scripts to [`package.json`](package.json)
- Added 75 translated keys to [`src/locales/ar.json`](src/locales/ar.json) covering:
  - `common.status.mission.*` (7 keys) — mission status labels
  - `common.status.payment.*` (6 keys) — payment status labels
  - `common.status.subscription.*` (5 keys) — subscription status labels
  - `common.emptyState.*` (4 keys) — empty state messages
  - `common.loading`, `common.pagination.*`, `common.search.*`, `common.confirm.*`, `common.fileUpload.*`, `common.breadcrumb.*`
  - `settings.title`, `settings.nav.*`, `settings.account.*`, `settings.notifications.*`, `settings.appearance.*`
- Fixed locale key mismatch in [`AppearanceSettingsView.vue`](src/views/settings/AppearanceSettingsView.vue) — changed `dossiat-locale` → `ds-locale` to match [`i18n.ts`](src/i18n.ts) and [`useDirection.ts`](src/composables/useDirection.ts)
- Added `nav.dashboard` translation key to all 3 locales

### Phase 2: Login Fix

**Problem**: SQLite database never initialized — tables didn't exist, so register/login API calls failed silently.

**Solution**:
- Created [`src/server/dev-init.ts`](src/server/dev-init.ts) — one-time database initialization module that:
  - Calls `sequelize.sync({ alter: true })` to create tables
  - Seeds demo users if database is empty
- Updated [`src/server/vite-plugin.ts`](src/server/vite-plugin.ts) to call `initDevDatabase()` on first `/api` request via `server.ssrLoadModule()`

### Phase 3: Settings Fix

**Problem**: Theme toggle had no visual effect (CSS had no light theme overrides) and language changes didn't persist.

**Solution**:
- Added `[data-theme="light"]` CSS variable overrides to [`src/assets/main.css`](src/assets/main.css) with proper light color scheme
- Added `[data-theme="dark"]` explicit overrides for clarity
- Added comprehensive light theme overrides for all hardcoded dark values (navbar, sidebar, modals, buttons, tables, overlays, auth layout, landing page)
- Updated [`src/stores/ui.ts`](src/stores/ui.ts) to read theme from `localStorage('dossiat-theme')` on init and apply via `data-theme` attribute + CSS classes
- Added `initTheme()` function exported from ui store
- Updated [`src/App.vue`](src/App.vue) to call `uiStore.initTheme()` on mount

### Phase 4: Logout Fix

**Problem**: Logout button in sidebar was a `RouterLink to="/"` — just navigated home without clearing tokens.

**Solution**:
- Updated [`Sidebar.vue`](src/components/layout/Sidebar.vue) — replaced `RouterLink` with `<button>` that calls `handleLogout()` → `authStore.logout()` → `router.push('/')`
- Logout now properly: revokes refresh token server-side, clears localStorage, resets auth store

### Phase 5: Landing Page Auth-Aware Navbar

**Problem**: Landing page always showed Sign In / Get Started buttons, even when authenticated.

**Solution**:
- Updated [`LandingPage.vue`](src/views/LandingPage.vue) to conditionally render:
  - **Not authenticated**: Sign In + Get Started buttons
  - **Authenticated**: Dashboard link + Logout button
- Logout button calls `authStore.logout()` properly

### Phase 6: User Profile Dropdown

**Problem**: TopNavbar avatar was just a static avatar with no interaction.

**Solution**:
- Implemented dropdown menu in [`TopNavbar.vue`](src/components/layout/TopNavbar.vue) with:
  - Clickable avatar trigger
  - User name + email header
  - Settings link → `/app/settings`
  - Logout button (danger styled) → `authStore.logout()` + redirect
- Added outside-click-to-close behavior
- Added comprehensive CSS for the dropdown menu

---

## Files Created

| File | Purpose |
|------|---------|
| `scripts/sync-i18n.mjs` | Reusable i18n sync script |
| `src/server/dev-init.ts` | One-time database initialization |
| `plans/fix-i18n-translations.md` | i18n fix plan |
| `plans/fix-login-and-settings.md` | Login & settings fix plan |
| `plans/fix-translations-login-settings.md` | Combined fix plan |

## Files Modified

| File | Changes |
|------|---------|
| `package.json` | Added `i18n:sync` and `i18n:sync:fix` scripts |
| `src/locales/ar.json` | Added 75 translated keys (`common` + `settings` sections) |
| `src/locales/en.json` | Added `nav.dashboard` key |
| `src/locales/fr.json` | Added `nav.dashboard` key |
| `src/views/settings/AppearanceSettingsView.vue` | Fixed locale key `dossiat-locale` → `ds-locale`, removed redundant localStorage call |
| `src/server/vite-plugin.ts` | Added `initDevDatabase()` call on first API request |
| `src/stores/ui.ts` | Theme persistence from localStorage, DOM application, `initTheme()` export |
| `src/App.vue` | Call `uiStore.initTheme()` on mount |
| `src/assets/main.css` | Added `[data-theme="light"]` and `[data-theme="dark"]` variable overrides, comprehensive light theme overrides, user menu dropdown CSS |
| `src/components/layout/Sidebar.vue` | Fixed logout — replaced RouterLink with button calling `authStore.logout()` |
| `src/components/layout/TopNavbar.vue` | Implemented user profile dropdown menu with settings + logout |
| `src/views/LandingPage.vue` | Auth-aware navbar — shows login/register when not authenticated, dashboard/logout when authenticated |

## Test Results

- `pnpm i18n:sync` confirms all 3 locales in sync (845 keys each)
- Login flow: database auto-initialized with `sequelize.sync()`, demo users seeded
- Theme toggle: CSS variables switch between dark/light, persists via localStorage
- Language switcher: saves to correct `ds-locale` key, persists across reloads
- Logout: properly clears tokens and redirects to home page
- User menu: dropdown opens/closes, outside-click dismisses, settings/logout navigate correctly

## Issues Encountered

- **Vue-tsc TS6305 error** in `tsconfig.node.json` — pre-existing issue with `composite: true` without built declarations, unrelated to our changes
- **Locale file key ordering** — `ar.json` was alphabetically sorted by the sync script, different from the original order in `en.json`/`fr.json`
- **Light theme hardcoded values** — Many CSS rules used hardcoded `rgba(10, 14, 26, ...)` for dark backgrounds instead of CSS variables, requiring individual `[data-theme="light"]` overrides
