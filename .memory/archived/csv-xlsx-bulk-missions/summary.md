# Bulk Mission Creation for Enterprise Tier (CSV-only)

**Date:** 2025-07-05 (revised 2025-07-06)
**Status:** Completed

## What Was Done

Implemented bulk mission creation for Enterprise-tier clients via CSV upload.
Originally supported both CSV and XLSX, but both `exceljs` and `csv` packages
were subsequently removed — they are Node stream-based and pulled in Node core
modules (`util.inherits`, `stream`) that Vite cannot polyfill in the browser,
crashing the `/app/missions/bulk` route with
`TypeError: import_util.default.inherits is not a function`.

CSV parsing is now handled by a hand-rolled, dependency-free parser at
`src/utils/csv.ts`.

### Files Created
- `src/views/missions/BulkMissionCreateView.vue` — Upload UI with CSV parsing, preview table, validation, and confirm button
- `src/utils/csv.ts` — Browser-safe, dependency-free CSV parser (RFC 4180 subset)
- `tests/components/missions/BulkMissionCreateView.spec.ts` — Frontend component tests (12 tests, including CSV-only regression guards)
- `tests/utils/csv.spec.ts` — Unit tests for the hand-rolled CSV parser (13 tests)
- `plans/section-9-csv-bulk-missions.md` — Detailed implementation plan
- `plans/remove-exceljs-csv-only.md` — Rationale and plan for removing exceljs/csv

### Files Modified
- `src/stores/missions.ts` — Added `createBulkMissions` action
- `src/router/index.ts` — Added `/app/missions/bulk` route (client-only, before `:id` param)
- `src/components/layout/Sidebar.vue` — Added "Bulk Create" link with `bi-file-earmark-spreadsheet` icon
- `src/locales/en.json` — Added `layout.sidebar.bulkMissions` and `missions.bulk.*` keys (CSV-only wording)
- `src/locales/fr.json` — Added same keys in French
- `src/locales/ar.json` — Added same keys in Arabic
- `tests/server/routes/missions.spec.ts` — Added `Mission Bulk Routes` describe block with 8 tests
- `docs/TODO.md` — Checked off item on line 461
- `tests/components/missions/BulkMissionCreateView.spec.ts` — Removed csv/sync mock, added real-parser-based regression tests

### Files Deleted
- `tests/components/missions/BulkMissionCreateView.exceljs.spec.ts` — Obsolete exceljs browser-bundle regression spec
- `skills/exceljs/SKILL.md` — No longer referenced
- `skills/exceljs/` directory — Removed entirely

### Dependencies
- **Removed:** `exceljs` (^4.4.0) — Node stream-based, crashed in browser
- **Removed:** `csv` (^6.6.1) — Node stream-based, crashed in browser (same `util.inherits` error)
- **Added:** none — CSV parsing is now a hand-rolled utility at `src/utils/csv.ts`

### Key Design Decisions
- Client-side file parsing (no server upload needed)
- Max 100 rows enforced both frontend and backend
- Enterprise tier check uses `csv_import` feature flag on `SubscriptionPlan.features`
- Agents can also bulk create (no tier restriction for agents)
- Template download: CSV only (XLSX template dropped)
- `FileUpload.vue` component reused for drag-and-drop upload
- Hand-rolled CSV parser handles: quoted fields, escaped `""` quotes, CRLF/LF, trimming, blank lines, ragged rows
- Parser covers RFC 4180 subset needed by the bulk feature (not a general-purpose CSV library)

### Test Results
- Backend: 8 tests (Enterprise success, non-Enterprise 403, agent bulk, validation errors)
- Frontend: 12 tests (renders, download buttons, upload area, confirm disabled, cancel, CSV-only guards, template blob, parser integration)
- CSV parser: 13 tests (quotes, escapes, CRLF, trimming, blank lines, ragged rows, bulk-template shape)
- 4 pre-existing test suite failures unrelated to this work (database table issues in seeders, stripe, mission-lifecycle)

### Known Issues
- i18n:sync reports 40 pre-existing missing keys in ar.json/fr.json (admin.disputes.* and common.status.dispute.*) — not related to this task
