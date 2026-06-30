# Redesign ConfirmDialog

## Problem
The `ConfirmDialog` used for deleting users (and other confirm actions) was wrongly displayed. The entire confirmation message (e.g., "Are you sure you want to permanently delete this user? This action cannot be undone.") was passed as the `title` prop, which [`BModal`](src/components/base/BModal.vue) rendered as a large `<h3>` header. The `message` field was never populated, leaving the body empty.

## Root Cause
All `showConfirm()` calls passed only `title: t('admin.users.deleteConfirm')` — the full sentence — instead of splitting it into a short title and a message body. The `ConfirmDialog` component forwarded this as the BModal's `title`, which rendered it as a bold `<h3>` in the modal header.

## Solution
Redesigned the `ConfirmDialog` to render its own centered layout inside the BModal body (no longer passes `title` to BModal), split i18n keys into separate title/message, and added `variant` support for danger confirmations.

## Files Changed

### Core Components
- **`src/components/common/ConfirmDialog.vue`** — Redesigned: no longer passes `title` to BModal; renders its own centered layout with icon, title `<h3>`, and message `<p>` inside the modal body. Added `variant` prop for danger styling.
- **`src/components/base/BModal.vue`** — Made header conditional (`v-if="title"`). When no title, renders a close button positioned absolutely at top-right.

### Composable
- **`src/composables/useConfirmDialog.ts`** — Added `variant` ref (`'danger' | 'accent'`), exposed in `ConfirmOptions` interface and returned from composable.

### i18n (en, fr, ar)
- **`src/locales/en.json`**, **`src/locales/fr.json`**, **`src/locales/ar.json`** — Added title keys for all confirm dialogs:
  - `deleteTitle` / `activateTitle` / `deactivateTitle` (short labels like "Delete User")
  - Existing `*Confirm` keys now serve as the message body

### View Callers
- **`src/views/admin/AdminUsersView.vue`** — Updated `showConfirm()` calls to pass `title` (from new title keys) + `message` (from existing confirm keys) + `variant: 'danger'` for delete. Added `variant` binding to `<ConfirmDialog>`.
- **`src/views/admin/AdminUserDetailView.vue`** — Same pattern as above.
- **`src/views/admin/AdminSubscriptionsView.vue`** — Updated `showConfirm()` call to pass `title` + `message`.

### Styles
- **`src/assets/main.css`** — Added:
  - `.ds-confirm-dialog` — centered flex layout with icon, title, message
  - `.ds-confirm-dialog__icon` — warning icon circle (48px, warm color)
  - `.ds-confirm-dialog__title` — 1.125rem, bold, centered
  - `.ds-confirm-dialog__message` — 0.875rem, muted color, line-height 1.5
  - `.ds-modal-close--top` — absolute-positioned close button for no-header mode
  - `.ds-modal-dialog` — `position: relative` for close button positioning

## Testing
- All 112/113 test files passed (1081 tests passed, 7 skipped)
- 2 pre-existing failures in `create-admin.spec.ts` (unrelated to this change)

## Follow-up Notes
- `AdminSubscriptionsView.vue` uses `showConfirm` but doesn't render a `<ConfirmDialog>` in its template — this is a pre-existing issue not addressed in this task.
