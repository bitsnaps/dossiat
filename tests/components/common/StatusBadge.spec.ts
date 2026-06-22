import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBadge from '@/components/common/StatusBadge.vue'

describe('StatusBadge', () => {
  it('renders with mission status and correct variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'in_progress', type: 'mission' },
    })
    expect(wrapper.find('.ds-badge').exists()).toBe(true)
    expect(wrapper.find('.ds-badge--info').exists()).toBe(true)
  })

  it('maps mission statuses to correct variants', () => {
    const expected: Record<string, string> = {
      in_progress: 'info',
      agreed: 'accent',
      pending_agreement: 'warning',
      completed: 'success',
      disputed: 'danger',
      draft: '',
      cancelled: '',
    }
    for (const [status, variantClass] of Object.entries(expected)) {
      const wrapper = mount(StatusBadge, {
        props: { status, type: 'mission' },
      })
      if (variantClass) {
        expect(wrapper.find(`.ds-badge--${variantClass}`).exists()).toBe(true)
      } else {
        expect(wrapper.find('.ds-badge').exists()).toBe(true)
      }
    }
  })

  it('maps payment statuses to correct variants', () => {
    const expected: Record<string, string> = {
      completed: 'success',
      pending: 'warning',
      confirmed: 'info',
      failed: 'danger',
    }
    for (const [status, variantClass] of Object.entries(expected)) {
      const wrapper = mount(StatusBadge, {
        props: { status, type: 'payment' },
      })
      expect(wrapper.find(`.ds-badge--${variantClass}`).exists()).toBe(true)
    }
  })

  it('maps subscription statuses to correct variants', () => {
    const expected: Record<string, string> = {
      active: 'success',
      past_due: 'warning',
      cancelled: '',
      trialing: 'info',
    }
    for (const [status, variantClass] of Object.entries(expected)) {
      const wrapper = mount(StatusBadge, {
        props: { status, type: 'subscription' },
      })
      if (variantClass) {
        expect(wrapper.find(`.ds-badge--${variantClass}`).exists()).toBe(true)
      }
    }
  })

  it('defaults to mission type', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'in_progress' } })
    expect(wrapper.find('.ds-badge--info').exists()).toBe(true)
  })

  it('applies size class', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'completed', size: 'sm' },
    })
    expect(wrapper.classes()).toContain('ds-badge--sm')
  })

  it('supports custom label via slot', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'completed' },
      slots: { default: 'Custom Label' },
    })
    expect(wrapper.text()).toContain('Custom Label')
  })

  it('uses fallback label when i18n key not found', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'some_unknown_status' },
    })
    expect(wrapper.text()).toContain('Some Unknown Status')
  })

  it('renders unknown status with default variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'unknown_status' },
    })
    expect(wrapper.find('.ds-badge').exists()).toBe(true)
  })
})
