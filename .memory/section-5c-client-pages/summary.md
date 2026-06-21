# Section 5c: Client Pages

## Task
Implement the three client pages listed in `docs/TODO.md` section 5c:
1. `ClientProfileView.vue` — Client profile view
2. `ClientSettingsView.vue` — Edit client profile and company info
3. `AgentDiscoveryView.vue` — Browse agents discovered via invite links

## Files Created

### Store
- `src/stores/clientProfile.ts` — Pinia store for client profile (fetchProfile, updateProfile). Mirrors the agentProfile store pattern. Uses `getMe()` from users service and extracts `clientProfile` from the response.

### Views
- `src/views/client/ClientProfileView.vue` — Displays client profile with hero section (avatar, name, "Client" badge), company info card (company name, size, industry), and edit profile CTA button. Uses `useClientProfileStore` and `useAuthStore`.
- `src/views/client/ClientSettingsView.vue` — Form with company name (BInput), company size (select), industry (select), and save button. Uses `useToast` for success/error feedback.
- `src/views/client/AgentDiscoveryView.vue` — Agent discovery page with search input, empty state, and agent card grid. The search/agents are stubbed (empty array) with a TODO comment for future API integration.

### Tests
- `tests/components/client/ClientProfileView.spec.ts` — 7 tests (container, loading, not found, hero, company info, empty state, edit button)
- `tests/components/client/ClientSettingsView.spec.ts` — 7 tests (container, title, subtitle, section, fields, save button, save action)
- `tests/components/client/AgentDiscoveryView.spec.ts` — 6 tests (container, title, subtitle, search input, empty state, search button)

## Files Modified

### Router
- `src/router/index.ts` — Added 3 new routes under `/app`:
  - `/app/client/profile` (name: `client-profile`, roles: `['client']`)
  - `/app/client/settings` (name: `client-settings`, roles: `['client']`)
  - `/app/discover` (name: `discover-agents`, roles: `['client']`)
  - Also restricted existing `/app/settings` route to `roles: ['agent']`

### Sidebar
- `src/components/layout/Sidebar.vue` — Added "Discover Agents" link (roles: `['client']`) to main links. Split settings link: agent settings at `/app/settings` (roles: `['agent']`), client settings at `/app/client/settings` (roles: `['client']`).

### i18n (all 3 locales)
- `src/locales/en.json` — Added `clientProfile` (view + settings), `agentDiscovery` sections, and `discover` sidebar key
- `src/locales/fr.json` — French translations for all new keys
- `src/locales/ar.json` — Arabic translations for all new keys

### Test fixes
- `tests/components/layout/Sidebar.spec.ts` — Added `vi.mock` for auth store (returns agent role), added missing routes (`/app/discover`, `/app/client/settings`), added `vi` import

### Documentation
- `docs/TODO.md` — Checked off all 3 items in section 5c

## Key Decisions
- Created a dedicated `clientProfile` store rather than extending `auth` store, following the same pattern as `agentProfile` store
- Restricted the existing `/app/settings` (AgentSettingsView) to agents only, since clients now have their own settings path
- AgentDiscoveryView is stubbed with empty agents array and a TODO comment — the API endpoint for agent search doesn't exist yet
- ClientProfile model fields are limited (companyName, companySize, industry) — no profile photo for clients in current schema

## Test Results
- All 69 test files pass (638 tests, 2 skipped)
- All 26 client-related tests pass across 4 test files

## TODO Status
Section 5c in `docs/TODO.md` is now fully checked off.
