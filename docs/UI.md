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