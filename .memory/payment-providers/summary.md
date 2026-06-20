# Task: 3h — Stripe/PayPal Integration Groundwork + Full Cash Payment Support

## What was done

### Payment Provider Abstraction Layer (`src/server/services/payment/`)
- Created `types.ts` — TypeScript interfaces: `PaymentProvider`, `CheckoutSessionParams`, `CheckoutSession`, `WebhookPayload`, `WebhookResult`
- Created `feeCalculator.ts` — Extracted and improved fee calculation logic:
  - `calculateGatewayFee(amount, method)` — 0 for cash/bank_transfer, 2.9% + $0.30 for stripe/paypal
  - `calculatePlatformFee(netAmount)` — 1% of net amount after gateway fees, minimum $1
  - `calculateAllFees(amount, method)` — Returns `{ gatewayFee, platformFee, netAmount }`
- Created `cashProvider.ts` — No-op provider for cash/bank_transfer payments
- Created `stripeProvider.ts` — Stubbed, throws "Stripe integration not yet implemented"
- Created `paypalProvider.ts` — Stubbed, throws "PayPal integration not yet implemented"
- Created `index.ts` — Provider factory: `getPaymentProvider(method)`, `isGatewayMethod(method)`

### Full Cash Payment Logic
- Refactored [`src/server/routes/payments.ts`](src/server/routes/payments.ts) to:
  - Use `calculateAllFees()` from the fee calculator (replaces inline `calculatePlatformFee`)
  - Fix `bank_transfer` gateway fee (was incorrectly treated like stripe/paypal; now returns 0)
  - Add automatic platform fee deduction from agent `PlatformCredit` balance when a cash/bank_transfer payment is confirmed by both parties
  - Graceful handling of insufficient credits (payment still confirms, outstanding fee tracked)

### Stubbed Stripe Routes (`src/server/routes/stripe.ts`)
- `POST /api/payments/stripe/connect` — Agent OAuth connect (stubbed)
- `POST /api/payments/stripe/create-checkout-session` — Checkout session (stubbed)
- `POST /api/payments/stripe/webhook` — Webhook handler (stubbed)
- `GET /api/payments/stripe/status` — Connection status check
- Returns 501 when `STRIPE_SECRET_KEY` is not configured

### Stubbed PayPal Routes (`src/server/routes/paypal.ts`)
- `POST /api/payments/paypal/setup` — Account setup (stubbed)
- `POST /api/payments/paypal/create-order` — Order creation (stubbed)
- `POST /api/payments/paypal/webhook` — Webhook handler (stubbed)
- `GET /api/payments/paypal/status` — Connection status check
- Returns 501 when `PAYPAL_CLIENT_ID` is not configured

### Server Registration
- Updated [`src/server/index.ts`](src/server/index.ts) to mount stripe and paypal routes

## Tests (TDD approach)
- **49 new tests** across 5 test files, all passing
- `tests/server/services/payment/feeCalculator.spec.ts` — 18 tests for fee calculation
- `tests/server/services/payment/providers.spec.ts` — 17 tests for provider abstraction
- `tests/server/routes/payments.spec.ts` — 11 tests (expanded from 8) including credit deduction and bank_transfer
- `tests/server/routes/stripe.spec.ts` — 7 tests for Stripe stubs + auth
- `tests/server/routes/paypal.spec.ts` — 7 tests for PayPal stubs + auth

## Full test suite
- 27 test files, 276 tests passed, 0 failures, 1 skipped (pre-existing)

## Key decisions
- No new npm dependencies added
- Provider pattern allows easy swap when real Stripe/PayPal SDK integration happens
- Insufficient credits don't block payment confirmation — outstanding fee tracked for billing cycle
- Fee calculation extracted to utility for reuse across routes and tests
