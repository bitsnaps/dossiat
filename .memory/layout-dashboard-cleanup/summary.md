# Layout & Dashboard CSS Fixes

## Problem
Dashboard views (Agent and Client) and the sidebar had major layout issues:
1. **Stat cards stacked vertically** — no grid layout, each card was full-width
2. **"0Active Missions"** — stat value and label ran together with no spacing
3. **Sidebar not filling viewport height** — CSS had fixed positioning on `.ds-app-layout__sidebar` which doesn't exist in the DOM; the `Sidebar.vue` component uses `<aside class="ds-sidebar">` directly
4. **Missing CSS classes** — Templates used classes (`ds-stat`, `ds-agent-dashboard`, `ds-section-header`, `ds-empty-state`, `ds-mission-list`, `ds-mission-row`, `ds-quick-actions`) that were never defined in `main.css`

## Root Cause
The dashboard CSS was never implemented. All the BEM-style dashboard classes were referenced in the Vue templates but had no corresponding CSS rules. Additionally, the sidebar's positioning was applied to a selector (`.ds-app-layout__sidebar`) that doesn't match any rendered DOM element.

## Solution (all in `src/assets/main.css`)

### 1. Added missing dashboard styles
- **`.ds-agent-dashboard` / `.ds-client-dashboard`** — flex column, 1.5rem gap
- **`.ds-*-dashboard__stats`** — 4-column CSS grid with 1rem gap (responsive: 2-col at 1200px, 1-col at 640px)
- **`.ds-stat`** — flex row with 1rem gap between icon and info
- **`.ds-stat__info`** — flex column with 2px gap (fixes value/label spacing)
- **`.ds-stat__value`** — 1.5rem bold font
- **`.ds-stat__label`** — 0.8rem muted text
- **`.ds-section-header`** — flex row, space-between
- **`.ds-empty-state`** — centered column with muted text and icon
- **`.ds-mission-list` / `.ds-mission-row`** — bordered rows with hover effect
- **`.ds-quick-actions`** — flex-wrap row

### 2. Fixed sidebar
- Moved fixed positioning, background, border, width from `.ds-app-layout__sidebar` → `.ds-sidebar`
- Sidebar now: `position: fixed; height: 100vh; width: 260px`
- `.ds-sidebar--collapsed`: `width: 72px`
- Removed redundant `.ds-app-layout__sidebar` / `.ds-app-layout__sidebar--collapsed` rules
- Updated mobile media query to target `.ds-sidebar` instead of `.ds-app-layout__sidebar`

### 3. Improved content padding
- `.ds-app-layout__content`: padding changed from `1.5rem` to `2rem 2.5rem`

## Files Modified
- `src/assets/main.css` — All changes

## Key Architecture Notes
- `AppLayout.vue` renders `<Sidebar>` and `<div class="ds-app-layout__main">` as siblings
- `Sidebar.vue` renders `<aside class="ds-sidebar">` (NOT wrapped in `.ds-app-layout__sidebar`)
- The sidebar is `position: fixed` and the main content area uses `margin-inline-start` to offset
- Top navbar is sticky within the main content area
