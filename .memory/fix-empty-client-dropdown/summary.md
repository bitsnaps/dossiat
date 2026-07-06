# Fix Empty Client Dropdown (Mission Create)

**Date:** 2026-07-06
**Mode:** debug → code
**Status:** ✅ Complete

## Problem
The client dropdown ([`UserSelect`](src/components/common/UserSelect.vue)) on the Mission Create page ([`MissionCreateView.vue:124`](src/views/missions/MissionCreateView.vue:124)) showed an empty list.

## Root Causes

### Bug 1 — Frontend: response envelope not unwrapped
[`UserSelect.vue:37`](src/components/common/UserSelect.vue:37) assigned the **full API envelope** (`{ success, data: [...] }`) directly to the `users` array ref. The `get<T>()` helper in [`api.ts:73`](src/services/api.ts:73) returns `res.data` (the axios body = the envelope), so `v-for` iterated over a non-array object and rendered nothing. The store layer (e.g. [`missions.ts:117-118`](src/stores/missions.ts:117)) correctly accesses `response.data`, but `UserSelect` did not.

### Bug 2 — Backend: network endpoint only returned existing-mission users
[`/users/network`](src/server/routes/users.ts:179) returned only clients the agent **already had missions with**. On the Mission Create page (assigning a client to a *new* mission), there were no missions yet → empty list. The `role="client"` prop passed to `UserSelect` was also completely ignored (never sent to the backend; backend derived role from `auth.role`).

## Solution

### [`src/components/common/UserSelect.vue`](src/components/common/UserSelect.vue)
- Unwrap `response.data` with an `Array.isArray` guard.
- Forward the `role` prop to the service call.
- Replaced top-level `fetchUsers()` call with `watch(() => props.role, fetchUsers, { immediate: true })` so it re-fetches if the role changes.

### [`src/services/users.ts`](src/services/users.ts)
- `getNetworkUsers(role?: 'client' | 'agent')` now appends `?role=...` query param.

### [`src/server/routes/users.ts`](src/server/routes/users.ts)
- `/network` now reads the `role` query param.
  - Agent requesting `role=client` (or no role) → returns **all** clients, ordered by name.
  - Client requesting `role=agent` (or no role) → returns **all** agents, ordered by name.
- Removed now-unused `Mission` and `Op` imports.

## Scope of "similar dropdowns"
`UserSelect` is the only network-driven dropdown in the app (search confirmed a single usage in `MissionCreateView.vue`). Static [`BSelect`](src/components/base/BSelect.vue) dropdowns (currency, etc.) take inline `options` and are unaffected. No other dropdowns needed fixing.

## Verification
- `pnpm exec vue-tsc --noEmit` → no new errors introduced (pre-existing unrelated errors in `disputes.ts`, `payments.ts`, `paypal.ts`, `stripe.ts`, `messages.ts` remain untouched).
- User confirmed the dropdown now populates correctly.

## Files Modified
- `src/components/common/UserSelect.vue`
- `src/services/users.ts`
- `src/server/routes/users.ts`
