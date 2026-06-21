import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/app/dashboard', name: 'dashboard', component: { template: '<div />' } },
    { path: '/app/missions', name: 'missions', component: { template: '<div />' } },
    { path: '/app/onboarding', name: 'onboarding', component: { template: '<div />' } },
    { path: '/app/settings', name: 'settings', component: { template: '<div />' } },
    { path: '/app/credits', name: 'credits', component: { template: '<div />' } },
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
    unreadCount: 0,
    fetchUnreadCount: vi.fn(),
  })),
}))

vi.mock('@/stores/notifications', () => ({
  useNotificationsStore: vi.fn(() => ({
    notifications: [],
    fetchNotifications: vi.fn(),
  })),
}))

function mountDashboard(userRole: string) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const authStore = useAuthStore()
  authStore.user = { id: 1, email: 'test@test.com', firstName: 'Test', lastName: 'User', role: userRole as any }
  authStore.accessToken = 'fake-token'

  return mount(DashboardView, {
    global: {
      plugins: [pinia, router],
      stubs: {
        AgentDashboard: { template: '<div class="agent-dashboard-stub" />', props: ['loading'] },
        ClientDashboard: { template: '<div class="client-dashboard-stub" />', props: ['loading'] },
      },
    },
  })
}

describe('DashboardView', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the dashboard container', () => {
    const wrapper = mountDashboard('agent')
    expect(wrapper.find('.ds-dashboard').exists()).toBe(true)
  })

  it('displays the welcome title', () => {
    const wrapper = mountDashboard('agent')
    const title = wrapper.find('.ds-dashboard__title')
    expect(title.exists()).toBe(true)
    expect(title.text()).toContain('Test')
  })

  it('renders AgentDashboard for agent role', () => {
    const wrapper = mountDashboard('agent')
    expect(wrapper.find('.agent-dashboard-stub').exists()).toBe(true)
  })

  it('renders ClientDashboard for client role', () => {
    const wrapper = mountDashboard('client')
    expect(wrapper.find('.client-dashboard-stub').exists()).toBe(true)
  })

  it('does not render AgentDashboard for client role', () => {
    const wrapper = mountDashboard('client')
    expect(wrapper.find('.agent-dashboard-stub').exists()).toBe(false)
  })

  it('does not render ClientDashboard for agent role', () => {
    const wrapper = mountDashboard('agent')
    expect(wrapper.find('.client-dashboard-stub').exists()).toBe(false)
  })
})
