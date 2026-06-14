import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'

describe('App', () => {
  it('mounts without errors', () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/', component: { template: '<div>Home</div>' } }],
    })

    const wrapper = mount(App, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})
