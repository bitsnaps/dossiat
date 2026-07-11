# Fix Share Invite Link Button

## Task
Fix the "Share Invite Link" button on the agent dashboard — it was redirecting to the settings page instead of showing the invite link sharing UI.

## Problem
The button in `src/views/agent/AgentDashboard.vue:173-175` had `to="/app/settings"` which navigated to the generic account settings page (name/password only). There was no invite link UI there.

Additionally, `AgentSettingsView.vue` (which contains the `InviteLinkShare` component) was never registered in the router, making the invite link feature unreachable from the dashboard.

## Root Cause
- Button used `to="/app/settings"` — wrong destination
- `AgentSettingsView.vue` exists but is not wired into the router
- `InviteLinkShare.vue` component existed and worked correctly, but was only reachable via the public profile page

## Solution
Modified `src/views/agent/AgentDashboard.vue` to open a modal with `InviteLinkShare` directly on the dashboard:

1. **Added imports**: `BModal`, `InviteLinkShare`, `ref`, `onMounted`
2. **Added state**: `showInviteModal` ref + `inviteSlug` computed from `agentProfileStore.profile?.uniqueInviteSlug`
3. **Added `onMounted`**: fetches agent profile on mount so `uniqueInviteSlug` is available
4. **Replaced button**: removed `to="/app/settings"`, added `@click="showInviteModal = true"` and `:disabled="!inviteSlug"`
5. **Added modal**: `<BModal>` containing `<InviteLinkShare :slug="inviteSlug" />`

## Files Changed
- `src/views/agent/AgentDashboard.vue` — added modal-based invite link sharing

## Tests
All 1439 tests pass (128 test files).

## Related Files
- `src/components/agent/InviteLinkShare.vue` — the invite link sharing component (copy, WhatsApp, email, regenerate)
- `src/stores/agentProfile.ts` — provides `profile.uniqueInviteSlug` and `fetchProfile()`
- `src/components/base/BModal.vue` — modal component used for the overlay
- `src/views/agent/AgentSettingsView.vue` — exists but is NOT routed (orphaned view)
