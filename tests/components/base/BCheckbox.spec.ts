import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BCheckbox from '@/components/base/BCheckbox.vue'

describe('BCheckbox', () => {
  it('renders with label', () => {
    const wrapper = mount(BCheckbox, { props: { label: 'Accept terms' } })
    expect(wrapper.text()).toContain('Accept terms')
  })

  it('renders without label', () => {
    const wrapper = mount(BCheckbox)
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
  })

  it('binds checked state via v-model', async () => {
    const wrapper = mount(BCheckbox, {
      props: { modelValue: false },
    })
    const input = wrapper.find('input[type="checkbox"]')
    expect(input.attributes('checked')).toBeUndefined()

    await input.setValue(true)
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([true])
  })

  it('unchecks when modelValue is true and toggled', async () => {
    const wrapper = mount(BCheckbox, {
      props: { modelValue: true },
    })
    const input = wrapper.find('input[type="checkbox"]')
    expect(input.attributes('checked')).toBeDefined()

    await input.setValue(false)
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
  })

  it('disables checkbox when disabled prop is true', () => {
    const wrapper = mount(BCheckbox, { props: { label: 'Disabled', disabled: true } })
    expect(wrapper.find('input[type="checkbox"]').attributes('disabled')).toBeDefined()
  })

  it('shows error text when error prop is set', () => {
    const wrapper = mount(BCheckbox, { props: { label: 'Terms', error: 'Required field' } })
    expect(wrapper.text()).toContain('Required field')
    expect(wrapper.find('.ds-input-error-text').exists()).toBe(true)
  })

  it('shows hint text when hint prop is set and no error', () => {
    const wrapper = mount(BCheckbox, { props: { label: 'Subscribe', hint: 'We will never spam you.' } })
    expect(wrapper.text()).toContain('We will never spam you.')
    expect(wrapper.find('.ds-input-hint').exists()).toBe(true)
  })

  it('hides hint when error is present', () => {
    const wrapper = mount(BCheckbox, { props: { error: 'Error', hint: 'Hint' } })
    expect(wrapper.find('.ds-input-error-text').exists()).toBe(true)
    expect(wrapper.find('.ds-input-hint').exists()).toBe(false)
  })

  it('renders default slot as label content', () => {
    const wrapper = mount(BCheckbox, {
      slots: { default: 'Slot content' },
    })
    expect(wrapper.text()).toContain('Slot content')
  })

  it('generates a unique input id', () => {
    const wrapper1 = mount(BCheckbox, { props: { label: 'A' } })
    const wrapper2 = mount(BCheckbox, { props: { label: 'B' } })
    const id1 = wrapper1.find('input').element.id
    const id2 = wrapper2.find('input').element.id
    expect(id1).not.toBe(id2)
  })

  it('applies error class to group when error is set', () => {
    const wrapper = mount(BCheckbox, { props: { error: 'Required' } })
    expect(wrapper.find('.ds-input-group').classes()).toContain('ds-input-error')
  })
})
