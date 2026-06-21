# Section 4d — Internationalization (i18n) & RTL Support

## Task Summary

Implemented full i18n infrastructure with `vue-i18n` for English, French, and Arabic locales, plus complete RTL layout support for Arabic. Added language switcher to the landing page navbar and footer.

## Files Created

### Source Files
- `src/i18n.ts` — vue-i18n configuration with `legacy: false`, locale persistence via `localStorage('ds-locale')`, fallback to English
- `src/composables/useDirection.ts` — Reactive composable that sets `dir` and `lang` attributes on `<html>` based on active locale, persists locale to localStorage
- `src/components/base/BLanguageSwitcher.vue` — Dropdown component with EN/FR/AR options, globe icon, checkmark for active locale, outside-click-to-close behavior
- `src/locales/en.json` — English translations (~11KB) covering all LandingPage sections, base components, nav, footer
- `src/locales/fr.json` — French translations (~13KB)
- `src/locales/ar.json` — Arabic translations (~10KB)

### Test Files
- `tests/helpers/setup.ts` — Global i18n plugin registration for `@vue/test-utils` via `config.global.plugins`

### Modified Files
- `index.html` — Added `dir="ltr"` attribute; added IBM Plex Sans Arabic to Google Fonts link
- `src/main.ts` — Registered i18n plugin (`app.use(i18n)`)
- `src/assets/main.css` — Converted 11 physical CSS properties to logical equivalents; added RTL font stack for `html[dir="rtl"]`; added icon flip rules for pagination chevrons; added `.no-flip` utility class
- `src/views/LandingPage.vue` — Added i18n imports and `useDirection()` call; replaced all hardcoded English strings with `t()` calls across all sections (nav, hero, mockup, trust bar, features, workflow, agents, pricing, FAQ, CTA, footer); added `<BLanguageSwitcher />` in navbar and footer; converted inline `margin-right` to `margin-inline-end`
- `src/components/base/BTable.vue` — Added `useI18n()` import; replaced 7 hardcoded strings with `t()` calls (search, empty state, selected, all, filter, showing/of, per page)
- `src/components/base/BDropdown.vue` — Added `useI18n()` import; replaced default "Select" label with `t()` call
- `vitest.config.ts` — Added `setupFiles: ['./tests/helpers/setup.ts']` for global i18n in tests

## Test Results

- All 50 test files pass (473 tests pass, 2 skipped)
- No regressions in any existing tests

## RTL Implementation Details

### CSS Logical Properties Converted
| Original | Logical Equivalent |
|----------|--------------------|
| `padding-left: 36px` | `padding-inline-start: 36px` |
| `left: 12px` | `inset-inline-start: 12px` |
| `right: 1px` | `inset-inline-end: 1px` |
| `left: 0` | `inset-inline-start: 0` |
| `border-left: 1px solid` | `border-inline-start: 1px solid` |
| `text-align: left` | `text-align: start` |
| `margin-left: 6px` | `margin-inline-start: 6px` |
| `right: 24px` | `inset-inline-end: 24px` |

### RTL Font Stack
- `html[dir="rtl"] body` → IBM Plex Sans Arabic, Inter
- `html[dir="rtl"] h1-h6` → IBM Plex Sans Arabic, Fraunces
- `html[dir="rtl"] .font-mono` → IBM Plex Sans Arabic, Space Grotesk

### Bootstrap 5 RTL
Bootstrap 5.3.8 handles RTL natively — `me-*`/`ms-*` classes auto-flip when `dir="rtl"` is set on `<html>`. No extra RTL build needed.

## Design Decisions

1. **vue-i18n legacy: false** — Using Composition API mode (`useI18n()`) instead of Options API (`$t()`) for consistency with the project's `<script setup>` pattern.

2. **useDirection composable** — Separate from i18n to keep concerns clean. Watches `locale` changes and updates `document.documentElement` attributes. Uses `immediate: true` to set initial state on page load.

3. **BLanguageSwitcher** — Uses outside-click-to-close via document event listener. Shared reactive `locale` state means navbar and footer instances stay in sync automatically.

4. **Locale persistence** — Stored in `localStorage('ds-locale')` by both `useDirection` (on change) and `i18n.ts` (on initialization).

5. **Translation key structure** — Namespace-based (`nav.features`, `hero.badge`, `pricing.ctaSmall`, etc.) for clarity and auto-completion support.

6. **Test setup** — Global i18n plugin via `tests/helpers/setup.ts` using `@vue/test-utils` `config.global.plugins` instead of per-test mounting, keeping test code clean.

## Issues Encountered

- **BTable/BDropdown tests initially failed** — Adding `useI18n()` to components broke tests because i18n plugin wasn't registered in the test environment. Fixed by creating `tests/helpers/setup.ts` with global plugin registration and adding it to `vitest.config.ts` `setupFiles`.

- **BDropdown.vue lost `open` ref and toggle/onSelect** — During the i18n refactor, the `ref` import was accidentally dropped and the `open`, `toggle`, `onSelect` definitions were lost. Fixed by adding `ref` back to imports and restoring the removed functions.

- **LandingPage i18n was very large** — The file had ~200+ hardcoded strings across 8 sections. Used a subtask to handle the bulk replacement efficiently.

## TODO Items Checked Off

All 22 items in `docs/TODO.md` sections 4d (6 items) and 4d-RTL (15 items) plus the language switcher item were checked off.
