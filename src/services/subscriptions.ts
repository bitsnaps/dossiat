import { get, post, put, del } from './api'

export function getPlans() {
  return get('/subscriptions/plans')
}

export function subscribe(planId: string) {
  return post('/subscriptions', { planId })
}

export function getMySubscription() {
  return get('/subscriptions/me')
}

export function getSubscriptionInvoices() {
  return get('/subscriptions/me/invoices')
}

export function updateSubscription(planId: string) {
  return put('/subscriptions/me', { planId })
}

export function cancelSubscription() {
  return del('/subscriptions/me')
}

export function openBillingPortal() {
  return post('/subscriptions/me/portal')
}
