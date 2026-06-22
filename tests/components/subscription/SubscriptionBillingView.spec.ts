import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import SubscriptionBillingView from '@/views/subscription/SubscriptionBillingView.vue'
import { useSubscriptionsStore } from '@/stores/subscriptions'

const fetchInvoices = vi.fn()

vi.mock('@/stores/subscriptions', () => ({
  useSubscriptionsStore: vi.fn(() => ({
    invoices: [],
    loading: false,
    error: null,
    fetchInvoices,
  })),
}))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/app/subscriptions/billing', name: 'subscription-billing', component: { template: '<div />' } },
    { path: '/app/subscriptions/manage', name: 'subscription-manage', component: { template: '<div />' } },
  ],
})

function mountView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(SubscriptionBillingView, {
    global: { plugins: [pinia, router] },
  })
}

describe('SubscriptionBillingView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders the container', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-subscription-billing').exists()).toBe(true)
  })

  it('renders the page title', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-subscription-billing__title').exists()).toBe(true)
  })

  it('calls fetchInvoices on mount', () => {
    mountView()
    expect(fetchInvoices).toHaveBeenCalled()
  })

  it('shows empty state when no invoices', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-subscription-billing__empty').exists()).toBe(true)
  })

  it('shows loading state', () => {
    vi.mocked(useSubscriptionsStore).mockReturnValueOnce({
      invoices: [],
      loading: true,
      error: null,
      fetchInvoices,
    } as any)
    const wrapper = mountView()
    expect(wrapper.find('.ds-subscription-billing__loading').exists()).toBe(true)
  })

  it('renders the table header when invoices exist', () => {
    vi.mocked(useSubscriptionsStore).mockReturnValueOnce({
      invoices: [
        { id: 1, subscriptionId: 1, amount: 29, currency: 'USD', status: 'paid', paidAt: '2026-01-15', createdAt: '2026-01-01' },
      ],
      loading: false,
      error: null,
      fetchInvoices,
    } as any)
    const wrapper = mountView()
    expect(wrapper.find('.ds-subscription-billing__table-header').exists()).toBe(true)
  })

  it('renders invoice rows when invoices exist', () => {
    vi.mocked(useSubscriptionsStore).mockReturnValueOnce({
      invoices: [
        { id: 1, subscriptionId: 1, amount: 29, currency: 'USD', status: 'paid', paidAt: '2026-01-15', createdAt: '2026-01-01' },
        { id: 2, subscriptionId: 1, amount: 29, currency: 'USD', status: 'pending', paidAt: null, createdAt: '2026-02-01' },
      ],
      loading: false,
      error: null,
      fetchInvoices,
    } as any)
    const wrapper = mountView()
    expect(wrapper.findAll('.ds-subscription-billing__row').length).toBe(2)
  })

  it('renders the back link', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-subscription-billing__back').exists()).toBe(true)
  })
})
