import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AppearanceSettingsView from '@/views/settings/AppearanceSettingsView.vue'

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

describe('AppearanceSettingsView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  function createWrapper() {
    const pinia = createPinia()
    setActivePinia(pinia)
    return mount(AppearanceSettingsView, {
      global: {
        plugins: [pinia, router],
      },
    })
  }

  it('renders the appearance settings container', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.ds-appearance-settings').exists()).toBe(true)
  })

  it('displays the page title', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Appearance Settings')
  })

  it('displays the page subtitle', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Customize the look and feel')
  })

  it('renders theme options', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Dark Mode')
    expect(wrapper.text()).toContain('Light Mode')
  })

  it('renders language selector', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Language')
  })

  it('has a save button', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Save Preferences')
  })
})
