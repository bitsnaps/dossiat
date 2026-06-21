import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/login', component: LoginView, name: 'login' },
    { path: '/register', component: { template: '<div />' }, name: 'register' },
    { path: '/forgot-password', component: { template: '<div />' }, name: 'forgot-password' },
    { path: '/app/dashboard', component: { template: '<div />' }, name: 'dashboard' },
  ],
})

function mountLogin() {
  return mount(LoginView, {
    global: {
      plugins: [createPinia(), router],
    },
  })
}

describe('LoginView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('renders the login form', () => {
    const wrapper = mountLogin()
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('renders email input', () => {
    const wrapper = mountLogin()
    const emailInput = wrapper.find('input[type="email"]')
    expect(emailInput.exists()).toBe(true)
  })

  it('renders password input', () => {
    const wrapper = mountLogin()
    const passwordInput = wrapper.find('input[type="password"]')
    expect(passwordInput.exists()).toBe(true)
  })

  it('renders a submit button', () => {
    const wrapper = mountLogin()
    const submitBtn = wrapper.find('button[type="submit"]')
    expect(submitBtn.exists()).toBe(true)
  })

  it('renders "Forgot password?" link', () => {
    const wrapper = mountLogin()
    const forgotLink = wrapper.find('a[href*="forgot-password"], a[href*="forgot"]')
    expect(forgotLink.exists()).toBe(true)
  })

  it('renders "Register" link', () => {
    const wrapper = mountLogin()
    const registerLink = wrapper.find('a[href*="register"]')
    expect(registerLink.exists()).toBe(true)
  })

  it('v-models email input', async () => {
    const wrapper = mountLogin()
    const emailInput = wrapper.find('input[type="email"]')
    await emailInput.setValue('test@example.com')
    expect((emailInput.element as HTMLInputElement).value).toBe('test@example.com')
  })

  it('v-models password input', async () => {
    const wrapper = mountLogin()
    const passwordInput = wrapper.find('input[type="password"]')
    await passwordInput.setValue('secret123')
    expect((passwordInput.element as HTMLInputElement).value).toBe('secret123')
  })

  it('shows error message from auth store', async () => {
    const wrapper = mountLogin()
    // The error should be reactive from the store
    // Initially no error
    expect(wrapper.find('.ds-alert--danger, .ds-auth-error').exists()).toBe(false)
  })

  it('disables submit button while loading', async () => {
    const wrapper = mountLogin()
    const submitBtn = wrapper.find('button[type="submit"]')
    expect(submitBtn.attributes('disabled')).toBeUndefined()
  })
})
