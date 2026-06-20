import type { PaymentProvider, CheckoutSessionParams, WebhookPayload, WebhookResult } from './types'

const cashProvider: PaymentProvider = {
  async createCheckoutSession(_params: CheckoutSessionParams): Promise<null> {
    return null
  },

  async handleWebhook(_payload: WebhookPayload): Promise<null> {
    return null
  },

  async getAccountLink(_accountId: string): Promise<null> {
    return null
  },
}

export default cashProvider
