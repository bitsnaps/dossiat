import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import StripeConnectView from '@/views/payments/StripeConnectView.vue'

const fetchStripeStatus = vi.fn()
const connectStripe = vi.fn().mockResolvedValue({ url: 'https://connect.stripe.com/test' })

vi.mock('@/stores/payments', () => ({
  usePaymentsStore: vi.fn(() => ({
    stripeStatus: { configured: true, connected: false, detailsSubmitted: false },
    loading: false,
    error: null,
    fetchStripeStatus,
    connectStripe,
  })),
}))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/app/stripe/connect', name: 'stripe-connect', component: { template: '<div />' } },
  ],
})

function mountView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(StripeConnectView, {
    global: { plugins: [pinia, router] },
  })
}

describe('StripeConnectView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders the container', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-stripe-connect').exists()).toBe(true)
  })

  it('renders the page title', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-stripe-connect__title').exists()).toBe(true)
  })

  it('calls fetchStripeStatus on mount', () => {
    mountView()
    expect(fetchStripeStatus).toHaveBeenCalled()
  })

  it('renders connection status section', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-stripe-connect__status').exists()).toBe(true)
  })

  it('renders connect button when not connected', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-stripe-connect__connect-btn').exists()).toBe(true)
  })

  it('shows not connected status', () => {
    const wrapper = mountView()
    expect(wrapper.html()).toContain('Not Connected')
  })

  it('shows connect button when configured but not connected', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-stripe-connect__connect-btn').exists()).toBe(true)
  })
})
