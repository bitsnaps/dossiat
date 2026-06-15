import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BButton from '@/components/base/BButton.vue'

describe('BButton', () => {
  it('renders button element by default', () => {
    const wrapper = mount(BButton, { slots: { default: 'Click me' } })
    const btn = wrapper.find('button')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toBe('Click me')
    expect(btn.classes()).toContain('ds-btn')
    expect(btn.classes()).toContain('ds-btn--accent')
    expect(btn.classes()).toContain('ds-btn--md')
  })

  it('applies variant classes', () => {
    const variants = ['accent', 'outline', 'gradient', 'ghost', 'danger'] as const
    for (const v of variants) {
      const wrapper = mount(BButton, { props: { variant: v }, slots: { default: 'Btn' } })
      expect(wrapper.find('button').classes()).toContain(`ds-btn--${v}`)
    }
  })

  it('applies size classes', () => {
    for (const s of ['sm', 'md', 'lg'] as const) {
      const wrapper = mount(BButton, { props: { size: s }, slots: { default: 'Btn' } })
      expect(wrapper.find('button').classes()).toContain(`ds-btn--${s}`)
    }
  })

  it('is disabled when disabled=true', () => {
    const wrapper = mount(BButton, { props: { disabled: true }, slots: { default: 'Btn' } })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('is disabled when loading=true', () => {
    const wrapper = mount(BButton, { props: { loading: true }, slots: { default: 'Btn' } })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('applies loading class when loading=true', () => {
    const wrapper = mount(BButton, { props: { loading: true }, slots: { default: 'Btn' } })
    expect(wrapper.find('button').classes()).toContain('ds-btn--loading')
  })

  it('emits click when clicked', async () => {
    const wrapper = mount(BButton, { slots: { default: 'Btn' } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does NOT emit click when disabled', async () => {
    const wrapper = mount(BButton, { props: { disabled: true }, slots: { default: 'Btn' } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('does NOT emit click when loading', async () => {
    const wrapper = mount(BButton, { props: { loading: true }, slots: { default: 'Btn' } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('renders icon from icon prop', () => {
    const wrapper = mount(BButton, { props: { icon: 'bi-plus' }, slots: { default: 'Btn' } })
    expect(wrapper.find('i.bi.bi-plus').exists()).toBe(true)
  })

  it('renders icon slot', () => {
    const wrapper = mount(BButton, {
      slots: { default: 'Btn', icon: '<span class="custom-icon">X</span>' },
    })
    expect(wrapper.find('.custom-icon').exists()).toBe(true)
  })

  it('renders <a> when href is provided', () => {
    const wrapper = mount(BButton, {
      props: { href: 'https://example.com' },
      slots: { default: 'Link' },
    })
    const a = wrapper.find('a')
    expect(a.exists()).toBe(true)
    expect(a.attributes('href')).toBe('https://example.com')
    expect(a.text()).toBe('Link')
  })

  it('renders RouterLink when to is provided', () => {
    const wrapper = mount(BButton, {
      props: { to: '/dashboard' },
      slots: { default: 'Go' },
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    })
    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.text()).toBe('Go')
  })

  it('passes type attribute to button', () => {
    const wrapper = mount(BButton, {
      props: { type: 'submit' },
      slots: { default: 'Submit' },
    })
    expect(wrapper.find('button').attributes('type')).toBe('submit')
  })
})
