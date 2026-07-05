# CSV/XLSX Bulk Mission Creation for Enterprise Tier

**Date:** 2025-07-05
**Status:** Completed

## What Was Done

Implemented bulk mission creation for Enterprise-tier clients, allowing them to upload CSV or XLSX files to create multiple missions at once.

### Files Created
- `src/views/missions/BulkMissionCreateView.vue` — Upload UI with CSV/XLSX parsing, preview table, validation, and confirm button
- `tests/components/missions/BulkMissionCreateView.spec.ts` — Frontend component tests (8 tests)
- `plans/section-9-csv-bulk-missions.md` — Detailed implementation plan

### Files Modified
- `src/stores/missions.ts` — Added `createBulkMissions` action
- `src/router/index.ts` — Added `/app/missions/bulk` route (client-only, before `:id` param)
- `src/components/layout/Sidebar.vue` — Added "Bulk Create" link with `bi-file-earmark-spreadsheet` icon
- `src/locales/en.json` — Added `layout.sidebar.bulkMissions` and `missions.bulk.*` keys (22 keys)
- `src/locales/fr.json` — Added same keys in French
- `src/locales/ar.json` — Added same keys in Arabic
- `tests/server/routes/missions.spec.ts` — Added `Mission Bulk Routes` describe block with 8 tests
- `docs/TODO.md` — Checked off item on line 461

### Dependencies Added
- `exceljs` (^4.4.0) — Excel file parsing/generation
- `csv` (^6.6.1) — CSV parsing via `csv/sync`

### Key Design Decisions
- CSV parsed natively via `csv/sync` package
- XLSX parsed via `exceljs` package
- Client-side file parsing (no server upload needed)
- Max 100 rows enforced both frontend and backend
- Enterprise tier check uses `csv_import` feature flag on `SubscriptionPlan.features`
- Agents can also bulk create (no tier restriction for agents)
- Template download: CSV (text) and XLSX (exceljs generated)
- `FileUpload.vue` component reused for drag-and-drop upload

### Test Results
- Backend: 8 new tests (Enterprise success, non-Enterprise 403, agent bulk, validation errors)
- Frontend: 8 new tests (renders, download buttons, upload area, confirm disabled, cancel)
- 4 pre-existing test suite failures unrelated to this work (database table issues in seeders, stripe, mission-lifecycle)

### Known Issues
- i18n:sync reports 40 pre-existing missing keys in ar.json/fr.json (admin.disputes.* and common.status.dispute.*) — not related to this task
