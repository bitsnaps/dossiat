# Section 5e & 5f — Recurrent Missions & Messaging Frontend

## Task Summary
Implemented the complete frontend for recurrent missions configuration and messaging system, including backend API endpoints, Vue components, Pinia stores, composables, and i18n support.

## Files Created

### Backend (2 files modified)
- `src/server/routes/recurrence.ts` — Added `GET /api/recurrences` endpoint
- `src/server/routes/messages.ts` — Added `GET /api/conversations`, `POST /conversations/:id/read-all`

### Services (1 created, 1 modified)
- `src/services/recurrence.ts` — New: CRUD for recurrence configs
- `src/services/messages.ts` — Updated: added `getConversations`, `markAllAsRead`, pagination params

### Stores (1 created, 1 modified)
- `src/stores/recurrence.ts` — New: Pinia store for recurrence state
- `src/stores/messages.ts` — Updated: added `conversations` state, `Conversation` interface, `fetchConversations`, `markAllAsRead`

### Router (1 modified)
- `src/router/index.ts` — Added `/app/messages` → MessageListView, `/app/messages/:missionId` → MessageThreadView

### Recurrence Components (3 created + 3 tests)
- `src/components/mission/RecurrencePreview.vue` — Visual timeline of next 5 run dates
- `src/components/mission/RecurrentMissionSetup.vue` — Form for frequency/interval/day config
- `src/components/mission/RecurrentMissionList.vue` — List of active recurrence configs
- `tests/components/mission/RecurrencePreview.spec.ts` — 13 tests
- `tests/components/mission/RecurrentMissionSetup.spec.ts` — 12 tests
- `tests/components/mission/RecurrentMissionList.spec.ts` — 12 tests

### Messaging Components (2 created + 2 tests)
- `src/components/messaging/MessageBubble.vue` — Message display with sender, timestamp, read status
- `src/components/messaging/MessageComposer.vue` — Text input with send button, Enter-to-send
- `tests/components/messaging/MessageBubble.spec.ts` — 11 tests
- `tests/components/messaging/MessageComposer.spec.ts` — 10 tests

### Views (2 created)
- `src/views/messages/MessageListView.vue` — Conversation list with unread indicators
- `src/views/messages/MessageThreadView.vue` — Full message thread with auto-scroll

### Composable (1 created)
- `src/composables/useMessagePolling.ts` — Polls unread count every 30s

### Layout Integration (1 modified)
- `src/components/layout/TopNavbar.vue` — Added unread messages badge, integrated polling

### i18n (3 modified)
- `src/locales/en.json` — Added recurrence and messages keys
- `src/locales/fr.json` — Added French translations
- `src/locales/ar.json` — Added Arabic translations

### Tests Fixed
- `tests/services/messages.spec.ts` — Updated `getMessages` test to expect pagination params

## Test Results
- **76 test files passed** (76/76)
- **712 tests passed** (712/714, 2 skipped)
- **58 new tests** added across 5 spec files

## Architecture Decisions
1. Recurrence setup integrates into MissionDetailView as an expandable card (agent-only)
2. Message polling via `useMessagePolling` composable (30s interval) in TopNavbar
3. Conversations list uses `GET /api/conversations` with last message preview and unread counts
4. No WebSocket — polling approach chosen for simplicity and compatibility with Netlify serverless

## Remaining Work (if needed)
- `RecurrentMissionSetup` integration into MissionDetailView.vue (not yet wired into the detail page)
- Message attachment upload (backend endpoint exists but frontend not yet implemented)
