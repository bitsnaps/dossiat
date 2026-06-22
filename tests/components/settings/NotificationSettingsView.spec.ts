import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import NotificationSettingsView from '@/views/settings/NotificationSettingsView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
  ],
})

vi.mock('@/composables/useToast', () => ({
  useToast: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
  })),
}))

describe('NotificationSettingsView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  function createWrapper() {
    const pinia = createPinia()
    setActivePinia(pinia)
    return mount(NotificationSettingsView, {
      global: {
        plugins: [pinia, router],
      },
    })
  }

  it('renders the notification settings container', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.ds-notification-settings').exists()).toBe(true)
  })

  it('displays the page title', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Notification Settings')
  })

  it('displays the page subtitle', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Manage your email notification preferences')
  })

  it('renders checkbox for mission updates', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Mission Updates')
  })

  it('renders checkbox for payment notifications', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Payment Notifications')
  })

  it('renders checkbox for new messages', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('New Messages')
  })

  it('renders checkbox for dispute updates', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Dispute Updates')
  })

  it('renders checkbox for marketing emails', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Marketing Emails')
  })

  it('has a save button', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Save Preferences')
  })
})
