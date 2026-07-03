# Admin Role Switching — Task Summary

## Date
2026-07-03

## Problem
Admin users were locked into the admin panel (`/app/admin`) with no way to use the platform as a regular agent or client. The router guard force-redirected admins from dashboard to admin panel, `hasRole()` used strict equality on `user.role` (so admin never matched 'agent' or 'client'), and the sidebar hid role-specific links from admins.

## Solution: "View As" Role Switching
A frontend-first overlay approach with a backend `X-View-As-Role` header mechanism.

### Core Concept
- Added `viewAsRole` state to the auth store (persisted in `localStorage`)
- Added `effectiveRole` computed that returns `viewAsRole` for admin users, or `user.role` for others
- Modified `hasRole()` to check against `effectiveRole` instead of `user.role`
- Added `hasRealRole()` for checking the actual user role (used for admin panel access)
- Backend reads `X-View-As-Role` header and overrides the role in the JWT context for admin users only

### How It Works
1. Admin logs in → JWT has `role: 'admin'`
2. Admin clicks "View as Agent" or "View as Client" in sidebar or TopNavbar
3. Frontend sets `viewAsRole` in auth store and `localStorage`
4. All frontend role checks (`hasRole()`) now use `effectiveRole` → UI shows agent/client views
5. API requests send `X-View-As-Role` header
6. Backend auth middleware overrides `auth.role` for admin users → backend routes work as if agent/client
7. Admin clicks "Admin Panel" link or avatar dropdown → returns to admin view

## Files Modified

### Frontend (8 files)
| File | Change |
|------|--------|
| `src/stores/auth.ts` | Added `viewAsRole`, `effectiveRole`, `isViewingAs`, `hasRealRole()`, `setViewAsRole()`, `clearViewAsRole()` |
| `src/services/api.ts` | Added `X-View-As-Role` header in request interceptor |
| `src/router/index.ts` | Admin route checks use `hasRealRole()`, dashboard redirect uses `hasRole()` (respects effective role) |
| `src/components/layout/TopNavbar.vue` | Added "View As" dropdown section (Admin/Agent/Client) for admin users |
| `src/components/layout/Sidebar.vue` | Admin link always visible to real admins; fixed agent links visibility |
| `src/components/layout/AppLayout.vue` | Added persistent "View As" banner with return-to-admin button |
| `src/views/admin/AdminSidebar.vue` | Added "View as Agent" and "View as Client" menu items in footer |
| `src/assets/main.css` | Added styles for active menu items, section title, view-as banner |

### Backend (1 file)
| File | Change |
|------|--------|
| `src/server/middleware/auth.ts` | `authenticate()` reads `X-View-As-Role` header for admin users and overrides role |

### i18n (3 files)
| File | Added Keys |
|------|-----------|
| `src/locales/en.json` | `layout.topbar.viewAs/ViewAsAdmin/ViewAsAgent/ViewAsClient/admin`, `layout.viewAsBanner`, `admin.sidebar.viewAsAgent/viewAsClient` |
| `src/locales/fr.json` | Same keys in French |
| `src/locales/ar.json` | Same keys in Arabic |

### Tests (3 files)
| File | Change |
|------|--------|
| `tests/stores/auth.spec.ts` | Added 12 tests for viewAsRole, effectiveRole, isViewingAs, hasRealRole, localStorage persistence |
| `tests/server/middleware/auth.spec.ts` | Added 5 tests for X-View-As-Role header (admin→agent, admin→client, non-admin ignored, invalid role ignored) |
| `tests/components/layout/Sidebar.spec.ts` | Updated mock to include `hasRealRole` |

## Security Considerations
- `X-View-As-Role` header is only trusted from admin users (checked server-side)
- Admin API routes (`/api/admin/*`) remain protected — when viewing as agent/client, those routes return 403
- JWT always contains `role: 'admin'` — the override is only in the request context
- `viewAsRole` is cleared on logout

## Test Results
- 1313 tests passing, 7 skipped
- 1 pre-existing failure in `seed-admin.spec.ts` (foreign key constraint, unrelated)
- No regressions introduced

## UX Entry Points
1. **Admin Sidebar footer** — "View as Agent" and "View as Client" menu items (most discoverable)
2. **TopNavbar user dropdown** — "View As" section with Admin/Agent/Client options
3. **AppLayout banner** — Persistent banner when viewing as agent/client with "Admin" return button
4. **Sidebar admin link** — Always visible to real admins (even when viewing as another role) for quick return
