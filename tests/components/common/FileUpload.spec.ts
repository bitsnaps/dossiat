import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FileUpload from '@/components/common/FileUpload.vue'

describe('FileUpload', () => {
  it('renders upload zone', () => {
    const wrapper = mount(FileUpload)
    expect(wrapper.find('.ds-file-upload').exists()).toBe(true)
  })

  it('renders default content with icon', () => {
    const wrapper = mount(FileUpload)
    expect(wrapper.find('.bi-cloud-arrow-up').exists()).toBe(true)
  })

  it('renders default upload text', () => {
    const wrapper = mount(FileUpload)
    expect(wrapper.text()).toContain('Click or drag to upload')
  })

  it('renders accepted file types', () => {
    const wrapper = mount(FileUpload)
    expect(wrapper.text()).toContain('.pdf,.doc,.docx,.jpg,.jpeg,.png')
  })

  it('renders custom accept types', () => {
    const wrapper = mount(FileUpload, {
      props: { accept: '.pdf,.csv' },
    })
    expect(wrapper.text()).toContain('.pdf,.csv')
  })

  it('hides upload content when loading', () => {
    const wrapper = mount(FileUpload, { props: { loading: true } })
    expect(wrapper.find('.bi-cloud-arrow-up').exists()).toBe(false)
    expect(wrapper.find('.ds-file-upload__uploading').exists()).toBe(true)
  })

  it('emits error when file exceeds max size', async () => {
    const wrapper = mount(FileUpload, {
      props: { maxSize: 100 }, // 100 bytes
    })
    const input = wrapper.find('input[type="file"]')
    const largeFile = new File(['x'.repeat(200)], 'large.pdf', { type: 'application/pdf' })
    Object.defineProperty(input.element, 'files', {
      value: [largeFile],
      writable: false,
    })
    await input.trigger('change')
    expect(wrapper.emitted('error')).toBeTruthy()
    expect(wrapper.emitted('error')![0][0]).toContain('File too large')
  })

  it('emits upload:file for valid file', async () => {
    const wrapper = mount(FileUpload, {
      props: { maxSize: 1024 * 1024 },
    })
    const input = wrapper.find('input[type="file"]')
    const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' })
    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: false,
    })
    await input.trigger('change')
    expect(wrapper.emitted('upload:file')).toBeTruthy()
    expect(wrapper.emitted('upload:file')![0]).toEqual([file])
  })

  it('has hidden file input with correct accept', () => {
    const wrapper = mount(FileUpload, {
      props: { accept: '.png' },
    })
    const input = wrapper.find('input[type="file"]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('accept')).toBe('.png')
  })

  it('renders slot content to override default', () => {
    const wrapper = mount(FileUpload, {
      slots: { default: '<span class="custom">Drop here</span>' },
    })
    expect(wrapper.find('.custom').exists()).toBe(true)
    expect(wrapper.text()).toContain('Drop here')
  })
})
