import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import RegisterView from '@/views/auth/RegisterView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/register', component: RegisterView, name: 'register' },
    { path: '/login', component: { template: '<div />' }, name: 'login' },
    { path: '/app/dashboard', component: { template: '<div />' }, name: 'dashboard' },
  ],
})

function mountRegister() {
  return mount(RegisterView, {
    global: {
      plugins: [createPinia(), router],
    },
  })
}

describe('RegisterView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('renders the registration form', () => {
    const wrapper = mountRegister()
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('renders firstName input', () => {
    const wrapper = mountRegister()
    expect(wrapper.find('input[name="firstName"], input[placeholder*="First"]').exists()).toBe(true)
  })

  it('renders lastName input', () => {
    const wrapper = mountRegister()
    expect(wrapper.find('input[name="lastName"], input[placeholder*="Last"]').exists()).toBe(true)
  })

  it('renders email input', () => {
    const wrapper = mountRegister()
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
  })

  it('renders password input', () => {
    const wrapper = mountRegister()
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
  })

  it('renders role selection (Agent and Client)', () => {
    const wrapper = mountRegister()
    const html = wrapper.html()
    expect(html.toLowerCase()).toContain('agent')
    expect(html.toLowerCase()).toContain('client')
  })

  it('renders a submit button', () => {
    const wrapper = mountRegister()
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('renders "Login" link', () => {
    const wrapper = mountRegister()
    const loginLink = wrapper.find('a[href*="login"]')
    expect(loginLink.exists()).toBe(true)
  })

  it('does not show error initially', () => {
    const wrapper = mountRegister()
    expect(wrapper.find('.ds-alert--danger, .ds-auth-error').exists()).toBe(false)
  })
})
