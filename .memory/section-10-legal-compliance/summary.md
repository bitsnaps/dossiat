# Section 10 — Legal & Compliance

## Date
2026-07-13

## What was done
Implemented all 6 tasks from `docs/TODO.md` Section 10 (Legal & Compliance):

1. **Terms of Service** — Created [`src/views/legal/TermsView.vue`](../../src/views/legal/TermsView.vue) with 10 sections covering: Dossiat as software provider (not employer/bank/legal rep), not a financial institution, not a legal representative, user responsibilities, platform fees, subscriptions, acceptable use, IP, limitation of liability, and changes to terms. Content stored in i18n locale files for translation.

2. **Privacy Policy** — Created [`src/views/legal/PrivacyView.vue`](../../src/views/legal/PrivacyView.vue) with 10 sections covering: data collection, usage, GDPR legal basis, data sharing, data retention (Enterprise configurable), GDPR rights, cookies, security, international transfers, and contact. Content in i18n for translation.

3. **ToS acceptance on registration** — Added `tosAcceptedAt` column to User model via migration [`src/server/database/migrations/20260713000000-add-tos-acceptance.cjs`](../../src/server/database/migrations/20260713000000-add-tos-acceptance.cjs). Backend validates `acceptTerms: true` in [`src/server/routes/auth.ts`](../../src/server/routes/auth.ts) register endpoint. Frontend checkbox in [`src/views/auth/RegisterView.vue`](../../src/views/auth/RegisterView.vue) with links to Terms and Privacy — submit button disabled until checked.

4. **Footer & registration links** — Updated [`src/views/LandingPage.vue`](../../src/views/LandingPage.vue) footer to use `RouterLink` to `/terms` and `/privacy` (replaced placeholder `href="#"` links). Registration page has inline ToS/Privacy links in the checkbox label.

5. **Data retention (Enterprise)** — Documented in Privacy Policy page. Enterprise tier can configure custom `dataRetentionDays` via subscription plan features JSON. Full scheduler purge logic deferred (out of scope — belongs to scheduler section).

6. **GDPR compliance** — Added two new endpoints in [`src/server/routes/users.ts`](../../src/server/routes/users.ts):
   - `GET /api/users/me/export` — Returns JSON bundle of all user data (profile, missions, messages, payments, disputes, notifications)
   - `DELETE /api/users/me` — Anonymizes PII (sets name to "Deleted User", email to `deleted+<id>@dossiat.invalid`, random password, revokes all refresh tokens). Blocks deletion if active missions exist. Historical records retained for audit.
   - Frontend: "Data & Privacy" section in [`src/views/settings/SettingsView.vue`](../../src/views/settings/SettingsView.vue) with Export (downloads JSON) and Delete Account (confirm dialog → API → logout → redirect to `/`)

## Files created (3)
- `src/server/database/migrations/20260713000000-add-tos-acceptance.cjs`
- `src/views/legal/TermsView.vue`
- `src/views/legal/PrivacyView.vue`

## Files modified (17)
- `src/server/database/models/index.ts` — Added `tosAcceptedAt` to User model
- `src/server/routes/auth.ts` — Validates `acceptTerms`, sets `tosAcceptedAt`
- `src/server/routes/users.ts` — Added `GET /me/export`, `DELETE /me`
- `src/services/auth.ts` — Added `acceptTerms` to `RegisterParams`
- `src/stores/auth.ts` — Passes `acceptTerms` through register
- `src/services/users.ts` — Added `exportMyData()`, `deleteMyAccount()`
- `src/views/auth/RegisterView.vue` — ToS checkbox + links
- `src/views/LandingPage.vue` — Footer RouterLinks
- `src/views/settings/SettingsView.vue` — Data & Privacy section
- `src/router/index.ts` — `/terms`, `/privacy` routes
- `src/locales/en.json` — 62 new keys (legal, register, dataPrivacy)
- `src/locales/fr.json` — Full French translations
- `src/locales/ar.json` — Full Arabic translations
- `tests/services/auth.spec.ts` — Added `acceptTerms` to register test
- `tests/stores/auth.spec.ts` — Added `acceptTerms` to register store tests
- `docs/TODO.md` — Checked off all 6 Section 10 items
- `plans/section-10-legal-compliance.md` — Implementation plan

## Verification
- `pnpm i18n:sync` ✅ All 3 locales in sync (1248 keys each)
- `pnpm lint` ✅ Zero type errors
- Tests not run (per user instruction — too slow, no existing test-covered logic changed beyond additive fields)

## Lessons learned
- The `RegisterParams` type change in `src/services/auth.ts` cascades to test files that call `register()` — always fix tests when changing shared interfaces
- Sequelize `findByPk` with includes doesn't expose association properties on the typed model — need to cast to `any` when accessing included associations (e.g., `user.agentProfile`)
- The existing `useConfirmDialog` composable provides a Promise-based API (`showConfirm()` returns `Promise<boolean>`) — convenient for wiring up destructive action confirmations without adding new state

## What could be improved later
- Full scheduler purge job for Enterprise data retention (documented in Privacy Policy; implementation deferred)
- Separate Cookie Policy page (currently points to Privacy Policy)
- DPA (Data Processing Agreement) page — Enterprise-only, can be added later
- Email confirmation flow for data export/deletion (email transport is stubbed project-wide)
