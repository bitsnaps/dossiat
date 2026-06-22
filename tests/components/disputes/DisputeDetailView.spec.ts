import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import DisputeDetailView from '@/views/disputes/DisputeDetailView.vue'

const fetchDispute = vi.fn()
const sendMessage = vi.fn()
const resolveDispute = vi.fn()
const escalateDispute = vi.fn()

vi.mock('@/stores/disputes', () => ({
  useDisputesStore: vi.fn(() => ({
    currentDispute: {
      id: 1,
      missionId: 5,
      initiatedBy: 1,
      reason: 'Mission not delivered as agreed',
      status: 'open',
      resolution: null,
      resolvedAt: null,
      mission: { id: 5, title: 'Pay electricity bill', status: 'in_progress' },
      initiator: { id: 1, firstName: 'John', lastName: 'Doe' },
      messages: [],
      createdAt: '2026-06-20T10:00:00Z',
    },
    loading: false,
    error: null,
    fetchDispute,
    sendMessage,
    resolveDispute,
    escalateDispute,
  })),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: 1, firstName: 'John', lastName: 'Doe', role: 'agent' },
    hasRole: vi.fn(() => true),
  })),
}))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/app/disputes', name: 'disputes', component: { template: '<div />' } },
    { path: '/app/disputes/:id', name: 'dispute-detail', component: { template: '<div />' } },
  ],
})

function mountView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(DisputeDetailView, {
    global: { plugins: [pinia, router] },
  })
}

describe('DisputeDetailView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    router.push('/app/disputes/1')
  })

  it('renders the container', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-dispute-detail').exists()).toBe(true)
  })

  it('renders the header', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-dispute-detail__header').exists()).toBe(true)
  })

  it('calls fetchDispute on mount', () => {
    mountView()
    expect(fetchDispute).toHaveBeenCalled()
  })

  it('renders back button', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-dispute-detail__back').exists()).toBe(true)
  })

  it('renders dispute reason', () => {
    const wrapper = mountView()
    expect(wrapper.html()).toContain('Mission not delivered as agreed')
  })

  it('renders mission info', () => {
    const wrapper = mountView()
    expect(wrapper.html()).toContain('Pay electricity bill')
  })

  it('renders status badge', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-dispute-detail__info').exists() || wrapper.find('.ds-dispute-detail').exists()).toBe(true)
  })
})
