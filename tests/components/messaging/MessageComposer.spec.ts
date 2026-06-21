import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import MessageComposer from '@/components/messaging/MessageComposer.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      messages: {
        composerPlaceholder: 'Type a message...',
        send: 'Send',
      },
    },
  },
})

function createWrapper(props: Record<string, any> = {}) {
  return mount(MessageComposer, {
    props: {
      disabled: false,
      ...props,
    },
    global: { plugins: [i18n] },
  })
}

describe('MessageComposer', () => {
  it('renders the composer', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.ds-message-composer').exists()).toBe(true)
  })

  it('renders textarea input', () => {
    const wrapper = createWrapper()
    const textarea = wrapper.find('.ds-message-composer__input')
    expect(textarea.exists()).toBe(true)
  })

  it('shows placeholder text', () => {
    const wrapper = createWrapper()
    const textarea = wrapper.find('.ds-message-composer__input')
    expect((textarea.element as HTMLTextAreaElement).placeholder).toContain('message')
  })

  it('renders send button', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.ds-message-composer__send').exists()).toBe(true)
  })

  it('emits send event with content', async () => {
    const wrapper = createWrapper()
    const textarea = wrapper.find('.ds-message-composer__input')
    await textarea.setValue('Hello world')

    const sendBtn = wrapper.find('.ds-message-composer__send')
    await sendBtn.trigger('click')

    const emitted = wrapper.emitted('send')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toBe('Hello world')
  })

  it('clears input after sending', async () => {
    const wrapper = createWrapper()
    const textarea = wrapper.find('.ds-message-composer__input')
    await textarea.setValue('Hello world')

    const sendBtn = wrapper.find('.ds-message-composer__send')
    await sendBtn.trigger('click')

    await wrapper.vm.$nextTick()
    expect((textarea.element as HTMLTextAreaElement).value).toBe('')
  })

  it('does not emit send when input is empty', async () => {
    const wrapper = createWrapper()
    const sendBtn = wrapper.find('.ds-message-composer__send')
    await sendBtn.trigger('click')
    expect(wrapper.emitted('send')).toBeFalsy()
  })

  it('does not emit send when input is whitespace only', async () => {
    const wrapper = createWrapper()
    const textarea = wrapper.find('.ds-message-composer__input')
    await textarea.setValue('   ')

    const sendBtn = wrapper.find('.ds-message-composer__send')
    await sendBtn.trigger('click')
    expect(wrapper.emitted('send')).toBeFalsy()
  })

  it('disables input when disabled prop is true', () => {
    const wrapper = createWrapper({ disabled: true })
    const textarea = wrapper.find('.ds-message-composer__input')
    expect((textarea.element as HTMLTextAreaElement).disabled).toBe(true)
  })

  it('disables send button when disabled', () => {
    const wrapper = createWrapper({ disabled: true })
    const sendBtn = wrapper.find('.ds-message-composer__send')
    expect((sendBtn.element as HTMLButtonElement).disabled).toBe(true)
  })
})
