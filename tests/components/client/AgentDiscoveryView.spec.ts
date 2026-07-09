import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AgentDiscoveryView from '@/views/client/AgentDiscoveryView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/agents/:slug', name: 'agent-profile', component: { template: '<div />' } },
  ],
})

const mockAgents = [
  {
    id: 1,
    slug: 'abc123',
    firstName: 'Diana',
    lastName: 'Prince',
    bio: 'Legal & finance agent',
    specialties: ['Legal', 'Finance'],
    acceptedClientTypes: 'Both' as const,
    profilePhotoUrl: null,
  },
]

const discoverAgentsMock = vi.fn()

vi.mock('@/services/users', () => ({
  discoverAgents: (...args: unknown[]) => discoverAgentsMock(...args),
}))

function mountDiscovery() {
  const pinia = createPinia()
  setActivePinia(pinia)

  return mount(AgentDiscoveryView, {
    global: {
      plugins: [pinia, router],
    },
  })
}

describe('AgentDiscoveryView', () => {
  beforeEach(() => {
    localStorage.clear()
    discoverAgentsMock.mockReset()
    discoverAgentsMock.mockResolvedValue({ success: true, data: mockAgents })
  })

  it('renders the discovery container', () => {
    const wrapper = mountDiscovery()
    expect(wrapper.find('.ds-agent-discovery').exists()).toBe(true)
  })

  it('displays the page title', () => {
    const wrapper = mountDiscovery()
    expect(wrapper.html()).toContain('Discover Agents')
  })

  it('displays the page subtitle', () => {
    const wrapper = mountDiscovery()
    expect(wrapper.html()).toContain('Browse verified agents')
  })

  it('shows search input', () => {
    const wrapper = mountDiscovery()
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('displays search button', () => {
    const wrapper = mountDiscovery()
    expect(wrapper.html()).toContain('Search')
  })

  it('loads agents on mount via the service', async () => {
    const wrapper = mountDiscovery()
    // Wait for onMounted async call to settle
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(discoverAgentsMock).toHaveBeenCalled()
  })

  it('renders agent cards after load', async () => {
    const wrapper = mountDiscovery()
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toContain('Diana')
    expect(wrapper.html()).toContain('Legal')
  })

  it('triggers search with query when search button clicked', async () => {
    const wrapper = mountDiscovery()
    await wrapper.find('input').setValue('Finance')
    await wrapper.vm.$nextTick()
    discoverAgentsMock.mockClear()
    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()
    expect(discoverAgentsMock).toHaveBeenCalledWith({ q: 'Finance' })
  })

  it('shows empty state when no agents returned', async () => {
    discoverAgentsMock.mockResolvedValue({ success: true, data: [] })
    const wrapper = mountDiscovery()
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.ds-empty-state').exists()).toBe(true)
  })
})
