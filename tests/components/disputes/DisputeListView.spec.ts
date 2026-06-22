import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import DisputeListView from '@/views/disputes/DisputeListView.vue'

const fetchDisputes = vi.fn()

vi.mock('@/stores/disputes', () => ({
  useDisputesStore: vi.fn(() => ({
    disputes: [],
    loading: false,
    error: null,
    fetchDisputes,
  })),
}))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/app/disputes', name: 'disputes', component: { template: '<div />' } },
    { path: '/app/disputes/initiate', name: 'dispute-initiate', component: { template: '<div />' } },
    { path: '/app/disputes/:id', name: 'dispute-detail', component: { template: '<div />' } },
  ],
})

function mountView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(DisputeListView, {
    global: { plugins: [pinia, router] },
  })
}

describe('DisputeListView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders the container', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-dispute-list').exists()).toBe(true)
  })

  it('renders the page title', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-dispute-list__title').exists()).toBe(true)
  })

  it('calls fetchDisputes on mount', () => {
    mountView()
    expect(fetchDisputes).toHaveBeenCalled()
  })

  it('shows empty state when no disputes', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-empty-state').exists()).toBe(true)
  })

  it('renders initiate dispute button', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-dispute-list__initiate-btn').exists()).toBe(true)
  })
})
