import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import PaymentSummaryView from '@/views/payments/PaymentSummaryView.vue'

const fetchAllPayments = vi.fn()

vi.mock('@/stores/payments', () => ({
  usePaymentsStore: vi.fn(() => ({
    payments: [],
    loading: false,
    error: null,
    fetchAllPayments,
  })),
}))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/app/payments', name: 'payments', component: { template: '<div />' } },
    { path: '/app/payments/record', name: 'payment-record', component: { template: '<div />' } },
    { path: '/app/payments/:id/confirm', name: 'payment-confirm', component: { template: '<div />' } },
  ],
})

function mountView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(PaymentSummaryView, {
    global: { plugins: [pinia, router] },
  })
}

describe('PaymentSummaryView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders the container', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-payment-summary').exists()).toBe(true)
  })

  it('renders the page title', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-payment-summary__title').exists()).toBe(true)
  })

  it('renders stat cards', () => {
    const wrapper = mountView()
    const stats = wrapper.findAll('.ds-payment-summary__stat')
    expect(stats.length).toBe(3)
  })

  it('renders filter buttons', () => {
    const wrapper = mountView()
    const filters = wrapper.findAll('.ds-payment-summary__filter')
    expect(filters.length).toBeGreaterThanOrEqual(3)
  })

  it('calls fetchAllPayments on mount', () => {
    mountView()
    expect(fetchAllPayments).toHaveBeenCalled()
  })

  it('shows empty state when no payments', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-payment-summary__empty').exists()).toBe(true)
  })

  it('renders record payment button', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-payment-summary__record-btn').exists()).toBe(true)
  })
})
