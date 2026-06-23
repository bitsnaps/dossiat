# Fix Plan: Translations, Login & Settings Glitches

## Context

This plan addresses three issues discovered before proceeding to Section 7:
1. **Missing/incomplete translations** — `ar.json` is missing entire sections compared to `en.json` and `fr.json`
2. **Login not working** — possibly related to database initialization
3. **Settings not working** — dark/light theme and possibly other settings

---

## Issue 1: Missing/Incomplete Translations

### Root Cause Analysis

Comparing the three locale files:
- `en.json`: 1055 lines (reference locale)
- `fr.json`: 1055 lines (complete)
- `ar.json`: 948 lines (**107 lines shorter — missing sections**)

The `ar.json` is missing these top-level sections that exist in `en.json` and `fr.json`:
- `common` — contains `status` (mission/payment/subscription labels), `emptyState`, `loading`, `pagination`, `search`, `confirm`, `fileUpload`, `breadcrumb`
- `settings` — contains `title`, `nav`, `account`, `notifications`, `appearance`

These sections were added in later implementation phases (section 5j-5k for settings, common components) and the Arabic translations were never updated.

### Plan

#### Step 1: Create i18n sync script
Create `scripts/sync-i18n.mjs` — a reusable Node.js script that:
- Reads all `.json` files from `src/locales/`
- Uses `en.json` as the reference (source of truth)
- Recursively compares all keys across locales
- Reports missing keys (in reference but not in locale) and extra keys (in locale but not in reference)
- With `--fix` flag: adds missing keys with empty string values
- Exits with non-zero code if issues found (for CI)

#### Step 2: Add npm script
Add `i18n:sync` and `i18n:sync:fix` scripts to `package.json`.

#### Step 3: Run sync and identify gaps
Run `pnpm i18n:sync` to get a report of all missing keys.

#### Step 4: Add missing translations to ar.json
Add the missing `common` and `settings` sections to `ar.json` with proper Arabic translations. The keys and structure should match `en.json` exactly.

#### Step 5: Verify
Run `pnpm i18n:sync` again to confirm all locales are in sync.

### Files to Create/Modify
- `scripts/sync-i18n.mjs` (new)
- `package.json` (add npm scripts)
- `src/locales/ar.json` (add missing sections with Arabic translations)

---

## Issue 2: Login Not Working

### Root Cause Analysis

The login flow is:
1. `LoginView.vue` → `authStore.login()` → `apiLogin()` → POST `/api/auth/login`
2. Server: `auth.ts` route → `User.findOne()` → bcrypt.compare → JWT generation

The code itself looks correct. The likely issue is one of:
1. **Database not initialized** — `sequelize.sync()` is never called on server startup, and migrations may not have been run. The `dev-init.ts` exists but we need to verify it's properly integrated into the Vite dev plugin.
2. **Server module loading issue** — The vite plugin uses `server.ssrLoadModule()` to dynamically load the server. If the DB models aren't loaded before queries execute, it will fail.
3. **SQLite file missing or corrupted** — The `.env` points to `./dev.sqlite` but the file may not exist or the tables may not be created.

### Plan

#### Step 1: Verify dev-init.ts integration
Check that `src/server/vite-plugin.ts` properly calls `initDevDatabase()` from `src/server/dev-init.ts` on the first API request.

#### Step 2: Check dev-init.ts implementation
Verify that `src/server/dev-init.ts`:
- Imports and registers all models
- Calls `sequelize.sync()` to create tables
- Seeds demo users if the database is empty
- Seeds subscription plans

#### Step 3: Verify database initialization
Check if `dev-init.ts` also runs the subscription plans seeder (via the `20260614000000-subscription-plans.cjs` seeder or inline).

#### Step 4: Test login flow
- Start dev server with `pnpm dev`
- Try registering a new user
- Try logging in with the registered user
- Try logging in with demo credentials if seeded

#### Step 5: Fix any issues found
Address whatever is preventing the login from working.

### Files to Check/Modify
- `src/server/dev-init.ts`
- `src/server/vite-plugin.ts`
- `src/server/database/config/database.ts`
- `src/server/routes/auth.ts`

---

## Issue 3: Settings Not Working

### Root Cause Analysis

The settings pages are:
1. **Account Settings** (`/app/settings`) — personal info + password change
2. **Notification Settings** (`/app/settings/notifications`) — email notification preferences
3. **Appearance Settings** (`/app/settings/appearance`) — theme + language

Looking at the current code:
- `AppearanceSettingsView.vue` line 43 already uses `ds-locale` (correct key)
- `ui.ts` already has `initTheme()` that reads from localStorage
- `App.vue` already calls `uiStore.initTheme()` on mount

The theme persistence appears to already be fixed. But we need to verify:
1. **Theme**: Does the CSS actually respond to the `data-theme` attribute or `dark`/`light` class on `<html>`?
2. **Language**: Does changing language in settings actually persist and take effect on reload?
3. **Account settings**: Does saving personal info or changing password work?

### Plan

#### Step 1: Check CSS for theme support
Search `src/assets/main.css` for `data-theme` or `.dark`/`.light` class selectors to verify the theme CSS is properly defined.

#### Step 2: Verify theme application
Check that `initTheme()` in `ui.ts` properly applies the theme to the DOM on startup.

#### Step 3: Verify language persistence
Check that the language switcher in settings correctly saves to `ds-locale` and that `i18n.ts` reads from it on startup.

#### Step 4: Test account settings
Check if the save functionality in `SettingsView.vue` actually calls the API and updates the user.

#### Step 5: Fix any issues found
Address whatever is preventing settings from working.

### Files to Check/Modify
- `src/stores/ui.ts`
- `src/App.vue`
- `src/i18n.ts`
- `src/views/settings/AppearanceSettingsView.vue`
- `src/views/settings/SettingsView.vue`
- `src/assets/main.css` (for theme CSS rules)
- `src/views/settings/NotificationSettingsView.vue`

---

## Execution Order

1. **First**: Create the i18n sync script and fix ar.json translations
2. **Second**: Investigate and fix login (database initialization)
3. **Third**: Verify and fix settings (theme, language, account)
4. **Finally**: Run full verification of all three fixes

## Verification Checklist

- [ ] `pnpm i18n:sync` reports all locales in sync
- [ ] Arabic UI shows translated strings (no missing translation keys visible)
- [ ] Registration works — new user can create account
- [ ] Login works — user can sign in and reaches dashboard
- [ ] Demo login works (if demo users are seeded)
- [ ] Dark/Light theme toggle works and persists across page reloads
- [ ] Language switch works and persists across page reloads
- [ ] Account settings save works (name change, password change)
