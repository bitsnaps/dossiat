# Task: Admin Missions CRUD — Full Implementation + Bug Fix

## Problem
The admin missions page ([`AdminMissionsView.vue`](src/views/admin/AdminMissionsView.vue)) was read-only with only a "View" button per row and status override on the detail page. There was no way to create, edit, or delete missions from the admin panel.

## Solution

### Backend — [`src/server/routes/admin.ts`](src/server/routes/admin.ts:226)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `POST /api/admin/missions` | Create | Creates mission with agentId, clientId, title, description, type, pricingType, agreedAmount, currency, agreedChecklist. Validates agent/client exist and have correct roles. |
| `PUT /api/admin/missions/:id` | Update | Updates any mission field (title, description, type, pricingType, agreedAmount, currency, agreedChecklist) |
| `DELETE /api/admin/missions/:id` | Delete | Hard-deletes mission (cascades to payments, disputes, attachments via FK constraints) |

### Frontend Service — [`src/services/admin.ts`](src/services/admin.ts:48)

Added [`createMission()`](src/services/admin.ts:48), [`updateMission()`](src/services/admin.ts:68), [`deleteMission()`](src/services/admin.ts:85).

### Frontend Store — [`src/stores/admin.ts`](src/stores/admin.ts:250)

Added [`createMission()`](src/stores/admin.ts:250) (prepends to missions array), [`updateMission()`](src/stores/admin.ts:270) (updates in-place + syncs selectedMission), [`deleteMission()`](src/stores/admin.ts:289) (removes from array). Also added `type` param to [`fetchMissions()`](src/stores/admin.ts:221).

### Frontend Views

- [`AdminMissionsView.vue`](src/views/admin/AdminMissionsView.vue) — Full rewrite with "Create Mission" button, "Edit" and "Delete" action buttons per row, type filter dropdown, create/edit modal form with agent/client selects (fetched from API), dynamic checklist editor, currency picker
- [`AdminMissionDetailView.vue`](src/views/admin/AdminMissionDetailView.vue) — Added Edit and Delete buttons in header, edit modal with pre-filled form, delete with ConfirmDialog and redirect to list

### i18n — 35+ new keys per locale

Added to [`en.json`](src/locales/en.json:1135), [`fr.json`](src/locales/fr.json:47), [`ar.json`](src/locales/ar.json:31). Also fixed pre-existing missing `admin.subscriptions.deactivateTitle` key in ar.json.

### Design Decisions

1. **BSelect uses string values** — agentId/clientId stored as strings in form, converted to numbers before API call
2. **Load agent/client options on modal open** — calls `fetchUsers({ role: 'agent' })` and `fetchUsers({ role: 'client' })` each time modal opens
3. **No separate route for create/edit** — modal on list page (consistent with AdminUsersView pattern)
4. **Hard delete** for missions (consistent with user delete pattern)

## Tests (88 admin-specific tests)

| File | Tests | Status |
|------|-------|--------|
| [`tests/server/routes/admin.spec.ts`](tests/server/routes/admin.spec.ts) | 37 | ✅ All passing |
| [`tests/services/admin.spec.ts`](tests/services/admin.spec.ts) | 24 | ✅ All passing |
| [`tests/stores/admin.spec.ts`](tests/stores/admin.spec.ts) | 27 | ✅ All passing |

## Files Modified

| File | Changes |
|------|---------|
| `tests/server/routes/admin.spec.ts` | Added 10 new tests for POST/PUT/DELETE missions |
| `src/server/routes/admin.ts` | Added 3 new endpoints (~80 lines) |
| `tests/services/admin.spec.ts` | Added 3 new tests for createMission/updateMission/deleteMission |
| `src/services/admin.ts` | Added 3 new API functions |
| `tests/stores/admin.spec.ts` | Added 9 new tests (fetchMission, createMission, updateMission, deleteMission) |
| `src/stores/admin.ts` | Added 3 new actions, updated fetchMissions signature, updated return |
| `src/views/admin/AdminMissionsView.vue` | Full rewrite with CRUD UI |
| `src/views/admin/AdminMissionDetailView.vue` | Added Edit/Delete capabilities |
| `src/locales/en.json` | Added ~35 new keys |
| `src/locales/fr.json` | Added ~35 new keys |
| `src/locales/ar.json` | Added ~35 new keys + fixed missing deactivateTitle |

## Bug Fix: Agent/Client Dropdown Race Condition

### Problem
The agent/client dropdowns in the create/edit mission modal were intermittently empty.

### Root Cause
[`loadFormData()`](src/views/admin/AdminMissionsView.vue:60) called `fetchUsers({ role: 'agent' })` and `fetchUsers({ role: 'client' })` in parallel via `Promise.all`. Both calls write to the **same shared `users` ref** in the Pinia store (line 135 of [`admin.ts`](src/stores/admin.ts:135): `users.value = response.data || []`). Whichever call resolves last overwrites the other, making one dropdown empty.

### Fix
Changed to sequential calls — fetch agents first, capture options, then fetch clients and capture options. No `.filter()` needed since each call already filters by role.

## Test Results
Full suite: **1201 passed**, 2 pre-existing failures (auth-flow refresh token + subscription-flow unique constraint), 16 skipped. Zero regressions from this implementation.
