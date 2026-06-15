import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BBadge from '@/components/base/BBadge.vue'

describe('BBadge', () => {
  it('renders with default props', () => {
    const wrapper = mount(BBadge, { slots: { default: 'Badge' } })
    expect(wrapper.classes()).toContain('ds-badge')
    expect(wrapper.classes()).toContain('font-mono')
    expect(wrapper.text()).toBe('Badge')
  })

  it('renders each variant with correct CSS class', () => {
    const variants = ['success', 'info', 'warning', 'danger', 'accent', 'default'] as const
    for (const variant of variants) {
      const wrapper = mount(BBadge, { props: { variant }, slots: { default: 'Text' } })
      if (variant !== 'default') {
        expect(wrapper.classes()).toContain(`ds-badge--${variant}`)
      } else {
        expect(wrapper.classes()).not.toContain('ds-badge--default')
      }
    }
  })

  it('renders slot content', () => {
    const wrapper = mount(BBadge, {
      slots: { default: '<span>Custom Content</span>' },
    })
    expect(wrapper.html()).toContain('Custom Content')
  })

  it('renders with icon inside', () => {
    const wrapper = mount(BBadge, {
      slots: { default: '<i class="bi bi-check-circle"></i> Verified' },
    })
    expect(wrapper.find('i.bi-check-circle').exists()).toBe(true)
    expect(wrapper.text()).toContain('Verified')
  })

  it('applies size classes', () => {
    const wrapperMd = mount(BBadge, { props: { size: 'md' }, slots: { default: 'MD' } })
    expect(wrapperMd.classes()).not.toContain('ds-badge--sm')

    const wrapperSm = mount(BBadge, { props: { size: 'sm' }, slots: { default: 'SM' } })
    expect(wrapperSm.classes()).toContain('ds-badge--sm')
  })
})
