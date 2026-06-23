import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

describe('SkeletonLoader', () => {
  it('renders text variant by default', () => {
    const wrapper = mount(SkeletonLoader)
    expect(wrapper.find('.ds-skeleton-text-group').exists()).toBe(true)
    expect(wrapper.findAll('.ds-skeleton--text').length).toBeGreaterThanOrEqual(3)
  })

  it('renders multiple text lines based on lines prop', () => {
    const wrapper = mount(SkeletonLoader, { props: { variant: 'text', lines: 5 } })
    expect(wrapper.findAll('.ds-skeleton--text').length).toBe(5)
  })

  it('renders circle variant', () => {
    const wrapper = mount(SkeletonLoader, { props: { variant: 'circle', width: '48px' } })
    expect(wrapper.find('.ds-skeleton--circle').exists()).toBe(true)
    const el = wrapper.find('.ds-skeleton--circle')
    expect(el.attributes('style')).toContain('48px')
  })

  it('renders line variant', () => {
    const wrapper = mount(SkeletonLoader, { props: { variant: 'line' } })
    expect(wrapper.find('.ds-skeleton--line').exists()).toBe(true)
  })

  it('renders avatar variant', () => {
    const wrapper = mount(SkeletonLoader, { props: { variant: 'avatar' } })
    expect(wrapper.find('.ds-skeleton--avatar').exists()).toBe(true)
  })

  it('renders badge variant', () => {
    const wrapper = mount(SkeletonLoader, { props: { variant: 'badge' } })
    expect(wrapper.find('.ds-skeleton--badge').exists()).toBe(true)
  })

  it('renders card variant with header and body', () => {
    const wrapper = mount(SkeletonLoader, { props: { variant: 'card', lines: 2 } })
    expect(wrapper.find('.ds-skeleton--card').exists()).toBe(true)
    expect(wrapper.find('.ds-skeleton-card__header').exists()).toBe(true)
    expect(wrapper.find('.ds-skeleton-card__body').exists()).toBe(true)
    expect(wrapper.findAll('.ds-skeleton-card__body .ds-skeleton--line').length).toBe(2)
  })

  it('applies custom width and height', () => {
    const wrapper = mount(SkeletonLoader, {
      props: { variant: 'line', width: '200px', height: '8px' },
    })
    const el = wrapper.find('.ds-skeleton')
    expect(el.attributes('style')).toContain('200px')
    expect(el.attributes('style')).toContain('8px')
  })

  it('renders shimmer animation class on all variants', () => {
    const variants = ['text', 'circle', 'line', 'avatar', 'badge'] as const
    for (const variant of variants) {
      const wrapper = mount(SkeletonLoader, { props: { variant } })
      expect(wrapper.find('.ds-skeleton').classes()).toContain('ds-skeleton')
    }
  })
})
