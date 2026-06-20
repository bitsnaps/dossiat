import type { PaymentProvider, CheckoutSessionParams, WebhookPayload, WebhookResult } from './types'

const paypalProvider: PaymentProvider = {
  async createCheckoutSession(_params: CheckoutSessionParams): Promise<never> {
    throw new Error('PayPal integration not yet implemented')
  },

  async handleWebhook(_payload: WebhookPayload): Promise<never> {
    throw new Error('PayPal integration not yet implemented')
  },

  async getAccountLink(_accountId: string): Promise<never> {
    throw new Error('PayPal integration not yet implemented')
  },
}

export default paypalProvider
