import { get, post } from './api'

export function getAllPayments() {
  return get('/agents/me/payments')
}

export function getPayments(missionId: string) {
  return get(`/missions/${missionId}/payments`)
}

export function recordPayment(missionId: string, data: {
  amount: number
  currency: string
  method: 'cash' | 'stripe' | 'paypal' | 'bank_transfer'
  payeeId?: string
}) {
  return post(`/missions/${missionId}/payments`, data)
}

export function confirmPayer(paymentId: string) {
  return post(`/payments/${paymentId}/confirm-payer`)
}

export function confirmPayee(paymentId: string) {
  return post(`/payments/${paymentId}/confirm-payee`)
}

export function getCreditBalance() {
  return get('/agents/me/credits')
}

export function purchaseCredits(amount: number) {
  return post('/agents/me/credits/purchase', { amount })
}

export function getCreditTransactions() {
  return get('/agents/me/credit-transactions')
}

export function getInvoices() {
  return get('/agents/me/invoices')
}

export function getStripeStatus() {
  return get('/payments/stripe/status')
}

export function connectStripe() {
  return post('/payments/stripe/connect')
}
