# Section 9: Business Logic & Rules — Implementation Plan

> Implementation plan for the 7 remaining unchecked items in Section 9 of `docs/TODO.md`.

---

## Overview

| # | Task | Scope | Key Files |
|---|------|-------|-----------|
| 1 | Progressive profile visibility | Backend + Frontend + Tests | `users.ts`, `AgentProfileView.vue` |
| 2 | Mission agreement dual-party workflow | Migration + Model + Route + Frontend + Tests | `missions.ts`, `MissionAgreementView.vue` |
| 3 | Recurrent mission auto-generation hardening | Shared util + Scheduler + Tests | `scheduler.ts`, `recurrence.ts` |
| 4 | Seat limit enforcement per tier | Helper service + Route guard + Tests | `missions.ts`, new `subscriptionGuard.ts` |
| 5 | Recurring mission limit per tier | Route validation + Tests | `recurrence.ts` |
| 6 | CSV bulk mission creation for Enterprise | Route + Frontend + Tests | `missions.ts`, new view |
| 7 | Agent billing cycle and invoice generation | Extract service + Tests | `scheduler.ts`, new `billingService.ts` |

---

## Task 1: Progressive Profile Visibility

**Goal**: Unauthenticated visitors see a limited profile. Registered users see the full profile.

### Current State
- [`GET /api/users/agents/:slug`](src/server/routes/users.ts:91) already hides `currency` for non-owners
- [`AgentProfileView.vue`](src/views/agent/AgentProfileView.vue) shows a CTA button only for authenticated non-owners
- No distinction between unauthenticated visitors and authenticated non-owners

### Changes

**Backend** — [`src/server/routes/users.ts`](src/server/routes/users.ts:91)
- When `auth` is null (unauthenticated):
  - Return only: `id`, `bio`, `specialties`, `acceptedClientTypes`, `profilePhotoUrl`, `user.firstName`, `user.lastName`
  - Hide: `currency`, `timezone`, `user.email`
- When `auth` is present but not the owner:
  - Return all fields except `currency`
- When `auth` is the owner:
  - Return everything

**Frontend** — [`src/views/agent/AgentProfileView.vue`](src/views/agent/AgentProfileView.vue)
- Add `isUnauthenticated` computed from `authStore.isAuthenticated`
- When unauthenticated: show a "Register to see full profile" banner and hide certain sections (timezone, email)
- Show a registration CTA at the top of the profile

**Tests**
- Backend: Add tests in `tests/server/routes/users.spec.ts` (create if not exists) or add to existing test file
  - Test unauthenticated response omits email, currency, timezone
  - Test authenticated non-owner gets full profile except currency
  - Test owner gets everything
- Frontend: Update `tests/components/agent/AgentProfileView.spec.ts`

---

## Task 2: Mission Agreement Dual-Party Workflow

**Goal**: Both agent AND client must independently check all boxes before mission transitions to `agreed`.

### Current State
- [`POST /api/missions/:id/agree`](src/server/routes/missions.ts:176) immediately transitions to `agreed` — the comment says "simplified"
- No tracking of who has agreed
- [`MissionAgreementView.vue`](src/views/missions/MissionAgreementView.vue) lets one user agree

### Changes

**DB Migration** — New file `src/server/database/migrations/20260701000000-add-agreement-tracking.cjs`
- Add `agreed_by_agent` (BOOLEAN, default false) to `missions` table
- Add `agreed_by_client` (BOOLEAN, default false) to `missions` table

**Model** — [`src/server/database/models/index.ts`](src/server/database/models/index.ts:239)
- Add `agreedByAgent: boolean` and `agreedByClient: boolean` to `MissionModel` interface and class
- Add to `Mission.init()` schema
- Add to `MissionCreationAttributes` as optional with defaults

**Backend Route** — [`src/server/routes/missions.ts`](src/server/routes/missions.ts:176)
- Rewrite `POST /api/missions/:id/agree`:
  - Validate mission is in `pending_agreement` status
  - Set `agreedByAgent = true` if caller is the agent, `agreedByClient = true` if caller is the client
  - Only transition status to `agreed` when **both** `agreedByAgent` and `agreedByClient` are true
  - Notify the other party each time one party agrees
- Add new endpoint `GET /api/missions/:id/agreement-status`:
  - Returns `{ agreedByAgent, agreedByClient, bothAgreed }`

**Frontend Service** — [`src/services/missions.ts`](src/services/missions.ts)
- Add `getAgreementStatus(id: string)` function

**Frontend Store** — [`src/stores/missions.ts`](src/stores/missions.ts)
- Add `agreementStatus` ref
- Add `fetchAgreementStatus(id)` action
- Add `agreementStatus` to returned state

**Frontend View** — [`src/views/missions/MissionAgreementView.vue`](src/views/missions/MissionAgreementView.vue)
- Fetch agreement status on mount
- Show visual indicator: "Agent: ✅ Agreed" / "Client: ⏳ Pending" (or vice versa)
- Disable the "Confirm Agreement" button after this party has agreed (show "Waiting for other party...")
- Show a success message when both parties have agreed

**Tests**
- Backend: Add tests in `tests/server/routes/missions.spec.ts`
  - Agent agrees alone → status stays `pending_agreement`, `agreedByAgent = true`
  - Client agrees alone → status stays `pending_agreement`, `agreedByClient = true`
  - Both agree → status becomes `agreed`
  - Cannot agree on non-`pending_agreement` mission
  - Cannot agree if not a participant
- Frontend: Update `tests/components/missions/MissionChecklist.spec.ts`

---

## Task 3: Recurrent Mission Auto-Generation Hardening

**Goal**: Fix edge cases in date calculation, share logic, and ensure generated missions include conversations.

### Current State
- [`calculateNextRun()`](src/server/routes/recurrence.ts:9) is duplicated in both [`recurrence.ts`](src/server/routes/recurrence.ts:9) and [`scheduler.ts`](netlify/functions/scheduler.ts:238)
- Generated missions in scheduler don't create a `Conversation` record
- Edge cases not handled: month-end overflow (e.g., 31st in February)

### Changes

**Shared Utility** — New file `src/server/utils/dateUtils.ts`
- Extract `calculateNextRun()` into this shared module
- Fix edge cases:
  - Monthly: clamp `dayOfMonth` to last day of the target month (e.g., Jan 31 → Feb 28)
  - Weekly: ensure proper interval multiplication

**Backend Route** — [`src/server/routes/recurrence.ts`](src/server/routes/recurrence.ts:9)
- Replace local `calculateNextRun` with import from `@/server/utils/dateUtils`

**Scheduler** — [`netlify/functions/scheduler.ts`](netlify/functions/scheduler.ts:238)
- Replace local `calculateNextRun` with import from `@/server/utils/dateUtils`
- Add `Conversation.create({ missionId: newMission.id })` after mission creation

**Tests** — New file `tests/server/utils/dateUtils.spec.ts`
- Test daily interval
- Test weekly with specific day of week
- Test monthly with day of month
- Test monthly with day 31 in short months (Feb, Apr, etc.)
- Test annual interval
- Test interval > 1 for each frequency

**Tests** — Update `tests/server/integration/mission-lifecycle.spec.ts`
- Verify generated recurrent missions have conversations

---

## Task 4: Seat Limit Enforcement Per Tier

**Goal**: Limit the number of unique agents a client can have active missions with based on their subscription tier.

### Current State
- [`SubscriptionPlan.maxSeats`](src/server/database/models/index.ts:705): Small Business=3, Professional=10, Enterprise=-1 (unlimited)
- No enforcement exists anywhere

### Changes

**Helper Service** — New file `src/server/services/subscriptionGuard.ts`
- `checkSeatLimit(clientUserId: number): Promise<{ allowed: boolean; current: number; max: number }>`
  - Look up the client's `ClientProfile` → `Subscription` → `SubscriptionPlan`
  - If no subscription, default to Small Business limits
  - Count distinct agents the client has non-cancelled missions with
  - Compare against `maxSeats` (-1 = unlimited)

**Backend Route** — [`src/server/routes/missions.ts`](src/server/routes/missions.ts:57)
- In `POST /api/missions`, after auth check:
  - Call `checkSeatLimit(auth.userId)` for client role (note: currently only agents create missions, but this is a guard for when clients create them too)
  - Actually, looking at the code, agents create missions. So the seat limit should be checked on the **client** side — how many unique agents the client already has missions with
  - The client is identified by `body.clientId` in the create mission request
  - Add validation: `await checkSeatLimit(body.clientId)` and throw 403 if limit reached

**Frontend** — No changes needed (the API will reject and the error message will surface)

**Tests** — Add to `tests/server/routes/missions.spec.ts`
- Client at seat limit (3 agents) → creating mission with 4th agent returns 403
- Client under seat limit → creates mission successfully
- Enterprise tier (-1) → always allowed
- No subscription → defaults to Small Business limits

---

## Task 5: Recurring Mission Limit Per Tier

**Goal**: Small Business clients are limited to 10 active recurring missions per month. Professional and Enterprise are unlimited.

### Current State
- [`SubscriptionPlan.maxRecurrentMissions`](src/server/database/models/index.ts:706): Small Business=10, Professional=-1, Enterprise=-1
- No enforcement in the recurrence creation route

### Changes

**Backend Route** — [`src/server/routes/recurrence.ts`](src/server/routes/recurrence.ts:76)
- In `POST /missions/:id/recurrence`, before creating the config:
  - Look up the client of this mission
  - Look up their subscription plan
  - If `maxRecurrentMissions !== -1`:
    - Count active `RecurrentMissionConfig` entries for missions belonging to this client
    - If count >= `maxRecurrentMissions`, throw `AppError('Recurring mission limit reached for your plan', 403)`

**Tests** — New file or add to `tests/server/routes/recurrence.spec.ts` (create if not exists)
- Small Business client with 10 active recurrences → 11th fails
- Small Business client with 9 → 10th succeeds
- Professional client → no limit enforced
- Enterprise client → no limit enforced
- No subscription → defaults to Small Business limits

---

## Task 6: CSV Bulk Mission Creation for Enterprise Tier

**Goal**: Enterprise clients can upload a CSV file to create multiple missions at once.

### Current State
- Enterprise plan has `csv_import: true` in features
- No CSV import exists anywhere

### Changes

**Backend Route** — Add to [`src/server/routes/missions.ts`](src/server/routes/missions.ts)
- New endpoint: `POST /api/missions/bulk`
  - Authenticate, roleGuard('client' or 'agent')
  - Accept JSON body: `{ missions: [{ title, clientId?, pricingType, agreedAmount?, currency?, agreedChecklist?, description? }] }`
  - Validate the user's subscription has `csv_import: true` feature (or is Enterprise)
  - Validate each mission entry has required fields
  - Create all missions in a Sequelize transaction
  - Create a `Conversation` for each mission
  - Return created missions with count
  - Max 100 missions per bulk request

**Frontend Service** — [`src/services/missions.ts`](src/services/missions.ts)
- Add `createBulkMissions(missions: CreateMissionData[])` function

**Frontend Store** — [`src/stores/missions.ts`](src/stores/missions.ts)
- Add `createBulkMissions(data)` action

**Frontend View** — New file `src/views/missions/BulkMissionCreateView.vue`
- CSV file upload with drag-and-drop
- Parse CSV client-side (simple implementation: read file, split by newlines, parse headers)
- Show preview table of parsed missions
- Confirm button to submit
- Show success/error results

**Frontend Route** — [`src/router/index.ts`](src/router/index.ts)
- Add route: `/app/missions/bulk` → `BulkMissionCreateView.vue`

**Frontend Navigation** — [`src/components/layout/Sidebar.vue`](src/components/layout/Sidebar.vue)
- Add "Bulk Create" link in the missions section (visible only to Enterprise clients)

**i18n** — [`src/locales/en.json`](src/locales/en.json), [`src/locales/fr.json`](src/locales/fr.json), [`src/locales/ar.json`](src/locales/ar.json)
- Add translation keys for bulk creation UI

**Tests**
- Backend: Add tests in `tests/server/routes/missions.spec.ts`
  - Enterprise client uploads 5 missions → all created
  - Non-Enterprise client → 403
  - Invalid CSV data → 422
  - Empty array → 422
  - Over 100 missions → 422
- Frontend: New `tests/components/missions/BulkMissionCreateView.spec.ts`

---

## Task 7: Agent Billing Cycle and Invoice Generation

**Goal**: Verify and test the invoice generation logic in the scheduler.

### Current State
- [`scheduler.ts`](netlify/functions/scheduler.ts:120) already generates invoices at billing cycle end
- Logic: finds confirmed payments for each agent in the billing period, sums platform fees, deducts from credits if sufficient, creates Invoice record

### Changes

**Extract Service** — New file `src/server/services/billing.ts`
- `generateAgentInvoices(billingCycleStart: Date, billingCycleEnd: Date): Promise<{ agentId: number; invoiceId: number; status: string }[]>`
  - Move the invoice generation logic from scheduler into this testable function
  - Return results for testing

**Scheduler** — [`netlify/functions/scheduler.ts`](netlify/functions/scheduler.ts:120)
- Replace inline invoice logic with call to `generateAgentInvoices()`

**Tests** — New file `tests/server/services/billing.spec.ts`
- Agent with confirmed payments in the period → invoice generated
- Agent with no payments → no invoice
- Agent with sufficient credits → invoice marked as paid, credits deducted
- Agent with insufficient credits → invoice marked as sent
- No duplicate invoices for same period
- Multiple agents processed correctly

---

## Regression Prevention Strategy

1. **Run full test suite** after each task: `pnpm test`
2. **Run type checking**: `pnpm type-check`
3. **Run existing tests first** to establish baseline — confirm all pass before starting
4. **Each task is self-contained** — implement and test one at a time
5. **DB migration** for Task 2 must be backward-compatible (add columns with defaults)
6. **No breaking API changes** — all new endpoints are additive; existing endpoints only gain new fields

---

## Execution Order

Tasks are ordered by dependency:

1. **Task 3** (date utils) — no dependencies, shared utility used by Task 5
2. **Task 1** (progressive visibility) — no dependencies, standalone
3. **Task 2** (agreement workflow) — DB migration needed, standalone
4. **Task 7** (billing service) — extract and test existing logic
5. **Task 4** (seat limits) — needs subscription model, standalone
6. **Task 5** (recurring limits) — depends on Task 3 (shared util)
7. **Task 6** (CSV bulk) — most complex, do last
