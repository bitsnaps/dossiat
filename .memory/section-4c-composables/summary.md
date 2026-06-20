# Section 4c — Composables

## Task Summary

Implemented all 6 composables listed in `docs/TODO.md` section 4c using TDD (test-first) approach.

## Files Created

### Source Files
- `src/composables/usePagination.ts` — Reactive pagination state (page, perPage, total, totalPages, hasNext, hasPrev, next, prev, goTo, reset)
- `src/composables/useDebounce.ts` — Debounced search input with immediateValue and debouncedValue refs
- `src/composables/useCopyToClipboard.ts` — Clipboard API wrapper with isSupported check and copied state
- `src/composables/useAuth.ts` — Thin wrapper around useAuthStore with storeToRefs for reactive state
- `src/composables/useToast.ts` — Global toast notification system with auto-dismiss and convenience methods
- `src/composables/useConfirmDialog.ts` — Promise-based confirmation dialog composable

### Test Files
- `tests/composables/usePagination.spec.ts` — 22 tests
- `tests/composables/useDebounce.spec.ts` — 8 tests
- `tests/composables/useCopyToClipboard.spec.ts` — 8 tests
- `tests/composables/useAuth.spec.ts` — 11 tests
- `tests/composables/useToast.spec.ts` — 13 tests
- `tests/composables/useConfirmDialog.spec.ts` — 12 tests

### Modified Files
- `vitest.config.ts` — Added `tests/composables/**` to jsdom environment glob
- `docs/TODO.md` — Checked off all 4c composables + unit tests item in 8a

## Test Results

- All 74 new composable tests pass
- No regressions in existing test suite (one pre-existing flaky test in `tests/server/routes/auth.spec.ts` due to SQLite race condition when running full suite)

## Design Decisions

1. **useAuth**: Used `storeToRefs()` instead of destructuring store directly, to preserve reactivity of computed properties like `isAuthenticated`. Wrapped `login`/`logout` in functions that delegate to `store.login`/`store.logout` to ensure Pinia action context is preserved.

2. **useToast**: Uses module-level shared state (`toasts` ref, `timers` map, `nextId` counter) so all consumers share the same toast queue. Added `clearAll()` method for test cleanup.

3. **useConfirmDialog**: Promise-based pattern — `showConfirm()` returns a Promise that resolves when `confirm()` or `cancel()` is called. Each call replaces the previous resolver.

4. **useCopyToClipboard**: Checks `navigator.clipboard?.writeText` availability for `isSupported` computed. Returns `false` gracefully when API is unavailable.

5. **useDebounce**: Custom implementation (not VueUse) for simplicity. Uses `setTimeout`/`clearTimeout` with configurable delay. `update()` sets `immediateValue` instantly and debounces `debouncedValue`.

6. **usePagination**: Pure reactive state with computed properties. Clamps `goTo()` to valid range. `next()`/`prev()` respect boundaries.

## Issues Encountered

- `src/composables` was initially created as a file instead of a directory by `write_to_file`. Fixed by deleting the file and using `mkdir -p` to create the directory first.
- Pinia action destructuring in `useAuth` caused spy issues in tests. Fixed by wrapping actions in thin functions that call `store.action()`.
- `store.isAuthenticated` was unwrapped to a plain boolean when accessed directly. Fixed by using `storeToRefs()` to get a reactive ref.
- `navigator.clipboard` is undefined in jsdom. Fixed tests to mock it with `Object.defineProperty`.
