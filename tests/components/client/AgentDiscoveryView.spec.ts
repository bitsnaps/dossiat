import { describe, it, expect, beforeEach } from 'vitest'
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

  it('shows empty state initially', () => {
    const wrapper = mountDiscovery()
    expect(wrapper.find('.ds-empty-state').exists()).toBe(true)
  })

  it('displays search button', () => {
    const wrapper = mountDiscovery()
    expect(wrapper.html()).toContain('Search')
  })
})
