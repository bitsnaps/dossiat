import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ClientSettingsView from '@/views/client/ClientSettingsView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
  ],
})

const mockStoreFactory = vi.fn()

vi.mock('@/stores/clientProfile', () => ({
  useClientProfileStore: (...args: any[]) => mockStoreFactory(...args),
}))

vi.mock('@/composables/useToast', () => ({
  useToast: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
  })),
}))

describe('ClientSettingsView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  function mountWithStore(overrides: Record<string, any> = {}) {
    const pinia = createPinia()
    setActivePinia(pinia)

    mockStoreFactory.mockReturnValue({
      profile: {
        id: 1,
        userId: 1,
        companyName: 'Acme Corp',
        companySize: '11-50',
        industry: 'IT / Tech',
      },
      loading: false,
      error: null,
      fetchProfile: vi.fn(),
      updateProfile: vi.fn(),
      ...overrides,
    })

    return mount(ClientSettingsView, {
      global: {
        plugins: [pinia, router],
      },
    })
  }

  it('renders the settings container', () => {
    const wrapper = mountWithStore()
    expect(wrapper.find('.ds-client-settings').exists()).toBe(true)
  })

  it('displays the page title', () => {
    const wrapper = mountWithStore()
    expect(wrapper.html()).toContain('Client Settings')
  })

  it('displays the page subtitle', () => {
    const wrapper = mountWithStore()
    expect(wrapper.html()).toContain('Manage your company profile')
  })

  it('shows company section card', () => {
    const wrapper = mountWithStore()
    expect(wrapper.find('.ds-client-settings__section').exists()).toBe(true)
  })

  it('populates form fields from profile', () => {
    const wrapper = mountWithStore()
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThanOrEqual(1)
  })

  it('has save button', () => {
    const wrapper = mountWithStore()
    expect(wrapper.html()).toContain('Save Changes')
  })

  it('calls updateProfile on save', async () => {
    const updateProfile = vi.fn()
    const wrapper = mountWithStore({ updateProfile })
    const saveButton = wrapper.find('button')
    await saveButton.trigger('click')
    expect(updateProfile).toHaveBeenCalled()
  })
})
