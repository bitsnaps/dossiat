import type { PaymentMethod } from './feeCalculator'

interface CheckoutSessionParams {
  missionId: number
  amount: number
  currency: string
  payerId: number
  payeeId: number
  successUrl: string
  cancelUrl: string
}

interface CheckoutSession {
  id: string
  url: string
  status: string
}

interface WebhookPayload {
  body: string
  signature: string
}

interface WebhookResult {
  event: string
  paymentId: number | null
  status: 'confirmed' | 'failed' | 'refunded'
  metadata: Record<string, unknown>
}

interface PaymentProvider {
  createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSession | null>
  handleWebhook(payload: WebhookPayload): Promise<WebhookResult | null>
  getAccountLink(accountId: string): Promise<string | null>
}

export type { CheckoutSessionParams, CheckoutSession, WebhookPayload, WebhookResult, PaymentProvider, PaymentMethod }
