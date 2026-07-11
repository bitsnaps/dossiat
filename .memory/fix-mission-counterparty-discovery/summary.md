# Fix Mission Counterparty Discovery (Private Network Model)

## Problem
The `MissionCreateView.vue` exposed a `UserSelect` dropdown for **both** roles that listed **every** user of the opposite role via `GET /api/users/network`. This turned the mission create form into a global user picker, violating the PRD's "Private Network" model which states discovery must happen only via (a) the agent's invite link or (b) the client's "Discover Agents" feature.

The `/network` endpoint returned all clients/agents (`User.findAll({ where: { role: 'client' } })`) instead of only those with existing mission relationships.

## Solution
1. **Backend (`src/server/routes/users.ts`)**: Made `/network` endpoint relationship-based — agents see only clients they have missions with; clients see only agents they have missions with. Added `GET /api/users/:id` for minimal public user info.
2. **Frontend (`src/views/missions/MissionCreateView.vue`)**: Removed the client agent `UserSelect`. Clients arriving via `?agentId=` see a read-only agent name display. Clients without `?agentId=` get a radio choice: "Post open mission" (any agent claims) or "Browse agents" (navigates to `/app/discover`).
3. **Service (`src/services/users.ts`)**: Added `getUserById(id)` function.
4. **i18n**: Added 10 new keys to en/fr/ar for assignment mode, selected agent, open/browse hints.

## Files Changed
- `src/server/routes/users.ts` — `/network` relationship-based + `GET /:id` endpoint
- `src/views/missions/MissionCreateView.vue` — removed client agent UserSelect, added read-only display + assignment radio
- `src/services/users.ts` — `getUserById(id)` service
- `src/locales/en.json` — 10 new keys
- `src/locales/fr.json` — French translations
- `src/locales/ar.json` — Arabic translations

## Files Created
- `tests/server/routes/users.network.spec.ts` — 9 backend tests
- `tests/components/missions/MissionCreateView.spec.ts` — 11 frontend tests
- `plans/fix-mission-counterparty-discovery.md` — full implementation plan

## Test Results
- 130 test files passed, 1461 tests passed, 7 skipped, 0 failures
- `pnpm i18n:sync` — all locales in sync
- `pnpm lint` — no TypeScript errors

## Key Behavioral Changes
- Agent create form `UserSelect` now shows only network clients (relationship-based)
- Client create form: read-only agent display when `?agentId=` present; radio choice otherwise
- Agent empty network hints at invite link for onboarding
- Client "Browse agents" navigates to `/app/discover`
- All existing mission-creation backend paths unchanged (agent draft, client pre-assigned, client open)
