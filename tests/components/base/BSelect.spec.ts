import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BSelect from '@/components/base/BSelect.vue'

const defaultOptions = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
]

function mountSelect(props: Record<string, unknown> = {}) {
  return mount(BSelect, {
    props: { options: defaultOptions, ...props },
    attachTo: document.body,
  })
}

describe('BSelect', () => {
  it('renders all options', () => {
    const wrapper = mountSelect()
    const options = wrapper.findAll('option')
    expect(options).toHaveLength(3)
  })

  it('renders placeholder as disabled first option when provided', () => {
    const wrapper = mountSelect({ placeholder: 'Select currency' })
    const options = wrapper.findAll('option')
    expect(options[0].text()).toBe('Select currency')
    expect(options[0].attributes('disabled')).toBeDefined()
    expect(options[0].element.value).toBe('')
  })

  it('does not render placeholder option when not provided', () => {
    const wrapper = mountSelect()
    const options = wrapper.findAll('option')
    expect(options).toHaveLength(3)
    expect(options[0].text()).toBe('USD')
  })

  it('renders label when provided', () => {
    const wrapper = mountSelect({ label: 'Currency' })
    expect(wrapper.find('.ds-input-label').text()).toBe('Currency')
  })

  it('does not render label when not provided', () => {
    const wrapper = mountSelect()
    expect(wrapper.find('.ds-input-label').exists()).toBe(false)
  })

  it('emits update:modelValue on change', async () => {
    const wrapper = mountSelect({ modelValue: 'USD' })
    const select = wrapper.find('select')
    await select.setValue('EUR')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['EUR'])
  })

  it('renders error text when error prop is provided', () => {
    const wrapper = mountSelect({ error: 'Currency required' })
    expect(wrapper.find('.ds-input-error-text').text()).toBe('Currency required')
    expect(wrapper.find('.ds-input-group').classes()).toContain('ds-input-error')
  })

  it('renders hint text when hint prop is provided', () => {
    const wrapper = mountSelect({ hint: 'Choose a currency' })
    expect(wrapper.find('.ds-input-hint').text()).toBe('Choose a currency')
  })

  it('disables select when disabled prop is true', () => {
    const wrapper = mountSelect({ disabled: true })
    expect(wrapper.find('select').attributes('disabled')).toBeDefined()
  })

  it('disables individual option when option.disabled is true', () => {
    const options = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', disabled: true },
    ]
    const wrapper = mountSelect({ options })
    const opts = wrapper.findAll('option')
    expect(opts[1].attributes('disabled')).toBeDefined()
  })

  it('renders chevron icon', () => {
    const wrapper = mountSelect()
    expect(wrapper.find('.ds-select__chevron').exists()).toBe(true)
  })
})
