# Fix Navbar Toggle Button Not Working

## Problem
The hamburger toggle button in the TopNavbar did nothing when clicked. This affected both the regular app layout and the admin layout.

## Root Cause
The toggle button only toggled the **mobile** sidebar state (`sidebarOpen`), which on desktop (>768px viewport) has zero CSS effect — the `.ds-sidebar--mobile-open` class only applies within `@media (max-width: 768px)`. On desktop, the sidebar is always visible, so clicking the toggle changed an invisible boolean with no visual result.

## Solution

### 1. `src/components/layout/AppLayout.vue`
- Added `isMobile` ref tracking `window.innerWidth <= 768`
- Added `resize` event listener to keep it updated
- Created `handleToggleSidebar()` that dispatches:
  - **Mobile** → `uiStore.toggleMobileSidebar()` (open/close sidebar)
  - **Desktop** → `uiStore.toggleSidebar()` (collapse/expand sidebar)

### 2. `src/views/admin/AdminLayout.vue`
- Added `sidebarCollapsed` ref + `isMobile` ref
- Added `resize` event listener
- Created `handleToggleSidebar()` with same mobile/desktop dispatch
- Added `sidebarCollapsed` class binding on `.ds-app-layout__main`
- Passes `collapsed` prop to `AdminSidebar`

### 3. `src/views/admin/AdminSidebar.vue`
- Added `collapsed` prop to interface and defaults
- Added `ds-sidebar--collapsed` class binding to `<aside>`

### No CSS changes needed
The existing `.ds-sidebar--collapsed` CSS (width: 72px, hide labels, center icons) already works for the admin sidebar.

## Files Modified
| File | Change |
|------|--------|
| `src/components/layout/AppLayout.vue` | Added mobile detection + desktop collapse toggle |
| `src/views/admin/AdminLayout.vue` | Added collapsed state + mobile detection |
| `src/views/admin/AdminSidebar.vue` | Added `collapsed` prop support |
