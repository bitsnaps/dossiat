# Section 5h — Subscription Frontend Pages

## Overview

Implement 3 subscription views for clients to browse plans, manage their current subscription, and view billing history. The backend and store/service layers already have core subscription CRUD; this plan extends them with missing invoice fetching and billing portal functionality.

## Current State

### What exists
- **Backend** [`src/server/routes/subscriptions.ts`](src/server/routes/subscriptions.ts): `GET /plans`, `POST /`, `GET /me`, `PUT /me`, `DELETE /me`, `POST /me/portal`
- **Service** [`src/services/subscriptions.ts`](src/services/subscriptions.ts): `getPlans()`, `subscribe()`, `getMySubscription()`, `updateSubscription()`, `cancelSubscription()`
- **Store** [`src/stores/subscriptions.ts`](src/stores/subscriptions.ts): `plans`, `currentSubscription`, `currentPlan`, `fetchPlans()`, `fetchMySubscription()`
- **Models**: `SubscriptionPlan`, `Subscription`, `SubscriptionInvoice` all defined in [`src/server/database/models/index.ts`](src/server/database/models/index.ts)
- **Seeder**: 3 plans seeded — `small_business` (29/mo), `professional` (99/mo), `enterprise` (499/mo)
- **Router**: `/app/subscriptions` exists but points to `DashboardView.vue` placeholder
- **i18n**: `layout.sidebar.subscriptions` key exists; `pricing.*` keys for landing page pricing exist but no `subscriptions.*` namespace yet

### What's missing
1. No `GET /subscriptions/me/invoices` endpoint (SubscriptionInvoice model exists but no route)
2. Store lacks invoice fetching, subscribe, cancel, and billing portal actions
3. Service lacks `getSubscriptionInvoices()` and `openBillingPortal()` functions
4. No subscription-specific i18n keys
5. No subscription view components
6. Router subscription routes are placeholders

---

## Architecture

```mermaid
flowchart TD
    subgraph ClientViews
        A[SubscriptionPlansView]
        B[SubscriptionManageView]
        C[SubscriptionBillingView]
    end

    subgraph Router
        D[/app/subscriptions/plans]
        E[/app/subscriptions/manage]
        F[/app/subscriptions/billing]
    end

    subgraph Store
        G[useSubscriptionsStore]
    end

    subgraph Backend
        H[GET /subscriptions/plans]
        I[GET /subscriptions/me]
        J[POST /subscriptions]
        K[PUT /subscriptions/me]
        L[DELETE /subscriptions/me]
        M[GET /subscriptions/me/invoices]
        N[POST /subscriptions/me/portal]
    end

    D --> A
    E --> B
    F --> C
    A --> G
    B --> G
    C --> G
    G --> H
    G --> I
    G --> J
    G --> K
    G --> L
    G --> M
    G --> N
```

---

## Detailed Plan

### Step 1: Add missing backend endpoint

**File**: [`src/server/routes/subscriptions.ts`](src/server/routes/subscriptions.ts)

Add `GET /me/invoices` endpoint that:
- Authenticates the user, role-guards as `client`
- Looks up the client's subscription
- Returns all `SubscriptionInvoice` records for that subscription, ordered by `createdAt DESC`

### Step 2: Extend service layer

**File**: [`src/services/subscriptions.ts`](src/services/subscriptions.ts)

Add:
- `getSubscriptionInvoices()` → `GET /subscriptions/me/invoices`
- `openBillingPortal()` → `POST /subscriptions/me/portal`

### Step 3: Extend store

**File**: [`src/stores/subscriptions.ts`](src/stores/subscriptions.ts)

Add:
- `invoices` ref with `SubscriptionInvoice` interface
- `fetchInvoices()` action
- `subscribeToPlan(planId)` action — wraps service call, refreshes subscription
- `updatePlan(planId)` action — wraps service call, refreshes subscription
- `cancelPlan()` action — wraps service call, clears subscription
- `openPortal()` action — returns portal URL for billing management

### Step 4: Add i18n keys

**Files**: [`src/locales/en.json`](src/locales/en.json), [`src/locales/fr.json`](src/locales/fr.json), [`src/locales/ar.json`](src/locales/ar.json)

Add `subscriptions` namespace with keys for:
- Plans view: title, subtitle, plan names, feature labels, CTAs, per-month label
- Manage view: title, subtitle, current plan, plan details, upgrade/downgrade, cancel, confirm cancel
- Billing view: title, subtitle, invoice table headers, status badges, empty state, download
- Common: loading, error, success messages

### Step 5: Create SubscriptionPlansView

**File**: `src/views/subscription/SubscriptionPlansView.vue`

Port the pricing card layout from [`LandingPage.vue`](src/views/LandingPage.vue) lines 376-445 but adapted for the app context:
- Fetch plans from store on mount
- Render 3 tier cards (small_business, professional, enterprise)
- Each card shows: plan name, price, feature checklist, max seats, max recurrent missions
- Highlight "popular" on professional tier
- CTA buttons: "Current Plan" (disabled) if already subscribed, "Subscribe" otherwise
- Clicking Subscribe calls `store.subscribeToPlan(planId)` then redirects to manage view

### Step 6: Create SubscriptionManageView

**File**: `src/views/subscription/SubscriptionManageView.vue`

- Fetch current subscription + all plans on mount
- If no subscription: show "No active subscription" with CTA to plans view
- If subscribed: show current plan card (name, price, period dates, status badge)
- Plan switcher: list other plans as radio cards with upgrade/downgrade labels
- Change plan button → calls `store.updatePlan(planId)`
- Cancel button → confirmation dialog → calls `store.cancelPlan()`
- Billing portal link → calls `store.openPortal()` and opens URL in new tab

### Step 7: Create SubscriptionBillingView

**File**: `src/views/subscription/SubscriptionBillingView.vue`

Follow the same pattern as [`InvoiceListView.vue`](src/views/payments/InvoiceListView.vue):
- Fetch invoices from store on mount
- Table columns: Date, Amount, Status, Paid At
- Status badges using `BBadge` component
- Empty state if no invoices
- Back link to manage view

### Step 8: Update router

**File**: [`src/router/index.ts`](src/router/index.ts)

Replace the placeholder `/app/subscriptions` route:
- `/app/subscriptions` → redirect to `/app/subscriptions/manage`
- `/app/subscriptions/plans` → `SubscriptionPlansView.vue`
- `/app/subscriptions/manage` → `SubscriptionManageView.vue`
- `/app/subscriptions/billing` → `SubscriptionBillingView.vue`

All routes should be `roles: ['client']` only.

### Step 9: Write tests

Create test files in `tests/components/subscription/`:
- `SubscriptionPlansView.spec.ts` — plan cards render, subscribe button works, already-subscribed state
- `SubscriptionManageView.spec.ts` — shows current plan, plan switching, cancel flow
- `SubscriptionBillingView.spec.ts` — invoice table, empty state, status badges

### Step 10: Update TODO

Check off the 3 items in [`docs/TODO.md`](docs/TODO.md) lines 350-354.

---

## Design Decisions

1. **Separate views for plans/manage/billing** rather than tabs in a single view — keeps components small, matches existing payment views pattern, and allows direct URL linking
2. **No new store** — extend existing `useSubscriptionsStore` to keep things simple
3. **i18n for all text** — consistent with the rest of the app; plan names kept as i18n keys since they appear in UI (landing page uses `pricing.smallBusiness` etc.)
4. **CSS follows `ds-*` BEM naming convention** — matches existing views
5. **Billing portal redirect** — for Stripe-connected subscriptions, the existing `POST /me/portal` endpoint already creates a Stripe billing portal session; the manage view links to it
