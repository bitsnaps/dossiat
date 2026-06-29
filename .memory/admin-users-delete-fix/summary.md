# Task: Fix Admin Users Delete Action Not Working

## Problem

The delete, deactivate, and activate actions on the admin users pages ([`AdminUsersView.vue`](src/views/admin/AdminUsersView.vue) and [`AdminUserDetailView.vue`](src/views/admin/AdminUserDetailView.vue)) were not working. Clicking any of these buttons appeared to do nothing.

## Root Cause

The [`useConfirmDialog`](src/composables/useConfirmDialog.ts:10) composable's [`showConfirm()`](src/composables/useConfirmDialog.ts:19) returns a `Promise<boolean>` that resolves only when the `<ConfirmDialog>` component emits `confirm` or `cancel`. However, **the `<ConfirmDialog>` component was never rendered** in either admin user view's template. Since nothing could trigger `confirm()` or `cancel()`, the promise hung forever and the code after `await showConfirm(...)` — including [`adminStore.deleteUser()`](src/stores/admin.ts:209), `deactivateUser()`, and `activateUser()` — never executed.

The backend, API service, store, and all other plumbing were correct. The issue was purely a missing UI component.

## Solution

Added the `<ConfirmDialog>` component to both views:

### [`AdminUsersView.vue`](src/views/admin/AdminUsersView.vue:14)
- Imported [`ConfirmDialog`](src/components/common/ConfirmDialog.vue)
- Destructured full composable API: `isVisible`, `title`, `message`, `confirm`, `cancel` (alongside `showConfirm`)
- Rendered `<ConfirmDialog>` in the template, bound to the composable's reactive state

### [`AdminUserDetailView.vue`](src/views/admin/AdminUserDetailView.vue:9)
- Same fix as above

## Impact

This also fixes the deactivate and activate confirmation dialogs, which had the same missing-component issue.

## Test Results

1081 tests passed, 7 skipped, 2 pre-existing failures (unrelated `create-admin.spec.ts`). Zero regressions.
