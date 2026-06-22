import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue'

describe('CurrencyDisplay', () => {
  it('renders with default size', () => {
    const wrapper = mount(CurrencyDisplay, {
      props: { amount: 100, currency: 'USD' },
    })
    expect(wrapper.find('.ds-currency-display').exists()).toBe(true)
    expect(wrapper.find('.ds-currency-display--md').exists()).toBe(true)
  })

  it('applies size class', () => {
    for (const s of ['sm', 'md', 'lg'] as const) {
      const wrapper = mount(CurrencyDisplay, {
        props: { amount: 50, currency: 'EUR', size: s },
      })
      expect(wrapper.find(`.ds-currency-display--${s}`).exists()).toBe(true)
    }
  })

  it('renders formatted amount', () => {
    const wrapper = mount(CurrencyDisplay, {
      props: { amount: 1500, currency: 'USD' },
    })
    expect(wrapper.find('.ds-currency-display__amount').exists()).toBe(true)
  })

  it('renders currency code', () => {
    const wrapper = mount(CurrencyDisplay, {
      props: { amount: 100, currency: 'USD' },
    })
    expect(wrapper.find('.ds-currency-display__code').exists()).toBe(true)
    expect(wrapper.find('.ds-currency-display__code').text()).toContain('USD')
  })

  it('applies font-mono class', () => {
    const wrapper = mount(CurrencyDisplay, {
      props: { amount: 100, currency: 'USD' },
    })
    expect(wrapper.find('.font-mono').exists()).toBe(true)
  })

  it('handles zero amount', () => {
    const wrapper = mount(CurrencyDisplay, {
      props: { amount: 0, currency: 'USD' },
    })
    expect(wrapper.find('.ds-currency-display').exists()).toBe(true)
  })

  it('handles negative amount', () => {
    const wrapper = mount(CurrencyDisplay, {
      props: { amount: -50, currency: 'USD' },
    })
    expect(wrapper.find('.ds-currency-display').exists()).toBe(true)
  })
})
