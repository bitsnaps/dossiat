# Plan: Fix i18n Translations — Discover and Fix Missing Keys

## Problem Statement

The application supports 3 languages: English (`en`), French (`fr`), and Arabic (`ar`). The Arabic locale file is missing 2 entire top-level sections (`common` and `settings`), causing components that reference these keys to display raw key strings or fail silently. There is also no automated way to detect and prevent these mismatches in the future.

## Investigation Results

### Missing Sections in `ar.json`

The `en.json` file has **1055 lines**. The `fr.json` file also has **1055 lines** and matches all keys. The `ar.json` file has only **948 lines** and is missing:

**1. `common` section** (lines 948–1003 in `en.json`) — used by:
- [`StatusBadge.vue`](src/components/common/StatusBadge.vue) — `common.status.mission.*`, `common.status.payment.*`, `common.status.subscription.*`
- [`EmptyState.vue`](src/components/common/EmptyState.vue) — `common.emptyState.*`
- [`LoadingSpinner.vue`](src/components/common/LoadingSpinner.vue) — `common.loading`
- [`Pagination.vue`](src/components/common/Pagination.vue) — `common.pagination.*`
- [`SearchInput.vue`](src/components/common/SearchInput.vue) — `common.search.*`
- [`ConfirmDialog.vue`](src/components/common/ConfirmDialog.vue) — `common.confirm.*`
- [`FileUpload.vue`](src/components/common/FileUpload.vue) — `common.fileUpload.*`
- [`Breadcrumb.vue`](src/components/common/Breadcrumb.vue) — `common.breadcrumb.*`

**2. `settings` section** (lines 1004–1054 in `en.json`) — used by:
- [`SettingsLayout.vue`](src/views/settings/SettingsLayout.vue:9) — `settings.nav.*`
- [`SettingsView.vue`](src/views/settings/SettingsView.vue:86) — `settings.account.*`
- [`NotificationSettingsView.vue`](src/views/settings/NotificationSettingsView.vue:39) — `settings.notifications.*`
- [`AppearanceSettingsView.vue`](src/views/settings/AppearanceSettingsView.vue:53) — `settings.appearance.*`

### Secondary Issue: Locale Key Mismatch

In [`AppearanceSettingsView.vue`](src/views/settings/AppearanceSettingsView.vue:43):
```js
localStorage.setItem('dossiat-locale', selectedLanguage.value)
```

But [`i18n.ts`](src/i18n.ts:8) reads from `ds-locale`:
```js
locale: localStorage.getItem('ds-locale') || 'en',
```

And [`useDirection.ts`](src/composables/useDirection.ts:15) also writes to `ds-locale`:
```js
localStorage.setItem('ds-locale', newLocale)
```

This means changing language via the settings page has no effect on page reload.

## Implementation Steps

### Step 1: Create `scripts/sync-i18n.mjs`

Create a reusable Node.js script at `scripts/sync-i18n.mjs` that:

1. Reads all `.json` files from `src/locales/`
2. Uses `en.json` as the source of truth (reference locale)
3. Recursively extracts all nested keys from each locale
4. Compares every other locale against `en.json`:
   - Reports **missing keys** (in `en.json` but not in locale)
   - Reports **extra keys** (in locale but not in `en.json`)
5. With `--fix` flag: adds missing keys with empty string values
6. Logs a clear, formatted report
7. Exits with code 1 if issues found (CI-friendly)

**Key design decisions**:
- Script should use only Node.js built-ins (no third-party deps)
- Should handle nested objects recursively
- Should preserve existing translations and key ordering
- Should be idempotent (running twice produces same result)

### Step 2: Add `i18n:sync` script to `package.json`

```json
"i18n:sync": "node scripts/sync-i18n.mjs",
"i18n:sync:fix": "node scripts/sync-i18n.mjs --fix"
```

### Step 3: Run the script to populate `ar.json`

Run with `--fix` to add the missing `common` and `settings` sections with empty string values.

### Step 4: Translate all empty values in `ar.json`

Manually translate every empty string value added in Step 3 to proper Arabic. This includes:

**`common` section keys to translate** (30+ keys):
- `common.status.mission.*` (7 keys) — mission status labels
- `common.status.payment.*` (6 keys) — payment status labels
- `common.status.subscription.*` (5 keys) — subscription status labels
- `common.emptyState.*` (4 keys) — empty state messages
- `common.loading` — "Loading..."
- `common.pagination.*` (3 keys) — prev, next, ellipsis
- `common.search.placeholder` — search placeholder
- `common.confirm.*` (2 keys) — confirm/cancel buttons
- `common.fileUpload.*` (4 keys) — file upload labels
- `common.breadcrumb.home` — "Home"

**`settings` section keys to translate** (30+ keys):
- `settings.title`, `settings.nav.*` (3 keys) — page title and nav tabs
- `settings.account.*` (12 keys) — account settings form
- `settings.notifications.*` (11 keys) — notification preferences
- `settings.appearance.*` (7 keys) — theme and language settings

### Step 5: Fix locale key mismatch in `AppearanceSettingsView.vue`

Change in [`AppearanceSettingsView.vue`](src/views/settings/AppearanceSettingsView.vue:43):
```js
// Before:
localStorage.setItem('dossiat-locale', selectedLanguage.value)

// After:
localStorage.setItem('ds-locale', selectedLanguage.value)
```

This makes the settings page write to the same key that [`i18n.ts`](src/i18n.ts:8) reads from on startup.

### Step 6: Verify

1. Run `pnpm i18n:sync` — should report 0 missing keys
2. Switch to Arabic in settings — should persist after page reload
3. Verify all Arabic pages render translated text (not raw keys)

## Files Modified

| File | Change Type |
|------|------------|
| `scripts/sync-i18n.mjs` | NEW — reusable i18n sync script |
| `package.json` | Add `i18n:sync` and `i18n:sync:fix` scripts |
| `src/locales/ar.json` | Add `common` and `settings` sections with Arabic translations |
| `src/views/settings/AppearanceSettingsView.vue` | Fix localStorage key `dossiat-locale` → `ds-locale` |
