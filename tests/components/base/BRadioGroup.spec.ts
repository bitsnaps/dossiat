import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BRadioGroup from '@/components/base/BRadioGroup.vue'

const defaultOptions = [
  { value: 'B2B', label: 'B2B' },
  { value: 'B2C', label: 'B2C' },
  { value: 'Both', label: 'Both' },
]

function mountRadio(props: Record<string, unknown> = {}) {
  return mount(BRadioGroup, {
    props: { options: defaultOptions, ...props },
  })
}

describe('BRadioGroup', () => {
  it('renders all options', () => {
    const wrapper = mountRadio()
    const labels = wrapper.findAll('.ds-radio-option__label')
    expect(labels).toHaveLength(3)
    expect(labels[0].text()).toBe('B2B')
    expect(labels[1].text()).toBe('B2C')
    expect(labels[2].text()).toBe('Both')
  })

  it('renders label when provided', () => {
    const wrapper = mountRadio({ label: 'Client Type' })
    expect(wrapper.find('.ds-input-label').text()).toBe('Client Type')
  })

  it('does not render label when not provided', () => {
    const wrapper = mountRadio()
    expect(wrapper.find('.ds-input-label').exists()).toBe(false)
  })

  it('selects an option on click', async () => {
    const wrapper = mountRadio({ modelValue: '' })
    const options = wrapper.findAll('.ds-radio-option')
    await options[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['B2C'])
  })

  it('marks the selected option as active', () => {
    const wrapper = mountRadio({ modelValue: 'B2B' })
    const options = wrapper.findAll('.ds-radio-option')
    expect(options[0].classes()).toContain('ds-radio-option--active')
    expect(options[1].classes()).not.toContain('ds-radio-option--active')
  })

  it('renders error text when error prop is provided', () => {
    const wrapper = mountRadio({ error: 'Required field' })
    expect(wrapper.find('.ds-input-error-text').text()).toBe('Required field')
    expect(wrapper.find('.ds-input-group').classes()).toContain('ds-input-error')
  })

  it('renders hint text when hint prop is provided', () => {
    const wrapper = mountRadio({ hint: 'Pick one' })
    expect(wrapper.find('.ds-input-hint').text()).toBe('Pick one')
  })

  it('disables all options when disabled prop is true', () => {
    const wrapper = mountRadio({ disabled: true })
    const options = wrapper.findAll('.ds-radio-option')
    options.forEach(opt => {
      expect(opt.classes()).toContain('ds-radio-option--disabled')
    })
  })

  it('does not emit update when disabled and clicked', async () => {
    const wrapper = mountRadio({ disabled: true, modelValue: '' })
    await wrapper.find('.ds-radio-option').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('renders vertical layout when orientation is vertical', () => {
    const wrapper = mountRadio({ orientation: 'vertical' })
    expect(wrapper.find('.ds-radio-group').classes()).toContain('ds-radio-group--vertical')
  })

  it('renders icon when option has icon', () => {
    const options = [{ value: 'a', label: 'Alpha', icon: 'bi-star' }]
    const wrapper = mountRadio({ options })
    expect(wrapper.find('.ds-radio-option__icon').classes()).toContain('bi-star')
  })
})
