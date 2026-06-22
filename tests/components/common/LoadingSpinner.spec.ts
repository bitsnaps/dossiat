import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.find('.ds-loading-spinner').exists()).toBe(true)
    expect(wrapper.find('.ds-loading-spinner__ring--md').exists()).toBe(true)
  })

  it('renders each size class', () => {
    for (const s of ['sm', 'md', 'lg'] as const) {
      const wrapper = mount(LoadingSpinner, { props: { size: s } })
      expect(wrapper.find(`.ds-loading-spinner__ring--${s}`).exists()).toBe(true)
    }
  })

  it('renders label when provided', () => {
    const wrapper = mount(LoadingSpinner, { props: { label: 'Loading data…' } })
    expect(wrapper.find('.ds-loading-spinner__label').text()).toBe('Loading data…')
  })

  it('does not render label when not provided', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.find('.ds-loading-spinner__label').exists()).toBe(false)
  })

  it('renders default slot as alternative to label', () => {
    const wrapper = mount(LoadingSpinner, {
      slots: { default: 'Please wait' },
    })
    expect(wrapper.find('.ds-loading-spinner__label').exists()).toBe(true)
    expect(wrapper.text()).toContain('Please wait')
  })
})
