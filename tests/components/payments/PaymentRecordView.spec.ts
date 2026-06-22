import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import PaymentRecordView from '@/views/payments/PaymentRecordView.vue'

const recordPayment = vi.fn().mockResolvedValue({ id: 1 })

vi.mock('@/stores/payments', () => ({
  usePaymentsStore: vi.fn(() => ({
    loading: false,
    error: null,
    recordPayment,
  })),
}))

vi.mock('@/stores/missions', () => ({
  useMissionsStore: vi.fn(() => ({
    missions: [{ id: 10, title: 'Electricity Bill' }],
    fetchMissions: vi.fn(),
  })),
}))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/app/payments', name: 'payments', component: { template: '<div />' } },
    { path: '/app/payments/record', name: 'payment-record', component: { template: '<div />' } },
  ],
})

function mountView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(PaymentRecordView, {
    global: { plugins: [pinia, router] },
  })
}

describe('PaymentRecordView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders the container', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-payment-record').exists()).toBe(true)
  })

  it('renders the page title', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-payment-record__title').exists()).toBe(true)
  })

  it('renders the amount input', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-payment-record__amount').exists()).toBe(true)
  })

  it('renders currency select', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-payment-record__currency').exists()).toBe(true)
  })

  it('renders method radio options', () => {
    const wrapper = mountView()
    const methods = wrapper.findAll('.ds-payment-record__method')
    expect(methods.length).toBeGreaterThanOrEqual(2)
  })

  it('renders submit button', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-payment-record__submit').exists()).toBe(true)
  })

  it('renders cancel button', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-payment-record__cancel').exists()).toBe(true)
  })

  it('shows validation error when submitting empty form', async () => {
    const wrapper = mountView()
    const form = wrapper.find('form')
    await form.trigger('submit')
    expect(wrapper.find('.ds-payment-record__error').exists()).toBe(true)
  })
})
