import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import SettingsView from '@/views/settings/SettingsView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
  ],
})

vi.mock('@/services/users', () => ({
  updateMe: vi.fn(),
  changePassword: vi.fn(),
}))

vi.mock('@/composables/useToast', () => ({
  useToast: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
  })),
}))

describe('SettingsView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  function createWrapper() {
    const pinia = createPinia()
    setActivePinia(pinia)
    const authStore = useAuthStore()
    authStore.user = {
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'agent',
      emailVerified: true,
    }
    authStore.accessToken = 'mock-token'

    return mount(SettingsView, {
      global: {
        plugins: [pinia, router],
      },
    })
  }

  it('renders the settings container', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.ds-settings').exists()).toBe(true)
  })

  it('displays the page title', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Account Settings')
  })

  it('renders personal info section', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Personal Information')
  })

  it('renders change password section', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Change Password')
  })

  it('initializes form fields with user data', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const inputs = wrapper.findAll('input')
    const firstNameInput = inputs.find(i => i.element.value === 'John')
    const lastNameInput = inputs.find(i => i.element.value === 'Doe')
    expect(firstNameInput).toBeTruthy()
    expect(lastNameInput).toBeTruthy()
  })

  it('displays user email as readonly', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const disabledInputs = wrapper.findAll('input:disabled')
    expect(disabledInputs.some(i => (i.element as HTMLInputElement).value === 'test@example.com')).toBe(true)
  })

  it('has save buttons', () => {
    const wrapper = createWrapper()
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })
})
