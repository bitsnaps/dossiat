import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import SearchInput from '@/components/common/SearchInput.vue'

describe('SearchInput', () => {
  it('renders search input with icon', () => {
    const wrapper = mount(SearchInput)
    expect(wrapper.find('.ds-search-input').exists()).toBe(true)
    expect(wrapper.find('.ds-search-input__icon').exists()).toBe(true)
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('sets placeholder from prop', () => {
    const wrapper = mount(SearchInput, {
      props: { placeholder: 'Search missions…' },
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Search missions…')
  })

  it('binds value via modelValue', () => {
    const wrapper = mount(SearchInput, {
      props: { modelValue: 'hello' },
    })
    expect(wrapper.find('input').element.value).toBe('hello')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(SearchInput, {
      props: { modelValue: '' },
    })
    const input = wrapper.find('input')
    await input.setValue('test')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('shows clear button when value is non-empty', () => {
    const wrapper = mount(SearchInput, {
      props: { modelValue: 'search term' },
    })
    expect(wrapper.find('.ds-search-input__clear').exists()).toBe(true)
  })

  it('hides clear button when value is empty', () => {
    const wrapper = mount(SearchInput, {
      props: { modelValue: '' },
    })
    expect(wrapper.find('.ds-search-input__clear').exists()).toBe(false)
  })

  it('clears value when clear button is clicked', async () => {
    const wrapper = mount(SearchInput, {
      props: { modelValue: 'search term' },
    })
    await wrapper.find('.ds-search-input__clear').trigger('click')
    await nextTick()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const lastEmit = wrapper.emitted('update:modelValue')!.pop()
    expect(lastEmit).toEqual([''])
  })

  it('applies maxWidth style', () => {
    const wrapper = mount(SearchInput, {
      props: { maxWidth: '400px' },
    })
    expect(wrapper.attributes('style')).toContain('max-width: 400px')
  })
})
