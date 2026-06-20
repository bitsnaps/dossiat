import type { PaymentProvider, PaymentMethod } from './types'
import cashProvider from './cashProvider'
import stripeProvider from './stripeProvider'
import paypalProvider from './paypalProvider'

const providers: Record<PaymentMethod, PaymentProvider> = {
  cash: cashProvider,
  bank_transfer: cashProvider,
  stripe: stripeProvider,
  paypal: paypalProvider,
}

function getPaymentProvider(method: PaymentMethod): PaymentProvider {
  return providers[method]
}

function isGatewayMethod(method: PaymentMethod): boolean {
  return method === 'stripe' || method === 'paypal'
}

export { getPaymentProvider, isGatewayMethod }
export type { PaymentProvider, PaymentMethod, CheckoutSessionParams, CheckoutSession, WebhookPayload, WebhookResult } from './types'
export { calculateGatewayFee, calculatePlatformFee, calculateAllFees } from './feeCalculator'
export type { FeeBreakdown } from './feeCalculator'
