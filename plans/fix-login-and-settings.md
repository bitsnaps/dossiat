# Plan: Fix Login and Settings Glitches

## Problem Statement

Two categories of bugs prevent the application from functioning correctly in development:

1. **Login/Register don't work** — the SQLite database is never initialized, so all API calls that touch the database fail silently.
2. **Settings don't work** — the theme toggle (dark/light) has no visual effect, and the language switcher in settings doesn't persist across page reloads.

## Investigation Results

### Issue A: Login Not Working

**Root cause**: The Vite dev plugin at [`vite-plugin.ts`](src/server/vite-plugin.ts:1) serves the Hono API as middleware, but **never initializes the database**. When a user registers or logs in, Sequelize queries tables that don't exist in the SQLite file.

**Current flow**:
1. User submits login form → [`LoginView.vue`](src/views/auth/LoginView.vue:15) calls `authStore.login()`
2. Store calls [`apiLogin()`](src/services/auth.ts:21) → `POST /api/auth/login`
3. [`auth.ts`](src/server/routes/auth.ts:107) route does `User.findOne(...)` 
4. Sequelize queries the `users` table which **doesn't exist** → error
5. Error is caught but the user sees a generic "Login failed" message

**What exists but isn't used**:
- Migration file: [`20260614000000-initial-schema.cjs`](src/server/database/migrations/20260614000000-initial-schema.cjs) — creates all 20 tables
- Seeder: [`demo-users.ts`](src/server/database/seeders/helpers/demo-users.ts:72) — creates `agent-demo@dossiat.com` / `client-demo@dossiat.com` with password `Demo1234!`
- DB config: [`database.ts`](src/server/database/config/database.ts:27) — configures SQLite for dev
- npm scripts: `db:migrate`, `db:seed` — but these are manual CLI commands, nothing auto-runs them

### Issue B: Theme Not Working

**Root cause**: Two separate problems.

**B1 — Theme never applied to DOM**:
- [`AppearanceSettingsView.vue`](src/views/settings/AppearanceSettingsView.vue:40) calls `uiStore.setTheme(selectedTheme.value)`
- [`ui.ts`](src/stores/ui.ts:38) `setTheme()` only sets `theme.value = newTheme` — it does **nothing** to the DOM
- No CSS class, no `data-theme` attribute, nothing changes visually

**B2 — Theme not restored on page load**:
- [`ui.ts`](src/stores/ui.ts:8) hardcodes `const theme = ref<'dark' | 'light'>('dark')` — never reads localStorage
- After saving "light" theme and reloading, it defaults back to "dark"

### Issue C: Language Not Persisting from Settings

**Root cause**: localStorage key mismatch.

| Component | Reads/Writes Key | Direction |
|-----------|-----------------|-----------|
| [`i18n.ts`](src/i18n.ts:8) | `ds-locale` | Read on startup |
| [`useDirection.ts`](src/composables/useDirection.ts:15) | `ds-locale` | Write on locale change |
| [`AppearanceSettingsView.vue`](src/views/settings/AppearanceSettingsView.vue:43) | `dossiat-locale` | Write on save |

The settings page writes to `dossiat-locale` but the app reads from `ds-locale`. The language change works within the session (via `locale.value = selectedLanguage.value`) but doesn't survive a page reload.

## Implementation Steps

### Step 1: Create Database Initialization Module

Create `src/server/dev-init.ts` — a module that handles one-time database setup:

```ts
import sequelize from './database/config/database'
import './database/models' // registers all models
import { User } from './database/models'
import { createDemoUsers } from './database/seeders/helpers/demo-users'

let initialized = false

export async function initDevDatabase() {
  if (initialized) return
  initialized = true

  // Create tables if they don't exist (safe for SQLite dev)
  await sequelize.sync({ alter: true })

  // Seed demo users if database is empty
  const userCount = await User.count()
  if (userCount === 0) {
    await createDemoUsers()
    console.log('[dev-init] Demo users created')
  }
}
```

**Why `sync({ alter: true })`**: In development with SQLite, `alter: true` ensures the schema stays in sync with the model definitions without destructive drops. It's idempotent and safe for local dev.

### Step 2: Call Initialization from Vite Plugin

Update [`vite-plugin.ts`](src/server/vite-plugin.ts:1) to call the init function once before the first API request:

```ts
let dbInitialized = false

// Inside configureServer, in the middleware:
if (!dbInitialized) {
  dbInitialized = true
  try {
    const { initDevDatabase } = await import('./dev-init')
    await initDevDatabase()
  } catch (err) {
    console.error('[dev-init] Database initialization failed:', err)
  }
}
```

**Important**: The import path `./dev-init` should be relative from the plugin file location, or use the `@/` alias. Since this runs in Vite's SSR loader context, the `@/` alias should work.

### Step 3: Fix Theme Persistence in `ui.ts`

Update [`ui.ts`](src/stores/ui.ts) to:

1. **Read theme from localStorage on initialization**:
```ts
const theme = ref<'dark' | 'light'>(
  (localStorage.getItem('dossiat-theme') as 'dark' | 'light') || 'dark'
)
```

2. **Apply theme to DOM in `setTheme()`**:
```ts
function setTheme(newTheme: 'dark' | 'light') {
  theme.value = newTheme
  applyThemeToDom(newTheme)
  localStorage.setItem('dossiat-theme', newTheme)
}

function applyThemeToDom(newTheme: 'dark' | 'light') {
  document.documentElement.setAttribute('data-theme', newTheme)
  document.documentElement.classList.remove('dark', 'light')
  document.documentElement.classList.add(newTheme)
}
```

3. **Add an `initTheme()` function** for use in App.vue:
```ts
function initTheme() {
  const saved = localStorage.getItem('dossiat-theme') as 'dark' | 'light' | null
  const resolved = saved || 'dark'
  theme.value = resolved
  applyThemeToDom(resolved)
}
```

4. **Export `initTheme`** from the store return.

### Step 4: Initialize Theme in App.vue

Update [`App.vue`](src/App.vue:1) to call `initTheme()` on mount:

```vue
<script lang="ts" setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()

onMounted(() => {
  uiStore.initTheme()
})
</script>
```

### Step 5: Fix Language Key Mismatch

Update [`AppearanceSettingsView.vue`](src/views/settings/AppearanceSettingsView.vue:43):

```diff
- localStorage.setItem('dossiat-locale', selectedLanguage.value)
+ localStorage.setItem('ds-locale', selectedLanguage.value)
```

This aligns with:
- [`i18n.ts`](src/i18n.ts:8): `localStorage.getItem('ds-locale')`
- [`useDirection.ts`](src/composables/useDirection.ts:15): `localStorage.setItem('ds-locale', newLocale)`

### Step 6: Verification

1. **Login test**: Start dev server → register a new user → login → confirm redirect to dashboard
2. **Demo login test**: Login with `agent-demo@dossiat.com` / `Demo1234!` → confirm works
3. **Theme test**: Settings → Appearance → switch to Light → reload page → confirm still Light
4. **Theme test 2**: Switch back to Dark → reload → confirm still Dark
5. **Language test**: Settings → Appearance → switch to Arabic → reload → confirm Arabic persists
6. **Language test 2**: Switch to French → confirm French persists after reload

## Files Modified

| File | Change Type |
|------|------------|
| `src/server/dev-init.ts` | NEW — one-time database initialization module |
| `src/server/vite-plugin.ts` | Add database init call before first API request |
| `src/stores/ui.ts` | Read theme from localStorage, apply to DOM, export `initTheme()` |
| `src/App.vue` | Call `uiStore.initTheme()` on mount |
| `src/views/settings/AppearanceSettingsView.vue` | Fix localStorage key `dossiat-locale` → `ds-locale` |
