import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AuthLayout from '@/components/layout/AuthLayout.vue'

const StubChild = { template: '<div class="child-view">Child</div>' }

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      component: AuthLayout,
      children: [
        { path: '', name: 'auth-root', component: StubChild },
      ],
    },
  ],
})

function mountAuthLayout() {
  router.push('/')
  return mount(AuthLayout, {
    global: {
      plugins: [createPinia(), router],
    },
  })
}

describe('AuthLayout', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the layout container', () => {
    const wrapper = mountAuthLayout()
    expect(wrapper.find('.ds-auth-layout').exists()).toBe(true)
  })

  it('renders the card container', () => {
    const wrapper = mountAuthLayout()
    expect(wrapper.find('.ds-auth-layout__card').exists()).toBe(true)
  })

  it('renders the child router-view inside the card', async () => {
    await router.isReady()
    const wrapper = mountAuthLayout()
    expect(wrapper.find('.child-view').exists()).toBe(true)
  })

  it('has min-height 100vh on the layout', () => {
    const wrapper = mountAuthLayout()
    const layout = wrapper.find('.ds-auth-layout')
    expect(layout.attributes('class')).toContain('ds-auth-layout')
  })
})
