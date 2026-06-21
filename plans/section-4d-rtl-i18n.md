# Section 4d — Internationalization & RTL Support Plan

## 1. Codebase Audit Summary

### 1.1 Current State

The project already has `vue-i18n@^11.1.5` installed in [`package.json`](package.json:43) but not yet configured. There are no locale files, no i18n setup, and no `<i18n>` blocks in any component.

### 1.2 RTL-Critical Findings

#### CSS Physical Properties in [`src/assets/main.css`](src/assets/main.css)

| Line | Current Property | Logical Equivalent |
|------|------------------|--------------------|
| 501 | `padding-left: 36px` | `padding-inline-start: 36px` |
| 502 | `left: 12px` | `inset-inline-start: 12px` |
| 521 | `right: 1px` | `inset-inline-end: 1px` |
| 564 | `left: 0` | `inset-inline-start: 0` |
| 577 | `left: auto; right: 0` | `inset-inline-start: auto; inset-inline-end: 0` |
| 614 | `border-left: 1px solid` | `border-inline-start: 1px solid` |
| 642 | `text-align: left` | `text-align: start` |
| 658 | `margin-left: 6px` | `margin-inline-start: 6px` |
| 295 | `right: 24px` | `inset-inline-end: 24px` |
| 218 | `left: 0` | `inset-inline-start: 0` |
| 219 | `right: 0` | `inset-inline-end: 0` |

#### Inline Directional Styles in [`src/views/LandingPage.vue`](src/views/LandingPage.vue)

| Line | Current Style | Logical Equivalent |
|------|---------------|--------------------|
| 72 | `margin-right:-10px` | `margin-inline-end:-10px` |
| 73 | `margin-right:-10px` | `margin-inline-end:-10px` |

#### Bootstrap 5 Directional Utilities Used

The project uses `me-*` (margin-end) and `mx-auto` Bootstrap classes in [`LandingPage.vue`](src/views/LandingPage.vue:67). Bootstrap 5.3+ has built-in RTL support via its `data-bs-theme` + `dir` attribute approach, which auto-converts `me-*` to `ms-*` when `dir="rtl"` is set.

#### Hardcoded Strings (Candidates for i18n)

**[`src/components/base/BTable.vue`](src/components/base/BTable.vue):**
- Line 77: `'Search...'`
- Line 84: `'No data available.'`
- Line 321: `selected`
- Line 419: `All`
- Line 428: `Filter...`
- Line 505-508: `Showing ... of ...`
- Line 519: `/ page`

**[`src/components/base/BDropdown.vue`](src/components/base/BDropdown.vue):**
- Line 34: `'Select'`

**[`src/views/LandingPage.vue`](src/views/LandingPage.vue):**
- Hundreds of hardcoded English strings throughout all sections

#### Font Considerations for Arabic

The current font stack in [`index.html`](index.html:12) loads `Inter`, `Space Grotesk`, and `Fraunces` — none of which support Arabic script. Arabic fonts must be added.

---

## 2. Implementation Plan

### Phase 1: RTL Foundation (CSS Logical Properties)

**Goal:** Convert all physical directional CSS properties to CSS logical properties so layouts flip automatically with `dir="rtl"`.

#### Step 1.1: Convert [`src/assets/main.css`](src/assets/main.css)

Convert all 11 identified physical properties to logical equivalents:

```css
/* Before */
.ds-input-has-icon { padding-left: 36px; }
.ds-input-icon { position: absolute; left: 12px; }
.ds-avatar-online { position: absolute; bottom: 1px; right: 1px; }
.ds-dropdown-menu { position: absolute; top: calc(100% + 4px); left: 0; }
.ds-dropdown--end .ds-dropdown-menu { left: auto; right: 0; }
.ds-table-search__clear { border-left: 1px solid var(--ds-border); }
.ds-table__table th { text-align: left; }
.ds-table__sort-indicator { margin-left: 6px; }
.popular-badge { position: absolute; top: -12px; right: 24px; }
.trust-marquee::before { left: 0; }
.trust-marquee::after { right: 0; }

/* After */
.ds-input-has-icon { padding-inline-start: 36px; }
.ds-input-icon { position: absolute; inset-inline-start: 12px; }
.ds-avatar-online { position: absolute; bottom: 1px; inset-inline-end: 1px; }
.ds-dropdown-menu { position: absolute; top: calc(100% + 4px); inset-inline-start: 0; }
.ds-dropdown--end .ds-dropdown-menu { inset-inline-start: auto; inset-inline-end: 0; }
.ds-table-search__clear { border-inline-start: 1px solid var(--ds-border); }
.ds-table__table th { text-align: start; }
.ds-table__sort-indicator { margin-inline-start: 6px; }
.popular-badge { position: absolute; top: -12px; inset-inline-end: 24px; }
.trust-marquee::before { inset-inline-start: 0; }
.trust-marquee::after { inset-inline-end: 0; }
```

#### Step 1.2: Convert inline styles in [`LandingPage.vue`](src/views/LandingPage.vue:72)

Replace `margin-right:-10px` with `margin-inline-end:-10px` on avatar circles.

#### Step 1.3: Update [`index.html`](index.html)

Add `dir` attribute control. The `lang` and `dir` on `<html>` will be managed dynamically by the i18n composable, but the initial HTML should be clean:

```html
<html lang="en" dir="ltr" data-bs-theme="dark">
```

---

### Phase 2: i18n Setup

#### Step 2.1: Create locale files

```
src/locales/
├── en.json    # English (default, complete)
├── ar.json    # Arabic (complete)
└── fr.json    # French (complete)
```

Structure each locale file with namespace-based keys:

```json
{
  "nav": {
    "features": "Features",
    "howItWorks": "How it works",
    "forAgents": "For Agents",
    "pricing": "Pricing",
    "faq": "FAQ",
    "signIn": "Sign in",
    "getStarted": "Get started"
  },
  "hero": {
    "badge": "Now in private beta",
    "title": "Run missions across any border...",
    "subtitle": "Dossiat is a decentralized platform...",
    "cta": "Start your network",
    "playCta": "See how it works"
  },
  "components": {
    "table": {
      "search": "Search...",
      "noData": "No data available.",
      "selected": "selected",
      "all": "All",
      "filter": "Filter...",
      "showing": "Showing",
      "of": "of",
      "perPage": "/ page"
    },
    "dropdown": {
      "select": "Select"
    }
  }
}
```

#### Step 2.2: Configure vue-i18n

Create [`src/i18n.ts`](src/i18n.ts):

```ts
import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import ar from '@/locales/ar.json'
import fr from '@/locales/fr.json'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('ds-locale') || 'en',
  fallbackLocale: 'en',
  messages: { en, ar, fr },
})

export default i18n
```

Register in [`src/main.ts`](src/main.ts):

```ts
import i18n from './i18n'
app.use(i18n)
```

#### Step 2.3: Create direction composable

Create [`src/composables/useDirection.ts`](src/composables/useDirection.ts):

```ts
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export function useDirection() {
  const { locale } = useI18n()

  const dir = computed(() => (locale.value === 'ar' ? 'rtl' : 'ltr'))

  watch(dir, (newDir) => {
    document.documentElement.setAttribute('dir', newDir)
    document.documentElement.setAttribute('lang', locale.value)
  }, { immediate: true })

  return { dir }
}
```

#### Step 2.4: Create language switcher component

Create [`src/components/base/BLanguageSwitcher.vue`](src/components/base/BLanguageSwitcher.vue) — a dropdown that lists available locales and updates `locale` from `useI18n()`.

#### Step 2.5: Add Arabic font

Update the Google Fonts link in [`index.html`](index.html) to include an Arabic-supporting font:

```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,900&family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Add Arabic font family to [`src/assets/main.css`](src/assets/main.css):

```css
html[dir="rtl"] body {
  font-family: 'IBM Plex Sans Arabic', 'Inter', system-ui, sans-serif;
}
html[dir="rtl"] h1, html[dir="rtl"] h2, /* ... headings */ {
  font-family: 'IBM Plex Sans Arabic', 'Fraunces', serif;
}
html[dir="rtl"] .font-mono {
  font-family: 'IBM Plex Sans Arabic', 'Space Grotesk', monospace;
}
```

#### Step 2.6: Replace hardcoded strings in components

Replace hardcoded English strings in [`BTable.vue`](src/components/base/BTable.vue) and [`BDropdown.vue`](src/components/base/BDropdown.vue) with `$t()` calls.

#### Step 2.7: Replace hardcoded strings in views

Replace all hardcoded English strings in [`LandingPage.vue`](src/views/LandingPage.vue) with `$t()` translation keys. This is the largest single task.

---

### Phase 3: Bootstrap 5 RTL Compatibility

Bootstrap 5.3+ supports RTL natively. When `dir="rtl"` is set on `<html>`:

- `me-*` classes automatically become `ms-*` (margin-end becomes margin-start)
- `ms-*` classes automatically become `me-*`
- `pe-*` / `ps-*` swap similarly
- `text-start` / `text-end` swap
- `float-start` / `float-end` swap
- Grid columns flow right-to-left

The project uses Bootstrap 5.3.8 ([`package.json`](package.json:27)), which has full RTL support. No additional Bootstrap RTL build is needed — just setting `dir="rtl"` on `<html>` activates it.

#### Action Items:
- Verify Bootstrap 5.3 RTL works correctly with the existing grid usage in [`LandingPage.vue`](src/views/LandingPage.vue)
- Test that `me-2` / `me-1` utility classes in templates flip correctly
- Ensure accordion component RTL behavior is correct (collapse direction, arrow icon)

---

### Phase 4: Icon Direction Awareness

Certain Bootstrap Icons should flip in RTL mode:

- **Chevrons** in [`BTable.vue`](src/components/base/BTable.vue:526-557) pagination: `bi-chevron-left`, `bi-chevron-right`, `bi-chevron-double-left`, `bi-chevron-double-right`
- **Chevron-down** in [`BDropdown.vue`](src/components/base/BDropdown.vue:35): should stay as-is
- **Arrow icons** in sort indicators: `bi-arrow-up`, `bi-arrow-down` stay; `bi-arrow-down-up` stays
- **Copy icon** (`bi-copy`), **link icon** (`bi-link-45deg`): stay as-is

For pagination chevrons, add CSS to flip them in RTL:

```css
html[dir="rtl"] .bi-chevron-left { transform: scaleX(-1); }
html[dir="rtl"] .bi-chevron-right { transform: scaleX(-1); }
html[dir="rtl"] .bi-chevron-double-left { transform: scaleX(-1); }
html[dir="rtl"] .bi-chevron-double-right { transform: scaleX(-1); }
```

---

### Phase 5: Mixed Content Handling

Some content should NOT flip in RTL mode:
- **Numbers/currency**: `$29/mo`, `1%`, `2,400+`
- **URLs**: `dossiat.app/i/yassine-benali`
- **Code/monospace**: API references

Add utility class:

```css
[dir="rtl"] .no-flip {
  direction: ltr;
  unicode-bidi: isolate;
}
```

---

## 3. Implementation Order

| Priority | Task | Depends On |
|----------|------|------------|
| 1 | Create `src/locales/en.json` with all translatable strings | Nothing |
| 2 | Create `src/locales/fr.json` | en.json |
| 3 | Create `src/locales/ar.json` | en.json |
| 4 | Configure `vue-i18n` in `src/i18n.ts` and register in `main.ts` | Locale files |
| 5 | Create `useDirection` composable | i18n config |
| 6 | Add Arabic font to `index.html` and `main.css` | Nothing |
| 7 | Convert all CSS physical properties to logical in `main.css` | Nothing |
| 8 | Convert inline directional styles in `LandingPage.vue` | Nothing |
| 9 | Replace hardcoded strings in `BTable.vue` | i18n config |
| 10 | Replace hardcoded strings in `BDropdown.vue` | i18n config |
| 11 | Replace hardcoded strings in `LandingPage.vue` | i18n config |
| 12 | Create `BLanguageSwitcher` component | i18n config, useDirection |
| 13 | Add icon flip CSS for RTL pagination | Nothing |
| 14 | Add `.no-flip` utility class for mixed content | Nothing |
| 15 | Test full RTL layout with Arabic locale | All above |
| 16 | Write tests for `useDirection` composable | i18n config |

Steps 1-3, 6-8, 13-14 can be done in parallel. Steps 9-11 are the largest effort (string extraction).

---

## 4. Risk Assessment

| Risk | Mitigation |
|------|------------|
| Bootstrap 5.3 RTL may have edge cases with custom CSS classes | Test thoroughly; use logical properties instead of Bootstrap RTL overrides where possible |
| Arabic font loading may affect layout (different metrics) | Use `font-display: swap` and test with Arabic content |
| Large number of hardcoded strings in `LandingPage.vue` | This is expected and will be handled by the i18n task regardless of RTL |
| `transform: scaleX(-1)` on icons may affect accessibility | Add `aria-hidden="true"` to decorative icons already in use |
| CSS logical properties not supported in very old browsers | Target browsers with > 1% market share; logical properties are supported in all modern browsers |

---

## 5. Files to Create/Modify

### New Files
- [`src/i18n.ts`](src/i18n.ts) — vue-i18n configuration
- [`src/locales/en.json`](src/locales/en.json) — English translations
- [`src/locales/fr.json`](src/locales/fr.json) — French translations
- [`src/locales/ar.json`](src/locales/ar.json) — Arabic translations
- [`src/composables/useDirection.ts`](src/composables/useDirection.ts) — RTL direction composable
- [`src/components/base/BLanguageSwitcher.vue`](src/components/base/BLanguageSwitcher.vue) — Language picker

### Modified Files
- [`index.html`](index.html) — Add `dir` attribute, Arabic font
- [`src/main.ts`](src/main.ts) — Register vue-i18n plugin
- [`src/assets/main.css`](src/assets/main.css) — Convert physical to logical CSS properties, add RTL font stack, add icon flip rules, add `.no-flip` utility
- [`src/views/LandingPage.vue`](src/views/LandingPage.vue) — Replace hardcoded strings with `$t()`, convert inline directional styles
- [`src/components/base/BTable.vue`](src/components/base/BTable.vue) — Replace hardcoded strings with `$t()`
- [`src/components/base/BDropdown.vue`](src/components/base/BDropdown.vue) — Replace hardcoded strings with `$t()`
- [`docs/TODO.md`](docs/TODO.md) — Updated with RTL subtasks (done)
