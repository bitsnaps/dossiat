import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BAlert from '@/components/base/BAlert.vue'

describe('BAlert', () => {
  it('renders with default variant (info)', () => {
    const wrapper = mount(BAlert)
    expect(wrapper.find('.ds-alert').exists()).toBe(true)
    expect(wrapper.find('.ds-alert--info').exists()).toBe(true)
  })

  it('renders each variant with correct class', () => {
    const variants = ['info', 'success', 'warning', 'danger', 'accent'] as const
    for (const variant of variants) {
      const wrapper = mount(BAlert, { props: { variant } })
      expect(wrapper.find(`.ds-alert--${variant}`).exists()).toBe(true)
    }
  })

  it('renders slot content', () => {
    const wrapper = mount(BAlert, {
      slots: { default: 'Alert message here' },
    })
    expect(wrapper.text()).toContain('Alert message here')
  })

  it('shows close button when dismissible=true', () => {
    const wrapper = mount(BAlert, { props: { dismissible: true } })
    expect(wrapper.find('.ds-alert__close').exists()).toBe(true)
  })

  it('does NOT show close button when dismissible=false', () => {
    const wrapper = mount(BAlert, { props: { dismissible: false } })
    expect(wrapper.find('.ds-alert__close').exists()).toBe(false)
  })

  it('emits dismiss when close button clicked', async () => {
    const wrapper = mount(BAlert, { props: { dismissible: true } })
    await wrapper.find('.ds-alert__close').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('dismiss')
  })

  it('hides after dismiss', async () => {
    const wrapper = mount(BAlert, { props: { dismissible: true } })
    await wrapper.find('.ds-alert__close').trigger('click')
    expect(wrapper.find('.ds-alert').exists()).toBe(false)
  })

  it('shows title when title prop provided', () => {
    const wrapper = mount(BAlert, { props: { title: 'Heads up' } })
    expect(wrapper.find('.ds-alert__title').text()).toBe('Heads up')
  })

  it('renders auto icon based on variant', () => {
    const expected: Record<string, string> = {
      info: 'bi-info-circle',
      success: 'bi-check-circle',
      warning: 'bi-exclamation-triangle',
      danger: 'bi-x-circle',
      accent: 'bi-lightning',
    }
    for (const [variant, iconClass] of Object.entries(expected)) {
      const wrapper = mount(BAlert, { props: { variant: variant as any } })
      expect(wrapper.find(`.${iconClass}`).exists()).toBe(true)
    }
  })

  it('allows custom icon via icon prop', () => {
    const wrapper = mount(BAlert, { props: { icon: 'bi-star' } })
    expect(wrapper.find('.bi-star').exists()).toBe(true)
    expect(wrapper.find('.bi-info-circle').exists()).toBe(false)
  })
})
