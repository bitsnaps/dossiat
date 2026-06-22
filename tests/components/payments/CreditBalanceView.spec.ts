import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import CreditBalanceView from '@/views/payments/CreditBalanceView.vue'

const purchaseCredits = vi.fn().mockResolvedValue({ balance: 200, currency: 'USD' })
const fetchCreditBalance = vi.fn()
const fetchCreditTransactions = vi.fn()

vi.mock('@/stores/payments', () => ({
  usePaymentsStore: vi.fn(() => ({
    creditBalance: { balance: 150.00, currency: 'USD' },
    creditTransactions: [],
    loading: false,
    error: null,
    fetchCreditBalance,
    fetchCreditTransactions,
    purchaseCredits,
  })),
}))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/app/credits', name: 'credits', component: { template: '<div />' } },
  ],
})

function mountView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(CreditBalanceView, {
    global: { plugins: [pinia, router] },
  })
}

describe('CreditBalanceView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders the container', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-credit-balance').exists()).toBe(true)
  })

  it('renders the page title', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-credit-balance__title').exists()).toBe(true)
  })

  it('renders balance display', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-credit-balance__balance').exists()).toBe(true)
  })

  it('displays the balance amount', () => {
    const wrapper = mountView()
    expect(wrapper.html()).toContain('150')
  })

  it('renders purchase form', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-credit-balance__purchase').exists()).toBe(true)
  })

  it('renders purchase amount input', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-credit-balance__amount').exists()).toBe(true)
  })

  it('renders purchase button', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-credit-balance__purchase-btn').exists()).toBe(true)
  })

  it('calls fetchCreditBalance and fetchCreditTransactions on mount', () => {
    mountView()
    expect(fetchCreditBalance).toHaveBeenCalled()
    expect(fetchCreditTransactions).toHaveBeenCalled()
  })

  it('renders transactions section', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-credit-balance__transactions').exists()).toBe(true)
  })

  it('shows empty state when no transactions', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-credit-balance__empty').exists()).toBe(true)
  })
})
