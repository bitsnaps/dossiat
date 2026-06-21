# Section 5d: Mission Pages

## Task
Implement the seven mission-related pages and components listed in `docs/TODO.md` section 5d:
1. `MissionListView.vue` — List of missions with filters (status, date, type)
2. `MissionDetailView.vue` — Full mission detail with status timeline, checklist, attachments, and action buttons
3. `MissionCreateView.vue` — Create new mission form
4. `MissionAgreementView.vue` — Checkbox agreement view
5. `MissionTimeline.vue` — Component showing mission status progression
6. `MissionChecklist.vue` — Interactive checklist for agreement and completion tracking
7. `MissionAttachments.vue` — File upload and display component

## Files Created

### Components
- `src/components/mission/MissionTimeline.vue` — Horizontal timeline showing Created → Agreed → In Progress → Completed milestones with timestamps, active step highlighting, and check icons
- `src/components/mission/MissionChecklist.vue` — Interactive checklist with three modes: agreement (pending_agreement), completion (in_progress), and review (completed/agreed). Supports check-all toggle, progress bar, and per-item checkboxes
- `src/components/mission/MissionAttachments.vue` — Drag-and-drop file upload zone with file type icons, file size display, download links, and upload progress indicator

### Views
- `src/views/missions/MissionListView.vue` — Mission list with status/type filter dropdowns, responsive table with columns (title, status badge, pricing, amount, counterparty, date, view button), empty state, and create button for agents
- `src/views/missions/MissionDetailView.vue` — Full detail page with back link, header with status/type badges, info cards (pricing, amount, created, started), agent/client party cards, two-column layout (timeline + description | checklist + attachments), and role-dependent action buttons (send for agreement, start, complete, agree, cancel)
- `src/views/missions/MissionCreateView.vue` — Form with title, client ID, description textarea, pricing type radio group, amount/currency inputs, mission type radio, dynamic checklist builder (add/remove rows), and submit/cancel actions
- `src/views/missions/MissionAgreementView.vue` — Centered card layout with mission summary, full checklist with check-all, agreement confirmation checkbox, and agree/decline actions

### Tests
- `tests/components/missions/MissionTimeline.spec.ts` — 7 tests (renders 4 steps, draft status reaches created, agreed reaches first two, completed reaches all, in_progress highlights current, shows dates, hides unreached dates)
- `tests/components/missions/MissionChecklist.spec.ts` — 9 tests (empty state, renders items, shows text, emits on item click, check-all select/deselect, progress bar, no check-all in review, readonly checkboxes)

## Files Modified

### Store
- `src/stores/missions.ts` — Enhanced `Mission` interface with `agent`, `client`, `attachments`, `recurrenceConfig`, `agreedChecklist`, `completedChecklist`, `startedAt`, `completedAt`. Added 4 new actions: `agreeMission`, `updateMissionStatus`, `fetchAttachments`, `uploadAttachment`. Added `MissionUser`, `Attachment`, `RecurrenceConfig` interfaces. All service functions already existed in `src/services/missions.ts`.

### Router
- `src/router/index.ts` — Replaced DashboardView placeholder for `/app/missions` with `MissionListView.vue`. Replaced `/app/missions/create` with `MissionCreateView.vue` (agent-only). Replaced `/app/missions/:id` with `MissionDetailView.vue`. Added new route `/app/missions/:id/agree` with `MissionAgreementView.vue`.

### i18n (all 3 locales)
- `src/locales/en.json` — Added `missions` namespace with sub-keys: `list` (title, create, noResults, filters, columns), `detail` (backToList, description, parties, pricing, actions, confirmActions), `create` (fields, checklist, submit, validation), `agreement` (checklistTitle, agreeConfirm, confirmAgreement), `timeline` (created, agreed, inProgress, completed), `checklist` (empty, completed), `attachments` (empty, upload, uploadHint, maxSize, acceptedTypes), `status` (all 7 statuses)
- `src/locales/ar.json` — Arabic translations for all mission keys
- `src/locales/fr.json` — French translations for all mission keys

## Key Decisions
- Sub-components live in `src/components/mission/` for reuse across detail and agreement views
- Extended the existing `missionsStore` rather than creating a new store — all required service functions already existed
- Router entries replace DashboardView placeholders that were used as stubs
- The agreement view redirects to mission detail if status doesn't match `pending_agreement`
- MissionAgreementView calls both `agreeMission` and `updateMissionStatus('agreed')` sequentially
- Checklist has three modes controlled by mission status, not by an explicit prop
- The `toggleItem` and `toggleAll` functions allow clicks in agreement mode by default (status-based), in addition to `editable` prop
- Type check passes with no new errors (pre-existing errors in seeders and TopNavbar remain unchanged)
- All 71 test files pass (654 tests, 2 skipped) — no regressions

## Test Results
- All 71 test files pass (654 tests, 2 skipped)
- 16 new tests across 2 test files for MissionTimeline and MissionChecklist
- Full test suite runs in ~240s

## TODO Status
Section 5d in `docs/TODO.md` is now fully checked off (7 items).
