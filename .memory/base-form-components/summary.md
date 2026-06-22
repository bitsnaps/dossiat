# Task: Base Form Components (BRadioGroup, BTagGroup, BSelect)

**Date:** 2026-06-22
**Status:** Completed

## Problem
Multiple view files had hand-coded radio button groups, tag/chip toggles, and native `<select>` elements. These patterns were duplicated across:
- `AgentSettingsView.vue` (specialties, client types, currency)
- `AgentProfileSetup.vue` (specialties, client types, currency)
- `MissionCreateView.vue` (pricing type, mission type, currency)
- `ClientSettingsView.vue` (company size, industry)

## Solution
Created 3 new reusable base components following the existing design system patterns.

### Components Created

#### BRadioGroup (`src/components/base/BRadioGroup.vue`)
- **Props:** `modelValue` (string), `options` ({ value, label, icon? }[]), `label`, `name`, `error`, `hint`, `disabled`, `orientation` (horizontal|vertical)
- **Events:** `update:modelValue`
- **Features:** ARIA radiogroup role, keyboard accessible, icon support, error/hint states
- **Tests:** 11 tests in `tests/components/base/BRadioGroup.spec.ts`

#### BTagGroup (`src/components/base/BTagGroup.vue`)
- **Props:** `modelValue` (string[]), `options` ({ value, label, icon? }[]), `label`, `error`, `hint`, `disabled`, `removable`
- **Events:** `update:modelValue`, `remove`
- **Features:** Multi-select toggle chips, removable mode with X button, icon support
- **Tests:** 13 tests in `tests/components/base/BTagGroup.spec.ts`

#### BSelect (`src/components/base/BSelect.vue`)
- **Props:** `modelValue` (string), `options` ({ value, label, disabled? }[]), `label`, `placeholder`, `error`, `hint`, `disabled`
- **Events:** `update:modelValue`
- **Features:** Custom chevron, appearance reset, placeholder support, per-option disabled state
- **Tests:** 11 tests in `tests/components/base/BSelect.spec.ts`

### Files Modified
- `src/components/base/index.ts` — Added exports for 3 new components
- `src/assets/main.css` — Added CSS for `ds-radio-group`, `ds-radio-option`, `ds-tag-group`, `ds-tag`, `ds-select`
- `src/views/agent/AgentSettingsView.vue` — Replaced specialty chips, radio group, select
- `src/views/agent/AgentProfileSetup.vue` — Replaced specialty chips, radio group, select
- `src/views/missions/MissionCreateView.vue` — Replaced radio groups, select; removed duplicate scoped CSS
- `src/views/client/ClientSettingsView.vue` — Replaced native selects

### Key Decisions
1. **Click handler on label wrapper** for BRadioGroup instead of `@change` on hidden input — needed for JSDOM test compatibility
2. **`computed()` for i18n labels** in MissionCreateView — options with translated labels must be reactive
3. **Global CSS classes** (not scoped) — matches the pattern of other base components like BButton, BInput, etc.
4. **No third-party libraries** — pure Vue 3 components, consistent with project rules

### Test Results
- **747 tests passed** (0 failures, 2 pre-existing skips)
- All 35 new component tests pass

## Follow-up
- The LandingPage.vue has some `.specialty-tag` usage for display-only tags — these are cosmetic and don't need refactoring (they're not form elements)
- The `RegisterView.vue` has role selection buttons — these are icon-based role cards with a different layout pattern, not standard radio buttons
