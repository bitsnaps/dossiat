import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AgentDashboard from '@/views/agent/AgentDashboard.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/app/dashboard', name: 'dashboard', component: { template: '<div />' } },
    { path: '/app/missions', name: 'missions', component: { template: '<div />' } },
    { path: '/app/missions/create', name: 'mission-create', component: { template: '<div />' } },
    { path: '/app/credits', name: 'credits', component: { template: '<div />' } },
    { path: '/app/settings', name: 'settings', component: { template: '<div />' } },
    { path: '/app/onboarding', name: 'onboarding', component: { template: '<div />' } },
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
    creditBalance: { balance: 150.00, currency: 'USD' },
    fetchCreditBalance: vi.fn(),
  })),
}))

vi.mock('@/stores/messages', () => ({
  useMessagesStore: vi.fn(() => ({
    unreadCount: 3,
    fetchUnreadCount: vi.fn(),
  })),
}))

vi.mock('@/stores/agentProfile', () => ({
  useAgentProfileStore: vi.fn(() => ({
    profile: { bio: 'Test bio', specialties: ['Finance'] },
    isComplete: true,
    inviteLink: '/agents/abc123',
  })),
}))

function mountAgentDashboard() {
  const pinia = createPinia()
  setActivePinia(pinia)

  return mount(AgentDashboard, {
    global: {
      plugins: [pinia, router],
    },
  })
}

describe('AgentDashboard', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the dashboard container', () => {
    const wrapper = mountAgentDashboard()
    expect(wrapper.find('.ds-agent-dashboard').exists()).toBe(true)
  })

  it('renders stat cards', () => {
    const wrapper = mountAgentDashboard()
    const cards = wrapper.findAll('.ds-agent-dashboard__stat-card')
    expect(cards.length).toBe(4)
  })

  it('displays active missions stat', () => {
    const wrapper = mountAgentDashboard()
    expect(wrapper.html()).toContain('Active Missions')
  })

  it('displays credit balance stat', () => {
    const wrapper = mountAgentDashboard()
    expect(wrapper.html()).toContain('Credit Balance')
  })

  it('shows empty state when no active missions', () => {
    const wrapper = mountAgentDashboard()
    expect(wrapper.find('.ds-empty-state').exists()).toBe(true)
  })

  it('renders quick actions section', () => {
    const wrapper = mountAgentDashboard()
    expect(wrapper.find('.ds-quick-actions').exists()).toBe(true)
  })
})
