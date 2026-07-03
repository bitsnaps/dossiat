import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AdminDisputesView from '@/views/admin/AdminDisputesView.vue'

const fetchDisputes = vi.fn()

vi.mock('@/stores/admin', () => ({
  useAdminStore: vi.fn(() => ({
    disputes: [],
    loading: {},
    error: null,
    pagination: {},
    fetchDisputes,
  })),
}))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/app/admin/disputes', name: 'admin-disputes', component: { template: '<div />' } },
    { path: '/app/admin/disputes/:id', name: 'admin-dispute-detail', component: { template: '<div />' } },
  ],
})

function mountView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(AdminDisputesView, {
    global: { plugins: [pinia, router] },
  })
}

describe('AdminDisputesView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the container', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-admin-page').exists()).toBe(true)
  })

  it('renders the page title', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-admin-page__title').exists()).toBe(true)
  })

  it('shows loading state', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-admin-page').exists()).toBe(true)
  })

  it('calls fetchDisputes on mount', () => {
    mountView()
    expect(fetchDisputes).toHaveBeenCalled()
  })

  it('renders the BTable component', () => {
    const wrapper = mountView()
    expect(wrapper.findComponent({ name: 'BTable' }).exists()).toBe(true)
  })

  it('renders the BSelect filter', () => {
    const wrapper = mountView()
    expect(wrapper.findComponent({ name: 'BSelect' }).exists()).toBe(true)
  })

  it('renders the Pagination component', () => {
    const wrapper = mountView()
    expect(wrapper.findComponent({ name: 'Pagination' }).exists()).toBe(true)
  })
})
