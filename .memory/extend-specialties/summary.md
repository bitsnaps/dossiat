# Extend & Improve Supported Specialties

## Task
Extend the supported specialties in the agent profile setup so users can add more values (e.g. custom value) and add more common default specialties to the list.

## Problems
1. `specialtyOptions` in `AgentProfileSetup.vue` was a hardcoded array with only 8 options, using hardcoded English labels instead of i18n keys
2. `BTagGroup.vue` had no support for custom/user-added values — users could only pick from the predefined list
3. No i18n keys existed for the new specialties or the "add custom" UI
4. Pre-existing TS2322 type error in `AgentProfileView.spec.ts` (hasRole mock type mismatch) blocking `pnpm lint` / `vue-tsc --noEmit`

## Solutions

### 1. Extended `BTagGroup.vue` with custom-value support
- Added `allowCustom`, `customPlaceholder`, `customAddLabel` props
- Added text input + "Add" button below the tag group (only visible when `allowCustom` is true)
- Added keyboard support (Enter to add) and case-insensitive duplicate prevention
- Custom-selected values render as removable active tags even when not part of the static options
- New `add` event emitted when a custom value is added

### 2. Extended `specialtyOptions` in `AgentProfileSetup.vue`
- Converted from static array to `computed()` using `t()` for i18n labels
- Added 6 new common specialties: Translation, Marketing, Design, Logistics, Education, Healthcare
- Total options: 14 (8 original + 6 new)
- BTagGroup now receives `allow-custom`, `removable`, `custom-placeholder`, and `custom-add-label` props

### 3. Added i18n keys in all 3 locales (en, fr, ar)
New keys added:
- `agentProfile.setup.specialtyTranslation` — Translation / Traduction / ترجمة
- `agentProfile.setup.specialtyMarketing` — Marketing / Marketing / تسويق
- `agentProfile.setup.specialtyDesign` — Design / Design / تصميم
- `agentProfile.setup.specialtyLogistics` — Logistics / Logistique / لوجستيات
- `agentProfile.setup.specialtyEducation` — Education / Éducation / تعليم
- `agentProfile.setup.specialtyHealthcare` — Healthcare / Santé / رعاية صحية
- `agentProfile.setup.specialtyCustomPlaceholder` — Add a custom specialty placeholder
- `agentProfile.setup.specialtyAdd` — Add button label

### 4. Fixed pre-existing type error in `AgentProfileView.spec.ts`
- Changed `hasRole: vi.fn(() => false)` to `vi.fn((_role: string) => false)` so the mock signature matches all assignments including `vi.fn((role: string) => role === 'client')`

## Files Modified
- `src/components/base/BTagGroup.vue` — Added custom-value support (props, template, logic)
- `src/views/agent/AgentProfileSetup.vue` — Extended specialties list with i18n, enabled custom input
- `src/locales/en.json` — Added 8 new translation keys
- `src/locales/fr.json` — Added 8 new translation keys
- `src/locales/ar.json` — Added 8 new translation keys
- `tests/components/base/BTagGroup.spec.ts` — Added 12 new tests for custom-value functionality
- `tests/components/agent/AgentProfileSetup.spec.ts` — Added 1 test for specialties step navigation
- `tests/components/agent/AgentProfileView.spec.ts` — Fixed hasRole mock type signature

## Tests
- **i18n sync**: All locales in sync (1176 keys each) ✅
- **Targeted tests**: 32/32 passed (BTagGroup: 23, AgentProfileSetup: 9) ✅
- **pnpm lint**: Passed ✅
- **Full test suite**: All tests pass ✅

## Regressions
- No regressions detected. All existing BTagGroup tests still pass (backward-compatible: `allowCustom` defaults to `false`)
- The `specialtyOptions` change from static array to `computed()` does not break any existing test
