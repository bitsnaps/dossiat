# Fix Admin Dashboard Empty Page & Sidebar Toggle

## Problem
The admin dashboard page (`/app/dashboard`) was empty — only showing "Welcome back, Admin" title with no content. Additionally, the admin dashboard had poor styling (stat cards stacked vertically in unstyled BCard components), and the TopNavbar sidebar toggle button didn't work in the admin panel.

## Root Causes
1. **Missing admin case in DashboardView.vue**: `src/views/DashboardView.vue` only rendered `AgentDashboard` or `ClientDashboard` based on role checks, but had no case for the `admin` role. Admins saw the welcome title but nothing else.
2. **Admin routes nested inside AppLayout**: The admin routes were children of `/app` which uses `AppLayout` (regular Sidebar + TopNavbar). This meant admins saw **two sidebars** — the regular app sidebar AND the AdminSidebar — and the TopNavbar toggle controlled the wrong one.
3. **No CSS for admin dashboard**: The `.ds-admin-dashboard` and related classes had no CSS in `main.css`, causing stat cards to render as unstyled stacked blocks.
4. **"Back to App" redirect loop**: The AdminSidebar's "Back to App" link pointed to `/app/dashboard`, which with the admin redirect guard would loop back to admin.

## Solution

### 1. Router restructure (`src/router/index.ts`)
- **Moved admin routes** out of `AppLayout` children to a top-level `/app/admin` route with its own `AdminLayout` component
- **Added `beforeEach` guard** to redirect admins from `/app/dashboard` to `/app/admin`:
```ts
if (to.name === 'dashboard' && authStore.hasRole('admin')) {
  NProgress.done()
  return next({ name: 'admin' })
}
```

### 2. Admin layout (`src/views/admin/AdminLayout.vue`)
- Rebuilt to use `ds-app-layout` CSS classes with its own `AdminSidebar` + `TopNavbar`
- Added mobile sidebar toggle support via local `ref`

### 3. Admin sidebar (`src/views/admin/AdminSidebar.vue`)
- Added `mobileOpen` prop and `close-mobile` emit for mobile toggle support
- Removed the "Back to App" link (was causing redirect loop)
- Added `handleNavClick` to close mobile sidebar on nav

### 4. Admin dashboard design (`src/views/admin/AdminDashboardView.vue`)
- Added header section with title + date subtitle
- Stat cards now use `div` elements with colored icons, proper grid layout
- Removed `BCard` import (wasn't being used effectively)

### 5. Admin dashboard CSS (`src/assets/main.css`)
- Added `.ds-admin-dashboard` styles: responsive grid with `repeat(auto-fill, minmax(220px, 1fr))`
- Stat cards: surface background, border, rounded corners, icon backgrounds, hover effects
- Mobile responsive breakpoint at 640px

### 6. i18n subtitles
- Added `admin.dashboard.subtitle` to `en.json`, `fr.json`, `ar.json`

## Files Modified
| File | Change |
|------|--------|
| `src/router/index.ts` | Moved admin routes to top-level; added admin redirect guard |
| `src/views/admin/AdminLayout.vue` | Rebuilt with AppLayout structure + TopNavbar + mobile toggle |
| `src/views/admin/AdminSidebar.vue` | Added mobile toggle props; removed "Back to App" link |
| `src/views/admin/AdminDashboardView.vue` | Improved design with header + grid stat cards |
| `src/assets/main.css` | Added admin dashboard CSS (grid, stat cards, responsive) |
| `src/locales/en.json` | Added `admin.dashboard.subtitle` |
| `src/locales/fr.json` | Added `admin.dashboard.subtitle` |
| `src/locales/ar.json` | Added `admin.dashboard.subtitle` |

## Key Architecture Decision
Admin routes are now **outside** `AppLayout` as a sibling route to `/app`, each with their own layout component. This prevents the double-sidebar issue and allows each layout to manage its own navigation independently. The admin redirect guard ensures admins always land on the admin panel when they hit `/app/dashboard`.
