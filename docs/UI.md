# UI

## 🎨 Design Highlights

### Custom Dark Theme with Vibrant Accents

- Deep navy/black background (#0a0e1a) with a tri-color gradient palette: lime green (#c8ff00), cyan (#00d4ff), and purple (#7c5cff)
- Subtle radial gradient lighting and a masked grid pattern in the hero
- Custom scrollbar, glassmorphism navbar, and floating UI elements

#### Unique Typography

- Fraunces (serif, variable) — for all headings with that distinctive high-contrast modern look
- Inter (sans-serif) — for body text
- Space Grotesk (monospace-ish) — for technical labels, prices, and code-like elements
- All loaded via Google Fonts CDN

Bootstrap 5 + Bootstrap Icons via CDN, fully custom-themed.

## 📄 Sections Built
- Sticky glassmorphism navbar with brand dot and CTAs
- Hero — headline, subhead, dual CTAs, social proof avatars, plus a 3D-tilted mission dashboard mockup with two floating stat card
- Trust marquee — infinite-scrolling client logos
- Features grid (6 cards) — Flexible Quoting, Recurrent Missions, Checkbox Agreement, Hybrid Payments, Smart Fee Engine (1% / $1 min), Mediation

- 4-step workflow — Invite → Agree → Execute → Settle
- For Agents — split section with checklist + interactive Agent profile mockup (specialties, stats, copyable unique link)
- Pricing — 3 tiers (Small Business $29, Professional $99 marked "Most Popular" with lime glow, Enterprise $499) with full feature comparison
- FAQ accordion — 5 deep Q&As covering the ToS, cash missions, disputes, currencies, and ERP API
- CTA section with glowing gradient card
- Rich footer with 4 link columns and social icons

## ⚡ Interactivity
- Scroll-reveal animations via IntersectionObserver
- Navbar border fade on scroll
- Hover transforms on cards (lift + glow)
- Animated pulse dot in badges
- 3D-tilted mockup on hover
- Copy-to-clipboard on the unique invite link

Everything is in a single index.html using only CDN links — no build step required.

---

## 🧩 Components Library

Base components live in [`src/components/base/`](src/components/base/) with all styles defined in [`src/assets/main.css`](src/assets/main.css). Barrel export via [`src/components/base/index.ts`](src/components/base/index.ts).

### BButton
Polymorphic button — renders `<button>`, `<a>`, or `<RouterLink>` based on props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'accent' \| 'outline' \| 'gradient' \| 'ghost' \| 'danger'` | `'accent'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Shows spinner, disables interaction |
| `disabled` | `boolean` | `false` | Disables the button |
| `icon` | `string` | — | Bootstrap icon class (e.g. `'bi-info-square'`) |
| `href` | `string` | — | Renders as `<a>` |
| `to` | `string` | — | Renders as `<RouterLink>` |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Native button type |

**Slots:** `default`, `icon`

---

### BAlert
Dismissable alert banner with auto-icon mapping.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'info' \| 'success' \| 'warning' \| 'danger' \| 'accent'` | `'info'` | Color scheme |
| `dismissible` | `boolean` | `false` | Shows close button |
| `icon` | `string` | — | Override auto-icon (Bootstrap icon class) |
| `title` | `string` | — | Optional title line |

**Events:** `dismiss`

---

### BBadge
Compact inline badge.

| Prop | Type | Default |
|------|------|---------|
| `variant` | `'default' \| 'success' \| 'info' \| 'warning' \| 'danger' \| 'accent'` | `'default'` |
| `size` | `'sm' \| 'md'` | — |

---

### BCard
Container card with header/footer slots.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'bordered' \| 'transparent' \| 'elevated'` | `'bordered'` | Visual style |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Body padding |
| `clickable` | `boolean` | `false` | Adds hover effect + click event |

**Slots:** `default`, `header`, `footer`
**Events:** `click`

---

### BInput
Text input with label, validation, icon, and hint.

| Prop | Type | Default |
|------|------|---------|
| `modelValue` | `string \| number` | `''` |
| `label` | `string` | — |
| `placeholder` | `string` | — |
| `error` | `string` | — |
| `hint` | `string` | — |
| `icon` | `string` | — |
| `disabled` | `boolean` | `false` |
| `type` | `string` | `'text'` |

**v-model** supported. Emits `update:modelValue`.

---

### BCheckbox
Checkbox input with label, validation, and hint.

| Prop | Type | Default |
|------|------|---------|
| `modelValue` | `boolean` | `false` |
| `label` | `string` | — |
| `error` | `string` | — |
| `hint` | `string` | — |
| `disabled` | `boolean` | `false` |

**v-model** supported. Emits `update:modelValue`. Default slot renders as label content.

---

### BDropdown
Toggle dropdown with trigger and menu slots.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Default trigger button text |
| `placement` | `'start' \| 'end'` | `'start'` | Menu alignment |
| `disabled` | `boolean` | `false` | Disables trigger |

**Slots:** `trigger` (custom trigger element), `default` (menu items using `.ds-dropdown-item` class)
**Events:** `select` — emitted with the `MouseEvent` when a menu item is clicked

---

### BModal
Dialog overlay with header/body/footer.

| Prop | Type | Default |
|------|------|---------|
| `modelValue` | `boolean` | — (required) |
| `title` | `string` | — |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |

**v-model** supported. Emits `update:modelValue` and `close`. Closes on overlay click.
**Slots:** `default`, `footer`

---

### BAvatar
User avatar with image or initials fallback.

| Prop | Type | Default |
|------|------|---------|
| `src` | `string` | — |
| `name` | `string` | `''` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `online` | `boolean` | `false` |

Renders initials from `name` when no `src` is provided. Shows green dot when `online`.

---

### BTable
Full-featured data table with search, sort, filter, pagination, selection, and expand.

**Key props:** `columns` (required `TableColumn[]`), `rows`, `rowKey`, `loading`, `selectable`, `singleSelect`, `expandable`, `pagination`, `page`, `pageSize`, `pageSizeOptions`, `serverSide`, `totalRows`, `sortKey`, `sortDirection`, `searchQuery`, `searchPlaceholder`, `striped`, `hover`, `bordered`, `compact`, `sticky`, `emptyText`.

**`TableColumn`:** `{ key, label, sortable?, filterable?, filterType?, filterOptions?, width?, align?, class?, headerClass?, formatter?, visible? }`

**Events:** `sort-change`, `filter-change`, `page-change`, `page-size-change`, `selection-change`, `row-click`, `row-expand`, `update:search-query`

**Slots:** `header-{key}`, `cell-{key}` (scoped: `{ row, value, index }`), `expanded-row`, `empty`, `loading`, `toolbar-left`, `toolbar-right`, `footer-left`, `footer-right`

---

## 🎨 Design Tokens

All design tokens are defined as CSS custom properties in [`:root`](src/assets/main.css:5) of `src/assets/main.css`.

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--ds-bg` | `#0a0e1a` | Page background |
| `--ds-bg-2` | `#0f1424` | Elevated background (sidebar, footer) |
| `--ds-surface` | `#131a2e` | Card/panel surface |
| `--ds-surface-2` | `#1a2238` | Hover/active surface |
| `--ds-border` | `rgba(255,255,255,0.08)` | Default borders |
| `--ds-border-strong` | `rgba(255,255,255,0.14)` | Emphasized borders |
| `--ds-text` | `#e8ecf4` | Primary text |
| `--ds-text-muted` | `#9aa3b8` | Secondary/muted text |
| `--ds-accent` | `#c8ff00` | Primary accent (lime green) |
| `--ds-accent-2` | `#7c5cff` | Secondary accent (purple) |
| `--ds-accent-3` | `#00d4ff` | Tertiary accent (cyan) |
| `--ds-warm` | `#ff7a59` | Danger/warning accent |
| `--ds-success` | `#28c840` | Success indicator |
| `--ds-grad` | 135deg gradient | Multi-accent gradient |
| `--ds-grad-soft` | Soft gradient | Subtle gradient backgrounds |

### Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--ds-text-xs` | `0.6875rem` | 11px — tiny labels |
| `--ds-text-sm` | `0.75rem` | 12px — small text |
| `--ds-text-base` | `0.8125rem` | 13px — base/body |
| `--ds-text-md` | `0.875rem` | 14px — medium text |
| `--ds-text-lg` | `1rem` | 16px — large text |
| `--ds-text-xl` | `1.125rem` | 18px — extra large |
| `--ds-text-2xl` | `1.25rem` | 20px — section title |
| `--ds-text-3xl` | `1.5rem` | 24px — page title |

### Spacing

| Token | Value | Pixels |
|-------|-------|--------|
| `--ds-space-1` | `0.25rem` | 4px |
| `--ds-space-2` | `0.5rem` | 8px |
| `--ds-space-3` | `0.75rem` | 12px |
| `--ds-space-4` | `1rem` | 16px |
| `--ds-space-5` | `1.25rem` | 20px |
| `--ds-space-6` | `1.5rem` | 24px |
| `--ds-space-7` | `2rem` | 32px |
| `--ds-space-8` | `2.5rem` | 40px |
| `--ds-space-9` | `3rem` | 48px |
| `--ds-space-10` | `4rem` | 64px |

### Border Radius

| Token | Value |
|-------|-------|
| `--ds-radius-xs` | `4px` |
| `--ds-radius-sm` | `6px` |
| `--ds-radius-md` | `8px` |
| `--ds-radius-lg` | `12px` |
| `--ds-radius-xl` | `16px` |
| `--ds-radius-2xl` | `20px` |
| `--ds-radius-3xl` | `24px` |
| `--ds-radius-full` | `100px` |

### Shadows

| Token | Value |
|-------|-------|
| `--ds-shadow-sm` | `0 2px 8px rgba(0,0,0,0.3)` |
| `--ds-shadow-md` | `0 4px 16px rgba(0,0,0,0.4)` |
| `--ds-shadow-lg` | `0 8px 32px rgba(0,0,0,0.5)` |
| `--ds-shadow-xl` | `0 20px 60px rgba(0,0,0,0.6)` |

### Transitions

| Token | Value | Usage |
|-------|-------|-------|
| `--ds-duration-fast` | `0.15s` | Hover states, color changes |
| `--ds-duration-normal` | `0.25s` | Transforms, layout shifts |
| `--ds-duration-slow` | `0.4s` | Page transitions, reveals |

### Utility Classes

Layout: `.ds-flex`, `.ds-flex-col`, `.ds-flex-wrap`, `.ds-flex-1`, `.ds-items-center`, `.ds-justify-center`, `.ds-justify-between`

Gap: `.ds-gap-1` through `.ds-gap-6`

Spacing: `.ds-p-0` through `.ds-p-6`, `.ds-m-0`, `.ds-mt-1`–`.ds-mt-4`, `.ds-mb-1`–`.ds-mb-4`

Text: `.ds-text-center`, `.ds-text-start`, `.ds-text-end`, `.ds-text-xs`–`.ds-text-3xl`, `.ds-font-medium`, `.ds-font-semibold`, `.ds-font-bold`, `.ds-truncate`

Sizing: `.ds-w-full`, `.ds-h-full`, `.ds-max-w-480`, `.ds-max-w-720`

Responsive: `.ds-show-mobile` / `.ds-show-desktop`, `.ds-hidden-mobile` / `.ds-hidden-desktop`

---

## 🔄 SkeletonLoader

Configurable shimmer skeleton placeholder for async data loading.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'text' \| 'circle' \| 'card' \| 'line' \| 'avatar' \| 'badge'` | `'text'` | Skeleton shape |
| `width` | `string` | `'100%'` | Custom width |
| `height` | `string` | auto | Custom height |
| `lines` | `number` | `3` | Number of lines (text/card variants) |

**Usage patterns:**

- **Stats grid:** 4 skeleton cards with avatar + 2 text lines each
- **Table rows:** Skeleton rows with text + badge placeholders
- **Form loading:** Skeleton text lines in card layout
- **Message list:** Avatar + text skeleton per row

CSS classes: `.ds-skeleton`, `.ds-skeleton--text`, `.ds-skeleton--circle`, `.ds-skeleton--line`, `.ds-skeleton--card`, `.ds-skeleton--avatar`, `.ds-skeleton--badge`

---

## 📐 Responsive Design

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Desktop | `> 768px` | Full sidebar, multi-column layouts |
| Mobile | `≤ 768px` | Hidden sidebar (hamburger toggle), stacked layouts |

### Mobile Sidebar

- Sidebar slides in from the left via `ds-sidebar--mobile-open` class
- Semi-transparent overlay (`ds-sidebar-overlay`) behind sidebar
- Tapping a nav link or the overlay closes the sidebar
- TopNavbar hamburger button toggles the sidebar

### Responsive Patterns

- Dashboard stats: 4 columns → 2 columns (≤1200px) → 1 column (≤640px)
- Tables: Header row hidden on mobile, content stacked
- Forms: Fields stack vertically
- Content grids: 2-column → 1-column on mobile
- App layout padding: 2.5rem → 1rem on mobile