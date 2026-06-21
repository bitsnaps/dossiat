import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ClientDashboard from '@/views/client/ClientDashboard.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/app/dashboard', name: 'dashboard', component: { template: '<div />' } },
    { path: '/app/missions', name: 'missions', component: { template: '<div />' } },
    { path: '/app/payments', name: 'payments', component: { template: '<div />' } },
  ],
})

vi.mock('@/stores/missions', () => ({
  useMissionsStore: vi.fn(() => ({
    missions: [],
    activeMissions: [],
    fetchMissions: vi.fn(),
  })),
}))

vi.mock('@/stores/payments', () => ({
  usePaymentsStore: vi.fn(() => ({
    payments: [],
    creditBalance: null,
    fetchCreditBalance: vi.fn(),
  })),
}))

vi.mock('@/stores/messages', () => ({
  useMessagesStore: vi.fn(() => ({
    unreadCount: 1,
    fetchUnreadCount: vi.fn(),
  })),
}))

function mountClientDashboard() {
  const pinia = createPinia()
  setActivePinia(pinia)

  return mount(ClientDashboard, {
    global: {
      plugins: [pinia, router],
    },
  })
}

describe('ClientDashboard', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the dashboard container', () => {
    const wrapper = mountClientDashboard()
    expect(wrapper.find('.ds-client-dashboard').exists()).toBe(true)
  })

  it('renders stat cards', () => {
    const wrapper = mountClientDashboard()
    const cards = wrapper.findAll('.ds-client-dashboard__stat-card')
    expect(cards.length).toBe(4)
  })

  it('displays active missions stat', () => {
    const wrapper = mountClientDashboard()
    expect(wrapper.html()).toContain('Active Missions')
  })

  it('displays total spending stat', () => {
    const wrapper = mountClientDashboard()
    expect(wrapper.html()).toContain('Total Spending')
  })

  it('shows empty state for missions when none exist', () => {
    const wrapper = mountClientDashboard()
    expect(wrapper.find('.ds-empty-state').exists()).toBe(true)
  })

  it('renders recent payments section', () => {
    const wrapper = mountClientDashboard()
    expect(wrapper.html()).toContain('Recent Payments')
  })
})
