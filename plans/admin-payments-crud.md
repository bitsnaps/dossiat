# Admin Payments Full CRUD - Implementation Plan

## Goal

Implement the full CRUD (Create, Read, Update, Delete) + status management for the admin payments page, following a TDD approach to avoid regressions.

---

## Current State

### What already exists

| Layer | Functionality | Status |
|-------|--------------|--------|
| Backend routes | `GET /api/admin/payments` + `GET /api/admin/payments/:id` | ✅ Done |
| Frontend service | `getPayments()` + `getPayment()` | ✅ Done |
| Frontend store | `fetchPayments()` + `fetchPayment()` | ✅ Done |
| Frontend view | List page with filters/pagination | ✅ Done |
| Tests (routes) | Admin payment route tests | ❌ Missing |
| Tests (service) | Only `getPayments`/`getPayment` tests | ⚠️ Partial |
| Tests (store) | Only `fetchPayments` test | ⚠️ Partial |

### What's missing

| Layer | Functionality | Status |
|-------|--------------|--------|
| Backend routes | `POST`, `PUT`, `DELETE`, `PATCH /status` | ❌ Missing |
| Frontend service | `createPayment`, `updatePayment`, `deletePayment`, `updatePaymentStatus` | ❌ Missing |
| Frontend store | `createPayment`, `updatePayment`, `deletePayment`, `updatePaymentStatus` actions | ❌ Missing |
| Frontend view | Detail page (`AdminPaymentDetailView.vue`) | ❌ Missing |
| Frontend view | Actions column, create/edit modal, delete confirmation on list page | ❌ Missing |
| Frontend router | `admin-payment-detail` route | ❌ Missing |
| i18n translations | Missing admin payment CRUD keys | ❌ Missing |

---

## Implementation Steps

### Step 1: Backend Routes - Add CRUD endpoints

**File:** [`src/server/routes/admin.ts`](src/server/routes/admin.ts)

Add 4 new routes following the existing patterns (users/missions):

1. **`POST /api/admin/payments`** - Create a payment
   - Body: `missionId` (required), `payerId` (required), `payeeId` (required), `amount` (required), `method` (required), `currency` (optional, default USD), `status` (optional, default pending)
   - Validate mission, payer, payee exist
   - Auto-calculate fees using `calculateAllFees()` from payment service
   - Return payment with includes

2. **`PUT /api/admin/payments/:id`** - Update a payment
   - Body: `amount`, `method`, `currency`, `status` (all optional)
   - Recalculate fees if amount or method changes
   - Return updated payment

3. **`DELETE /api/admin/payments/:id`** - Delete a payment
   - Hard delete (same pattern as users/missions)
   - Return success with deleted id

4. **`PATCH /api/admin/payments/:id/status`** - Update payment status only
   - Body: `status` (required, one of: pending, confirmed, failed, refunded)
   - Simple status change without recalculating fees
   - If status becomes confirmed, set `confirmedAt`

### Step 2: Backend Route Tests

**File:** [`tests/server/routes/admin.spec.ts`](tests/server/routes/admin.spec.ts)

Add test section for admin payment CRUD (following existing test patterns):

- `POST /api/admin/payments` - Creates payment with auto-calculated fees
- `POST /api/admin/payments` - Rejects without required fields
- `POST /api/admin/payments` - Rejects with invalid method
- `POST /api/admin/payments` - Rejects with non-existent mission/payer/payee
- `PUT /api/admin/payments/:id` - Updates payment fields
- `PUT /api/admin/payments/:id` - Recalculates fees on amount change
- `PUT /api/admin/payments/:id` - Returns 404 for non-existent
- `DELETE /api/admin/payments/:id` - Deletes payment
- `DELETE /api/admin/payments/:id` - Returns 404 for non-existent
- `PATCH /api/admin/payments/:id/status` - Updates status
- `PATCH /api/admin/payments/:id/status` - Sets confirmedAt when confirmed
- `PATCH /api/admin/payments/:id/status` - Rejects invalid status

### Step 3: Frontend Service Functions

**File:** [`src/services/admin.ts`](src/services/admin.ts)

Add 4 new service functions:

- `createPayment(data)` → `POST /admin/payments`
- `updatePayment(id, data)` → `PUT /admin/payments/:id`
- `deletePayment(id)` → `DELETE /admin/payments/:id`
- `updatePaymentStatus(id, status)` → `PATCH /admin/payments/:id/status`

### Step 4: Frontend Service Tests

**File:** [`tests/services/admin.spec.ts`](tests/services/admin.spec.ts)

Add tests for the 4 new service functions (same pattern as existing tests).

### Step 5: Frontend Store Actions

**File:** [`src/stores/admin.ts`](src/stores/admin.ts)

Add 4 new store actions:

- `createPayment(data)` - Creates and unshifts to payments array
- `updatePayment(id, data)` - Updates in payments array and selectedPayment
- `deletePayment(id)` - Removes from payments array
- `updatePaymentStatus(id, status)` - Updates status on selectedPayment

### Step 6: Frontend Store Tests

**File:** [`tests/stores/admin.spec.ts`](tests/stores/admin.spec.ts)

Add tests for the 4 new store actions (success + failure cases).

### Step 7: i18n Translations

**Files:** [`src/locales/en.json`](src/locales/en.json), [`src/locales/fr.json`](src/locales/fr.json), [`src/locales/ar.json](src/locales/ar.json)

Add missing keys under `admin.payments`:

```json
{
  "admin.payments.listTitle": "Payment Management",
  "admin.payments.allStatuses": "All Statuses",
  "admin.payments.allMethods": "All Methods",
  "admin.payments.amount": "Amount",
  "admin.payments.method": "Method",
  "admin.payments.status": "Status",
  "admin.payments.payer": "Payer",
  "admin.payments.payee": "Payee",
  "admin.payments.mission": "Mission",
  "admin.payments.actions": "Actions",
  "admin.payments.view": "View",
  "admin.payments.createPayment": "Create Payment",
  "admin.payments.editPayment": "Edit Payment",
  "admin.payments.deletePayment": "Delete Payment",
  "admin.payments.createTitle": "Create New Payment",
  "admin.payments.editTitle": "Edit Payment",
  "admin.payments.deleteTitle": "Delete Payment",
  "admin.payments.deleteConfirm": "Are you sure you want to delete this payment? This action cannot be undone.",
  "admin.payments.created": "Payment created successfully.",
  "admin.payments.createError": "Failed to create payment.",
  "admin.payments.updated": "Payment updated successfully.",
  "admin.payments.updateError": "Failed to update payment.",
  "admin.payments.deleted": "Payment deleted successfully.",
  "admin.payments.deleteError": "Failed to delete payment.",
  "admin.payments.detail": "Payment Detail",
  "admin.payments.back": "← Back to Payments",
  "admin.payments.manageStatus": "Manage Status",
  "admin.payments.currentStatus": "Current Status",
  "admin.payments.changeStatus": "Change Status",
  "admin.payments.statusUpdated": "Payment status updated successfully.",
  "admin.payments.statusUpdateError": "Failed to update payment status.",
  "admin.payments.save": "Save",
  "admin.payments.cancel": "Cancel",
  "admin.payments.creating": "Creating...",
  "admin.payments.updating": "Updating...",
  "admin.payments.selectMission": "Select a mission",
  "admin.payments.selectPayer": "Select payer",
  "admin.payments.selectPayee": "Select payee",
  "admin.payments.missionRequired": "Mission is required.",
  "admin.payments.payerRequired": "Payer is required.",
  "admin.payments.payeeRequired": "Payee is required.",
  "admin.payments.amountRequired": "Amount is required.",
  "admin.payments.methodRequired": "Method is required.",
  "admin.payments.platformFee": "Platform Fee",
  "admin.payments.gatewayFee": "Gateway Fee",
  "admin.payments.netAmount": "Net Amount",
  "admin.payments.confirmedAt": "Confirmed At",
  "admin.payments.createdAt": "Created At",
  "admin.payments.currency": "Currency",
  "admin.payments.details": "Payment Details"
}
```

### Step 8: Frontend View - Enhance AdminPaymentsView

**File:** [`src/views/admin/AdminPaymentsView.vue`](src/views/admin/AdminPaymentsView.vue)

Enhance the list view to include:

- Actions column with View, Edit, Delete buttons (following AdminMissionsView pattern)
- Create Payment button in header
- Create/Edit Payment modal with form fields:
  - Mission (dropdown, loaded from admin missions)
  - Payer (dropdown, loaded from admin users with role client)
  - Payee (dropdown, loaded from admin users with role agent)
  - Amount, Currency, Method
- ConfirmDialog for delete confirmation
- Toast notifications for success/error

### Step 9: Frontend View - Create AdminPaymentDetailView

**New File:** [`src/views/admin/AdminPaymentDetailView.vue`](src/views/admin/AdminPaymentDetailView.vue)

Detail view following the AdminMissionDetailView pattern:

- Back link to payments list
- BCard with payment info (amount, currency, method, fees, net amount, status)
- BCard with participants (payer, payee)
- BCard with mission info
- Status management section (change status dropdown)
- Edit/Delete buttons in header

### Step 10: Frontend Router

**File:** [`src/router/index.ts`](src/router/index.ts)

Add route for payment detail:

```typescript
{
  path: 'payments/:id',
  name: 'admin-payment-detail',
  component: () => import('@/views/admin/AdminPaymentDetailView.vue'),
  meta: { requiresAuth: true, roles: ['admin'], title: 'Payment Detail' },
},
```

---

## Execution Order

Steps 1-2 (Backend) and Steps 3-6 (Frontend service/store) can be parallelized since they are independent. Steps 7-10 (View/i18n/router) depend on Steps 3-6 being complete.

```
Step 1: Backend routes ──┐
Step 2: Backend tests  ──┤
                         ├── Step 3-4: Frontend service + tests
                         ├── Step 5-6: Frontend store + tests
                         │
                         └── Step 7: i18n translations
                              Step 8: AdminPaymentsView.vue enhancements
                              Step 9: AdminPaymentDetailView.vue (new)
                              Step 10: Router update
                              Step 11: Run full test suite
```

---

## Files Modified/Created

| File | Action |
|------|--------|
| `src/server/routes/admin.ts` | Modified - Add 4 routes |
| `tests/server/routes/admin.spec.ts` | Modified - Add payment CRUD tests |
| `src/services/admin.ts` | Modified - Add 4 functions |
| `tests/services/admin.spec.ts` | Modified - Add 4 test blocks |
| `src/stores/admin.ts` | Modified - Add 4 actions + export |
| `tests/stores/admin.spec.ts` | Modified - Add 4 test blocks |
| `src/locales/en.json` | Modified - Add payment CRUD keys |
| `src/locales/fr.json` | Modified - Add payment CRUD keys |
| `src/locales/ar.json` | Modified - Add payment CRUD keys |
| `src/views/admin/AdminPaymentsView.vue` | Modified - CRUD UI |
| `src/views/admin/AdminPaymentDetailView.vue` | **Created** - Detail page |
| `src/router/index.ts` | Modified - Add detail route |

---

## TDD Approach

Each step follows Write Test → Fail → Implement → Pass:

1. **Backend**: Write route tests first → run → implement routes → run again
2. **Frontend service**: Write service tests → run → implement functions → run again
3. **Frontend store**: Write store tests → run → implement actions → run again
4. **Views**: Component tests are optional given the complexity, but we ensure all existing tests pass after changes
