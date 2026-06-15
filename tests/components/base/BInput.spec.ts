import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BInput from '@/components/base/BInput.vue'

describe('BInput', () => {
  it('renders input with default props', () => {
    const wrapper = mount(BInput, { props: { modelValue: '' } })
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('input').attributes('type')).toBe('text')
  })

  it('renders label when provided', () => {
    const wrapper = mount(BInput, { props: { modelValue: '', label: 'Email' } })
    expect(wrapper.text()).toContain('Email')
    expect(wrapper.find('label').exists()).toBe(true)
  })

  it('renders placeholder when provided', () => {
    const wrapper = mount(BInput, { props: { modelValue: '', placeholder: 'Enter email' } })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter email')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(BInput, { props: { modelValue: '' } })
    await wrapper.find('input').setValue('hello')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['hello'])
  })

  it('shows error message when error prop is set', () => {
    const wrapper = mount(BInput, { props: { modelValue: '', error: 'Required field' } })
    expect(wrapper.text()).toContain('Required field')
    expect(wrapper.find('.ds-input-error').exists()).toBe(true)
  })

  it('shows hint text when hint prop is set', () => {
    const wrapper = mount(BInput, { props: { modelValue: '', hint: 'Must be valid' } })
    expect(wrapper.text()).toContain('Must be valid')
    expect(wrapper.find('.ds-input-hint').exists()).toBe(true)
  })

  it('disables input when disabled prop is true', () => {
    const wrapper = mount(BInput, { props: { modelValue: '', disabled: true } })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('renders icon when provided', () => {
    const wrapper = mount(BInput, { props: { modelValue: '', icon: 'bi-envelope' } })
    expect(wrapper.find('.ds-input-icon').exists()).toBe(true)
  })
})
