# Task Summary: Fix Agent Profile Design & "Start a Mission" CTA

## Date: 2026-07-10

## Problem
The Agent Profile page (`src/views/agent/AgentProfileView.vue`) accessed via User → Search Agent → Show Profile had two issues:
1. **No styling** — Used `ds-agent-profile__*` classes but had zero matching CSS rules
2. **Dead "Start a Mission" button** — `<BButton>` had no `@click`, `to`, or `href` — clicking did nothing

## Solution Implemented (8 phases)

### 1. Backend — Client-created missions pre-assigned to an agent
- Extended `POST /api/missions` client path to accept optional `agentId`
- When provided: validates agent exists, checks seat limits, creates `status: 'pending_agreement'` mission, creates Conversation, notifies agent
- Same logic for bulk endpoint
- Existing open-mission flow (no `agentId`) unchanged

### 2. Frontend Service
- Added `agentId?: string` to `CreateMissionData` interface in `src/services/missions.ts`

### 3. MissionCreateView — Agent selector for clients
- Reads `agentId` from query param (`route.query.agentId`)
- Shows `<UserSelect role="agent">` when user is a client
- Pre-selects agent from query param
- Includes `agentId` in submit payload
- Shows different success toast for pre-assigned missions

### 4. AgentProfileView CTA
- Wired `<BButton>` with `:to="/app/missions/create?agentId={userId}"` (RouterLink via existing `BButton` component)
- Guarded CTA to show only for authenticated **clients** (agents don't hire agents)

### 5. Agent Profile Styling
- Added complete scoped `<style>` block covering all `ds-agent-profile__*` classes
- Hero section, badges, section cards, CTA, register prompt
- Uses design tokens from docs/UI.md
- Responsive: hero stacks vertically on mobile

### 6. i18n
- Added keys to all 3 locales (en/fr/ar):
  - `missions.create.fields.agent`, `agentPlaceholder`, `createdPreAssigned`
  - `agentProfile.view.startMissionHint`
  - `missions.detail.status` (also fixed missing key used in MissionAgreementView)

### 7. Tests
- Backend: 3 new tests for pre-assigned client missions (success 201, invalid agentId 404, non-agent 404)
- Frontend: 2 new tests for CTA link + client-only visibility

### 8. Verification
- All 37 tests pass (30 backend + 7 frontend)
- i18n sync clean across all 3 locales (1168 keys)

## Files Modified

| File | Change |
|------|--------|
| `src/server/routes/missions.ts` | Client path: optional `agentId` → `pending_agreement` mission; bulk path same |
| `src/services/missions.ts` | Added `agentId?` to `CreateMissionData` |
| `src/views/missions/MissionCreateView.vue` | Read `agentId` query param, added agent selector for clients, included in submit |
| `src/views/agent/AgentProfileView.vue` | Wired CTA to RouterLink with agentId, guarded for clients only, added scoped CSS |
| `src/locales/en.json` | New i18n keys + `missions.detail.status` |
| `src/locales/fr.json` | New i18n keys + `missions.detail.status` |
| `src/locales/ar.json` | New i18n keys + `missions.detail.status` |
| `tests/server/routes/missions.spec.ts` | 3 new tests for pre-assigned client missions |
| `tests/components/agent/AgentProfileView.spec.ts` | 2 new tests for CTA link + client-only visibility |

## Key Design Decisions
- Client-created missions with `agentId` go directly to `pending_agreement` (skips open/claim step) — minimizes user effort
- Seat limits checked at creation time when `agentId` is provided (consistent with agent-initiated flow)
- Agent validation: must have `role: 'agent'` to prevent clients from assigning to wrong users
- CTA only visible to clients — agents viewing other agent profiles have no meaningful CTA

## Tests
- 30 backend mission tests (3 new: pre-assigned success, invalid agentId, non-agent user)
- 7 frontend AgentProfileView tests (2 new: client CTA renders as link, agent CTA hidden)
- All tests pass

## No Risks/Issues
- Backward compatible: existing open-mission flow unchanged
- No database migration needed
- All existing tests continue to pass
