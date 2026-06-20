import type { PaymentProvider, CheckoutSessionParams, WebhookPayload, WebhookResult } from './types'

const stripeProvider: PaymentProvider = {
  async createCheckoutSession(_params: CheckoutSessionParams): Promise<never> {
    throw new Error('Stripe integration not yet implemented')
  },

  async handleWebhook(_payload: WebhookPayload): Promise<never> {
    throw new Error('Stripe integration not yet implemented')
  },

  async getAccountLink(_accountId: string): Promise<never> {
    throw new Error('Stripe integration not yet implemented')
  },
}

export default stripeProvider
