import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import PaymentConfirmationView from '@/views/payments/PaymentConfirmationView.vue'

const confirmPayer = vi.fn().mockResolvedValue({ id: 1 })
const confirmPayee = vi.fn().mockResolvedValue({ id: 1 })
const fetchPayments = vi.fn()

vi.mock('@/stores/payments', () => ({
  usePaymentsStore: vi.fn(() => ({
    payments: [{
      id: 1, missionId: 10, payerId: 1, payeeId: 2, amount: 100, currency: 'USD',
      method: 'cash', status: 'pending', confirmedByPayer: false, confirmedByPayee: false,
      platformFee: 1, gatewayFee: 0, netAmount: 99,
      mission: { id: 10, title: 'Electricity Bill' },
      createdAt: '2026-06-01T10:00:00Z',
    }],
    loading: false,
    error: null,
    fetchPayments,
    confirmPayer,
    confirmPayee,
  })),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: 1, role: 'client' },
    hasRole: (role: string) => role === 'client',
  })),
}))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/app/payments', name: 'payments', component: { template: '<div />' } },
    { path: '/app/payments/:id/confirm', name: 'payment-confirm', component: { template: '<div />' } },
  ],
})

function mountView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(PaymentConfirmationView, {
    global: {
      plugins: [pinia, router],
    },
  })
}

describe('PaymentConfirmationView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    router.push('/app/payments/1/confirm')
  })

  it('renders the container', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-payment-confirm').exists()).toBe(true)
  })

  it('renders the page title', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-payment-confirm__title').exists()).toBe(true)
  })

  it('renders payment details section', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-payment-confirm__details').exists()).toBe(true)
  })

  it('displays the payment amount', () => {
    const wrapper = mountView()
    expect(wrapper.html()).toContain('100')
  })

  it('displays the mission title', () => {
    const wrapper = mountView()
    expect(wrapper.html()).toContain('Electricity Bill')
  })

  it('shows confirmation status', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-payment-confirm__status').exists()).toBe(true)
  })

  it('shows payer confirmation section', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-payment-confirm__payer').exists()).toBe(true)
  })

  it('shows payee confirmation section', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-payment-confirm__payee').exists()).toBe(true)
  })
})
