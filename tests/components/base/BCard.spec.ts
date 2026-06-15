import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BCard from '@/components/base/BCard.vue'

describe('BCard', () => {
  it('renders default slot content', () => {
    const wrapper = mount(BCard, {
      slots: { default: '<p>Card body</p>' },
    })
    expect(wrapper.html()).toContain('<p>Card body</p>')
  })

  it('renders header slot when provided', () => {
    const wrapper = mount(BCard, {
      slots: { header: '<div class="header">Header</div>' },
    })
    expect(wrapper.html()).toContain('Header')
    expect(wrapper.find('.ds-card__header').exists()).toBe(true)
  })

  it('does not render header slot when not provided', () => {
    const wrapper = mount(BCard)
    expect(wrapper.find('.ds-card__header').exists()).toBe(false)
  })

  it('renders footer slot when provided', () => {
    const wrapper = mount(BCard, {
      slots: { footer: '<div class="footer">Footer</div>' },
    })
    expect(wrapper.html()).toContain('Footer')
    expect(wrapper.find('.ds-card__footer').exists()).toBe(true)
  })

  it('does not render footer slot when not provided', () => {
    const wrapper = mount(BCard)
    expect(wrapper.find('.ds-card__footer').exists()).toBe(false)
  })

  it('applies bordered variant class by default', () => {
    const wrapper = mount(BCard)
    expect(wrapper.classes()).toContain('ds-card')
    expect(wrapper.classes()).not.toContain('ds-card--transparent')
    expect(wrapper.classes()).not.toContain('ds-card--elevated')
  })

  it('applies transparent variant class', () => {
    const wrapper = mount(BCard, {
      props: { variant: 'transparent' },
    })
    expect(wrapper.classes()).toContain('ds-card--transparent')
  })

  it('applies elevated variant class', () => {
    const wrapper = mount(BCard, {
      props: { variant: 'elevated' },
    })
    expect(wrapper.classes()).toContain('ds-card--elevated')
  })

  it('applies md padding class by default', () => {
    const wrapper = mount(BCard)
    expect(wrapper.find('.ds-card__body').classes()).toContain('ds-card__body--md')
  })

  it('applies sm padding class', () => {
    const wrapper = mount(BCard, {
      props: { padding: 'sm' },
    })
    expect(wrapper.find('.ds-card__body').classes()).toContain('ds-card__body--sm')
  })

  it('applies lg padding class', () => {
    const wrapper = mount(BCard, {
      props: { padding: 'lg' },
    })
    expect(wrapper.find('.ds-card__body').classes()).toContain('ds-card__body--lg')
  })

  it('applies none padding class', () => {
    const wrapper = mount(BCard, {
      props: { padding: 'none' },
    })
    expect(wrapper.find('.ds-card__body').classes()).toContain('ds-card__body--none')
  })

  it('does not apply clickable class when clickable is false', () => {
    const wrapper = mount(BCard)
    expect(wrapper.classes()).not.toContain('ds-card--clickable')
  })

  it('applies clickable class when clickable is true', () => {
    const wrapper = mount(BCard, {
      props: { clickable: true },
    })
    expect(wrapper.classes()).toContain('ds-card--clickable')
  })

  it('emits click when clickable and clicked', async () => {
    const wrapper = mount(BCard, {
      props: { clickable: true },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when not clickable', async () => {
    const wrapper = mount(BCard)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })
})
