# Section 5i — Disputes Frontend

## Summary

Implemented the complete disputes frontend layer for the Dossiat platform, completing Section 5i TODO items. The backend was already fully implemented — this task built the Pinia store, three Vue views, i18n translations, router updates, and comprehensive tests.

## What Was Done

### Service Layer
- Added `createDispute(missionId, reason)` → `POST /missions/:missionId/dispute` to [`src/services/disputes.ts`](src/services/disputes.ts) — was the only missing function.

### Store
- Created [`src/stores/disputes.ts`](src/stores/disputes.ts) — Pinia store with:
  - `disputes`, `currentDispute`, `loading`, `error` state
  - Actions: `fetchDisputes`, `fetchDispute`, `sendMessage`, `resolveDispute`, `escalateDispute`, `createDispute`
  - Exported `Dispute` and `DisputeMessage` interfaces

### i18n
- Added `disputes` namespace (~50 keys) to all 3 locale files: [`src/locales/en.json`](src/locales/en.json), [`src/locales/fr.json`](src/locales/fr.json), [`src/locales/ar.json`](src/locales/ar.json)
- Keys cover: list page, detail page, initiate form, status labels, modal strings, validation messages

### Views Created (3)
1. **[`DisputeListView.vue`](src/views/disputes/DisputeListView.vue)** — Paginated dispute list with status badges (color-coded), mission title, initiator name, empty state, "Initiate Dispute" button
2. **[`DisputeDetailView.vue`](src/views/disputes/DisputeDetailView.vue)** — Reconciliation room: info cards (mission, initiator, reason), message thread using [`MessageBubble`](src/components/messaging/MessageBubble.vue), [`MessageComposer`](src/components/messaging/MessageComposer.vue), resolve modal with textarea, escalate button, conditional action buttons based on status
3. **[`DisputeInitiateView.vue`](src/views/disputes/DisputeInitiateView.vue)** — Form with mission select (filtered to in_progress/completed/agreed), reason textarea, validation, supports `?missionId=` query param for auto-fill

### Router
- Updated [`src/router/index.ts`](src/router/index.ts):
  - `/app/disputes` → `DisputeListView.vue` (was placeholder `DashboardView`)
  - `/app/disputes/initiate` → `DisputeInitiateView.vue` (new)
  - `/app/disputes/:id` → `DisputeDetailView.vue` (new)

### Tests (5 spec files, 37 tests)
- [`tests/stores/disputes.spec.ts`](tests/stores/disputes.spec.ts) — 13 tests (initial state, all 6 actions success/failure)
- [`tests/components/disputes/DisputeListView.spec.ts`](tests/components/disputes/DisputeListView.spec.ts) — 5 tests
- [`tests/components/disputes/DisputeDetailView.spec.ts`](tests/components/disputes/DisputeDetailView.spec.ts) — 7 tests
- [`tests/components/disputes/DisputeInitiateView.spec.ts`](tests/components/disputes/DisputeInitiateView.spec.ts) — 6 tests
- Updated [`tests/services/disputes.spec.ts`](tests/services/disputes.spec.ts) — added 1 `createDispute` test (total 6)

## Issues Encountered & Fixes

1. **BButton `warning` variant**: BButton only supports `accent | outline | gradient | ghost | danger`. Changed escalate button from `variant="warning"` to `variant="outline"`.

2. **BModal `open` vs `modelValue` prop**: BModal uses `modelValue` (v-model pattern), not `open`. Fixed to use `:modelValue` + `@update:modelValue`.

3. **MessageBubble `conversationId` type mismatch**: Dispute messages have `disputeId` not `conversationId`. Used spread mapping `{ ...msg, conversationId: msg.disputeId } as any` to bridge the types.

4. **Store error tests re-throw**: `sendMessage`, `resolveDispute`, `escalateDispute`, `createDispute` all re-throw after setting error. Initial tests used bare `await` without catching. Fixed to use `await expect(...).rejects.toThrow()`.

5. **i18n key missing in test env**: Tests use a mock i18n that doesn't include dispute keys — this causes stderr warnings but tests still pass. Not a real issue since the full app i18n includes all keys.

## Files Modified
- `src/services/disputes.ts`
- `src/router/index.ts`
- `docs/TODO.md`
- `src/locales/en.json`, `src/locales/fr.json`, `src/locales/ar.json`
- `tests/services/disputes.spec.ts`
- `tests/stores/disputes.spec.ts` (new)

## Files Created
- `src/stores/disputes.ts`
- `src/views/disputes/DisputeListView.vue`
- `src/views/disputes/DisputeDetailView.vue`
- `src/views/disputes/DisputeInitiateView.vue`
- `tests/components/disputes/DisputeListView.spec.ts`
- `tests/components/disputes/DisputeDetailView.spec.ts`
- `tests/components/disputes/DisputeInitiateView.spec.ts`
- `plans/section-5i-disputes.md`

## Test Results
All 37 new dispute tests passing. 844 existing tests passing. No regressions.
