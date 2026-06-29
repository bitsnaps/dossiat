# Section 5a–5b — Dashboard & Agent Profile Pages

## Task Summary

Implemented role-aware dashboard views (agent and client), agent onboarding wizard, public agent profile view, agent settings page, and invite link sharing component. Created a dedicated agentProfile Pinia store and added full i18n support (en/fr/ar). All implemented with 39 new Vitest tests, 66 test files passing with 618 tests total.

## Files Created

### Views
- `src/views/DashboardView.vue` — Refactored from placeholder to role-aware dispatcher (renders AgentDashboard or ClientDashboard based on user role)
- `src/views/agent/AgentDashboard.vue` — Agent dashboard with 4 stat cards (active missions, credit balance, unread messages, pending agreements), active missions list, profile setup alert, and quick actions
- `src/views/client/ClientDashboard.vue` — Client dashboard with 4 stat cards (active missions, pending agreements, unread messages, total spending), pending agreements list, missions list, recent payments list
- `src/views/agent/AgentProfileSetup.vue` — 5-step onboarding wizard: Basics (bio, timezone, currency) → Specialties (checkbox selection) → Client Types (B2B/B2C/Both) → Photo upload → Review & submit
- `src/views/agent/AgentProfileView.vue` — Public agent profile with progressive visibility (limited for visitors, full for owner, CTA for authenticated clients)
- `src/views/agent/AgentSettingsView.vue` — Edit agent profile (bio, timezone, currency, specialties, client types, avatar) with InviteLinkShare component

### Components
- `src/components/agent/InviteLinkShare.vue` — Display full invite URL, copy to clipboard, share via WhatsApp/email, regenerate link with confirmation dialog

### Store
- `src/stores/agentProfile.ts` — Pinia store for agent profile state: fetchProfile, updateProfile, regenerateInviteLink, uploadAvatar, fetchPublicProfile, clearPublicProfile; computed: isComplete, inviteLink

### Modified Files
- `src/services/users.ts` — Fixed API paths to include `/users/` prefix (matching server route mounting), fixed FormData field name (`avatar` instead of `file`), added `generateInviteLink()` function
- `src/router/index.ts` — Added `/app/onboarding` (agent-only), updated `/app/settings` to use AgentSettingsView, added public `/agents/:slug` route
- `src/locales/en.json` — Added `dashboard.*` and `agentProfile.*` translation namespaces
- `src/locales/fr.json` — Added auth, layout, dashboard, and agentProfile translations
- `src/locales/ar.json` — Added auth, layout, dashboard, and agentProfile translations
- `docs/TODO.md` — Checked off all 5a and 5b items

### Test Files (39 new tests)
- `tests/components/DashboardView.spec.ts` — 6 tests (container, welcome title, role-based rendering)
- `tests/components/agent/AgentDashboard.spec.ts` — 6 tests (container, stat cards, labels, empty states, quick actions)
- `tests/components/agent/AgentProfileSetup.spec.ts` — 8 tests (card, title, progress bar, step 1, navigation)
- `tests/components/agent/AgentProfileView.spec.ts` — 5 tests (container, loading, not found, hero, specialties)
- `tests/components/agent/InviteLinkShare.spec.ts` — 8 tests (container, URL display, buttons, readonly, regenerate)
- `tests/components/client/ClientDashboard.spec.ts` — 6 tests (container, stat cards, labels, empty states, payments)

### Modified Test Files
- `tests/router/router.spec.ts` — Added onboarding route definition, agent-profile public route, role meta test, unauthenticated access test
- `tests/services/users.spec.ts` — Fixed expected API paths for getAgentProfile and updateAgentProfile

## Test Results

- 66 test files pass with 618 tests passing (2 skipped)
- 39 new tests added across 6 new test files
- 2 pre-existing test failures fixed (service path assertions in users.spec.ts)
- No regressions in existing tests

## Design Decisions

1. **Role-based dashboard dispatch** — `DashboardView.vue` checks `authStore.hasRole()` and renders the appropriate sub-component. This avoids route duplication and keeps the dashboard route simple.

2. **Dedicated agentProfile store** — Separate from the auth store because agent profile data (bio, specialties, currency, uniqueInviteSlug, profilePhotoUrl) has its own lifecycle and API endpoints.

3. **Progressive visibility** — `AgentProfileView.vue` shows limited info (name, bio, specialties, accepted client types) to unauthenticated visitors, full data including currency for the profile owner, and a "Start Mission" CTA for authenticated clients.

4. **Public route outside /app prefix** — `/agents/:slug` lives outside the `/app` layout since it's accessible to non-authenticated visitors. The route doesn't require `AppLayout`.

5. **API path corrections** — The service functions in `users.ts` had paths like `/agents/me` and `/agents/:slug` that didn't account for the server mounting at `/api/users`. Fixed to `/users/agents/me` and `/users/agents/:slug`. Also fixed `uploadAvatar` FormData field name from `file` to `avatar` to match the server route.

6. **Wizard approach** — `AgentProfileSetup.vue` uses a local `currentStep` ref with validation per step rather than a complex wizard library. Each step validates before advancing.

7. **InviteLinkShare** — Reusable component that accepts a `slug` prop and generates the full URL using `window.location.origin`. Uses the existing `useCopyToClipboard` composable for copy functionality.

## Issues Encountered

- **Shell integration error** — One terminal command failed due to shell integration. Resolved by retrying the command.
- **Test mocking with Pinia** — `AgentProfileView.spec.ts` tests had issues with `require()` not working in ESM mode. Resolved by using a factory function (`mockStoreFactory`) pattern instead of direct `require()`.
- **UseCopyToClipboard mock** — The `copied` ref needed to be a real Vue `ref` in the mock, not a plain object `{ value: false }`, otherwise the template reactivity didn't work.
