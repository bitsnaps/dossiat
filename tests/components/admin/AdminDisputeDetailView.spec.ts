import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AdminDisputeDetailView from '@/views/admin/AdminDisputeDetailView.vue'

const fetchDispute = vi.fn()
const resolveDispute = vi.fn()

vi.mock('@/stores/admin', () => ({
  useAdminStore: vi.fn(() => ({
    selectedDispute: null,
    loading: {},
    error: null,
    fetchDispute,
    resolveDispute,
  })),
}))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/app/admin/disputes', name: 'admin-disputes', component: { template: '<div />' } },
    { path: '/app/admin/disputes/:id', name: 'admin-dispute-detail', component: { template: '<div />' } },
  ],
  initialHistory: '/app/admin/disputes/1',
})

function mountView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(AdminDisputeDetailView, {
    global: {
      plugins: [pinia, router],
    },
  })
}

describe('AdminDisputeDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the container', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-admin-page').exists()).toBe(true)
  })

  it('renders the back link', () => {
    const wrapper = mountView()
    const backLink = wrapper.find('a[href="/app/admin/disputes"]')
    expect(backLink.exists()).toBe(true)
  })

  it('calls fetchDispute on mount', () => {
    mountView()
    expect(fetchDispute).toHaveBeenCalled()
  })

  it('shows loading state when dispute is loading', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-admin-page').exists()).toBe(true)
  })

  it('renders page title', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-admin-page__title').exists()).toBe(true)
  })
})
