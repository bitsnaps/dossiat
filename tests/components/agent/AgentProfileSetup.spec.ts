import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AgentProfileSetup from '@/views/agent/AgentProfileSetup.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/app/dashboard', name: 'dashboard', component: { template: '<div />' } },
    { path: '/app/onboarding', name: 'onboarding', component: { template: '<div />' } },
  ],
})

vi.mock('@/stores/agentProfile', () => ({
  useAgentProfileStore: vi.fn(() => ({
    profile: null,
    loading: false,
    error: null,
    updateProfile: vi.fn().mockResolvedValue({}),
    uploadAvatar: vi.fn().mockResolvedValue({}),
  })),
}))

vi.mock('@/composables/useToast', () => ({
  useToast: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
  })),
}))

function mountSetup() {
  const pinia = createPinia()
  setActivePinia(pinia)

  return mount(AgentProfileSetup, {
    global: {
      plugins: [pinia, router],
    },
  })
}

describe('AgentProfileSetup', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the setup card', () => {
    const wrapper = mountSetup()
    expect(wrapper.find('.ds-agent-setup').exists()).toBe(true)
  })

  it('displays the title', () => {
    const wrapper = mountSetup()
    expect(wrapper.html()).toContain('Complete Your Profile')
  })

  it('displays the subtitle', () => {
    const wrapper = mountSetup()
    expect(wrapper.html()).toContain('Set up your agent profile')
  })

  it('shows progress bar', () => {
    const wrapper = mountSetup()
    expect(wrapper.find('.ds-agent-setup__progress').exists()).toBe(true)
  })

  it('starts at step 1 (Basics)', () => {
    const wrapper = mountSetup()
    const activeStep = wrapper.find('.ds-agent-setup__step--active')
    expect(activeStep.exists()).toBe(true)
    expect(activeStep.text()).toContain('Basics')
  })

  it('shows bio input on step 1', () => {
    const wrapper = mountSetup()
    expect(wrapper.html()).toContain('Bio')
  })

  it('shows next button', () => {
    const wrapper = mountSetup()
    expect(wrapper.html()).toContain('Next')
  })

  it('shows back button is hidden on step 1', () => {
    const wrapper = mountSetup()
    const buttons = wrapper.findAll('button')
    const backBtn = buttons.find((b) => b.text().includes('Back'))
    expect(backBtn).toBeUndefined()
  })

  it('navigates to the specialties step and renders extended options', async () => {
    const wrapper = mountSetup()
    // Fill step 1 (Basics) bio input to pass validation
    const bioInput = wrapper.find('input')
    await bioInput.setValue('I am an experienced agent.')
    // Move to step 2 (Specialties)
    const nextBtn = wrapper.findAll('button').find((b) => b.text().includes('Next'))
    await nextBtn!.trigger('click')

    // Extended specialty options should be rendered as tags
    const html = wrapper.html()
    expect(html).toContain('Translation')
    expect(html).toContain('Marketing')
    expect(html).toContain('Logistics')
    // Custom add input should be present
    expect(wrapper.find('.ds-tag-group__add').exists()).toBe(true)
    expect(wrapper.find('.ds-tag-group__input').exists()).toBe(true)
  })
})
