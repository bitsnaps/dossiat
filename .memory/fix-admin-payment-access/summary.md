# Fix Admin Payment Access (403 Forbidden)

## Problem

Admin users received `403 Forbidden` when trying to access payment endpoints (`POST /api/missions/:id/payments` and `GET /api/missions/:id/payments`). Additionally, `GET /api/agents/me/payments` returned empty data `{"success":true,"data":[]}` for admins.

## Root Cause

The authorization checks in [`src/server/routes/payments.ts`](src/server/routes/payments.ts) did not account for the `admin` role. The checks only compared `auth.userId` against `mission.agentId` and `mission.clientId`:

```typescript
if (mission.agentId !== auth.userId && mission.clientId !== auth.userId) {
  throw new AppError('Access denied', 403)
}
```

Since admin users are never the `agentId` or `clientId` of a mission, this check always rejected admins. The mission detail route (`GET /api/missions/:id`) correctly had `auth.role !== 'admin'` bypass, but the payment routes did not.

For the `GET /api/agents/me/payments` endpoint, the query filtered by `payerId` or `payeeId` matching the user's ID, but admins are never payer/payee, so it returned empty.

## Solution

### 1. Payment mission routes — added admin bypass

In [`src/server/routes/payments.ts`](src/server/routes/payments.ts):

- **Line 20** — `GET /missions/:id/payments` (list payments for a mission): added `&& auth.role !== 'admin'`
- **Line 43** — `POST /missions/:id/payments` (record a payment for a mission): added `&& auth.role !== 'admin'`

### 2. Admin sees all payments

In [`GET /agents/me/payments`](src/server/routes/payments.ts:177): admin users skip the `payerId`/`payeeId` filter and see all payments.

```typescript
const where: any = auth.role === 'admin'
  ? {}
  : { [Op.or]: [{ payerId: auth.userId }, { payeeId: auth.userId }] }
```

## Tests Added

Added `Admin Payment Access` describe block in [`tests/server/routes/payments.spec.ts`](tests/server/routes/payments.spec.ts:342) with 5 tests:

1. Admin can list payments for a mission (`GET /missions/:id/payments`)
2. Admin can record a payment for a mission (`POST /missions/:id/payments`)
3. Admin can view all payments via `/agents/me/payments`
4. Unauthorized user is rejected from listing payments (403)
5. Unauthorized user is rejected from recording payments (403)

All 16 payment tests pass.

## Key Takeaway

When adding authorization checks that compare user IDs against entity ownership, always include the `admin` role bypass (`auth.role !== 'admin'`). This pattern is used in the mission routes but was missed in the payment routes.
