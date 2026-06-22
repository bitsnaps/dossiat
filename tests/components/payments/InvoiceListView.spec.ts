import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import InvoiceListView from '@/views/payments/InvoiceListView.vue'
import { usePaymentsStore } from '@/stores/payments'

const fetchInvoices = vi.fn()

vi.mock('@/stores/payments', () => ({
  usePaymentsStore: vi.fn(() => ({
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
    { path: '/app/invoices', name: 'invoices', component: { template: '<div />' } },
  ],
})

function mountView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(InvoiceListView, {
    global: { plugins: [pinia, router] },
  })
}

describe('InvoiceListView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders the container', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-invoice-list').exists()).toBe(true)
  })

  it('renders the page title', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-invoice-list__title').exists()).toBe(true)
  })

  it('calls fetchInvoices on mount', () => {
    mountView()
    expect(fetchInvoices).toHaveBeenCalled()
  })

  it('shows empty state when no invoices', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-invoice-list__empty').exists()).toBe(true)
  })

  it('renders the table header', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-invoice-list__header').exists()).toBe(true)
  })

  it('shows loading state', () => {
    vi.mocked(usePaymentsStore).mockReturnValueOnce({
      invoices: [],
      loading: true,
      error: null,
      fetchInvoices,
    } as any)
    const wrapper = mountView()
    expect(wrapper.find('.ds-invoice-list__loading').exists()).toBe(true)
  })
})
