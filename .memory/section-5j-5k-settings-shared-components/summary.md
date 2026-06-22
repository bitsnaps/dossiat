# Section 5j-5k: Settings & Shared Components

## Status: COMPLETED

## Summary

Implemented all shared/common components and settings views for sections 5j and 5k of the TODO.

## What Was Done

### Phase 1: Shared Components (11 new components)

| Component | File | Purpose |
|-----------|------|---------|
| `StatusBadge` | `src/components/common/StatusBadge.vue` | Wraps BBadge with mission/payment/subscription status-to-variant mapping |
| `EmptyState` | `src/components/common/EmptyState.vue` | Reusable empty state with icon, title, hint, and action slot |
| `LoadingSpinner` | `src/components/common/LoadingSpinner.vue` | Spinner with sm/md/lg sizes and optional label |
| `Pagination` | `src/components/common/Pagination.vue` | Page navigation with ellipsis, uses ds-table-pager CSS |
| `SearchInput` | `src/components/common/SearchInput.vue` | Debounced search input using useDebounce composable |
| `ConfirmDialog` | `src/components/common/ConfirmDialog.vue` | Yes/no confirmation dialog using BModal |
| `Modal` | `src/components/common/Modal.vue` | Enhanced BModal with loading state and confirm/cancel |
| `CurrencyDisplay` | `src/components/common/CurrencyDisplay.vue` | Formatted currency using Intl.NumberFormat |
| `Breadcrumb` | `src/components/common/Breadcrumb.vue` | Page breadcrumb navigation with RouterLink |
| `FileUpload` | `src/components/common/FileUpload.vue` | Drag-and-drop file upload extracted from MissionAttachments |
| `Avatar` | `src/components/common/Avatar.vue` | BAvatar wrapper with ring prop |

Barrel export: `src/components/common/index.ts`

### Phase 2: Settings Views

| View | File | Purpose |
|------|------|---------|
| `SettingsLayout` | `src/views/settings/SettingsLayout.vue` | Shared layout with tab navigation |
| `SettingsView` | `src/views/settings/SettingsView.vue` | Account settings (personal info + password change) |
| `NotificationSettingsView` | `src/views/settings/NotificationSettingsView.vue` | Email notification preferences |
| `AppearanceSettingsView` | `src/views/settings/AppearanceSettingsView.vue` | Theme/language preferences |

### Phase 3: Integration

- **Router**: `/app/settings` restructured with nested routes (account, notifications, appearance), role restriction removed
- **Sidebar**: Single settings link for all roles
- **Refactored views**: MissionListView, DisputeListView, MessageListView, MissionAttachments, CreditBalanceView all use new common components

### Phase 4: Tests

- 14 new test files created (11 common component tests + 3 settings view tests)
- All tests passing (106 test files, 969+ tests)

## i18n Keys Added

- `common.*` section in en.json, fr.json, ar.json (status labels, empty state, pagination, search, confirm, file upload, breadcrumb)
- `settings.*` section (account, notifications, appearance settings)

## CSS Changes

- Added styles for: LoadingSpinner, SearchInput, Breadcrumb, FileUpload, CurrencyDisplay, Avatar ring, Settings layout/nav
- Added `.ds-empty-state__title` class

## Bugs Fixed

1. **SearchInput clear**: `clear()` directly emits instead of debouncing, ensuring immediate clear button responsiveness
2. **DisputeListView test**: Updated selector from `.ds-dispute-list__empty` to `.ds-empty-state` after refactoring
3. **SettingsView test**: Added `await nextTick()` for onMounted form initialization

## Files Modified

- `src/assets/main.css` — new CSS classes for all common components
- `src/locales/en.json`, `fr.json`, `ar.json` — i18n keys
- `src/router/index.ts` — settings sub-routes
- `src/components/layout/Sidebar.vue` — unified settings link
- `src/views/missions/MissionListView.vue` — uses StatusBadge, EmptyState, LoadingSpinner
- `src/views/disputes/DisputeListView.vue` — uses EmptyState
- `src/views/messages/MessageListView.vue` — uses EmptyState
- `src/components/mission/MissionAttachments.vue` — uses FileUpload
- `src/views/payments/CreditBalanceView.vue` — uses CurrencyDisplay
- `docs/TODO.md` — sections 5j and 5k checked off
