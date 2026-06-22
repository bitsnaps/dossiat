import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import DisputeInitiateView from '@/views/disputes/DisputeInitiateView.vue'

const createDispute = vi.fn().mockResolvedValue({ success: true, data: { id: 1 } })
const fetchMissions = vi.fn()

vi.mock('@/stores/disputes', () => ({
  useDisputesStore: vi.fn(() => ({
    loading: false,
    error: null,
    createDispute,
  })),
}))

vi.mock('@/stores/missions', () => ({
  useMissionsStore: vi.fn(() => ({
    missions: [
      { id: 1, title: 'Pay electricity bill', status: 'in_progress' },
      { id: 2, title: 'Register company', status: 'completed' },
    ],
    loading: false,
    fetchMissions,
  })),
}))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/app/disputes', name: 'disputes', component: { template: '<div />' } },
    { path: '/app/disputes/initiate', name: 'dispute-initiate', component: { template: '<div />' } },
  ],
})

function mountView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(DisputeInitiateView, {
    global: { plugins: [pinia, router] },
  })
}

describe('DisputeInitiateView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    router.push('/app/disputes/initiate')
  })

  it('renders the container', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-dispute-initiate').exists()).toBe(true)
  })

  it('renders the page title', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-dispute-initiate__title').exists()).toBe(true)
  })

  it('renders back button', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-dispute-initiate__back').exists()).toBe(true)
  })

  it('renders the mission select', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-dispute-initiate__mission').exists() || wrapper.find('select').exists()).toBe(true)
  })

  it('renders the reason textarea', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-dispute-initiate__reason').exists() || wrapper.find('textarea').exists()).toBe(true)
  })

  it('renders submit button', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-dispute-initiate__submit').exists() || wrapper.find('button[type="submit"]').exists()).toBe(true)
  })
})
