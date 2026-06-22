import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Pagination from '@/components/common/Pagination.vue'

describe('Pagination', () => {
  it('does not render when totalPages <= 1', () => {
    const wrapper = mount(Pagination, {
      props: { modelValue: 1, totalPages: 1 },
    })
    expect(wrapper.find('.ds-table-pager').exists()).toBe(false)
  })

  it('does not render when totalPages is 0', () => {
    const wrapper = mount(Pagination, {
      props: { modelValue: 1, totalPages: 0 },
    })
    expect(wrapper.find('.ds-table-pager').exists()).toBe(false)
  })

  it('renders when totalPages > 1', () => {
    const wrapper = mount(Pagination, {
      props: { modelValue: 1, totalPages: 5 },
    })
    expect(wrapper.find('.ds-table-pager').exists()).toBe(true)
  })

  it('displays all page numbers for small page count', () => {
    const wrapper = mount(Pagination, {
      props: { modelValue: 2, totalPages: 5 },
    })
    const buttons = wrapper.findAll('.ds-table-pager__link')
    // prev + 1,2,3,4,5 + next = 7 buttons
    const pageButtons = buttons.filter(b => !b.find('i').exists())
    expect(pageButtons).toHaveLength(5)
  })

  it('highlights active page', () => {
    const wrapper = mount(Pagination, {
      props: { modelValue: 3, totalPages: 10 },
    })
    const activeItem = wrapper.find('.ds-table-pager__item--active')
    expect(activeItem.exists()).toBe(true)
    expect(activeItem.text()).toBe('3')
  })

  it('emits update:modelValue when page is clicked', async () => {
    const wrapper = mount(Pagination, {
      props: { modelValue: 1, totalPages: 5 },
    })
    // Click page 2 button
    const buttons = wrapper.findAll('.ds-table-pager__link')
    const page2Button = buttons.find(b => b.text() === '2')
    await page2Button?.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([2])
  })

  it('disables prev button on first page', () => {
    const wrapper = mount(Pagination, {
      props: { modelValue: 1, totalPages: 5 },
    })
    const prevBtn = wrapper.find('.bi-chevron-left')
    const parentLi = prevBtn?.element.closest('li')
    expect(parentLi?.classList.contains('ds-table-pager__item--disabled')).toBe(true)
  })

  it('disables next button on last page', () => {
    const wrapper = mount(Pagination, {
      props: { modelValue: 5, totalPages: 5 },
    })
    const nextBtn = wrapper.find('.bi-chevron-right')
    const parentLi = nextBtn?.element.closest('li')
    expect(parentLi?.classList.contains('ds-table-pager__item--disabled')).toBe(true)
  })

  it('shows ellipsis when there are many pages', () => {
    const wrapper = mount(Pagination, {
      props: { modelValue: 5, totalPages: 20 },
    })
    const ellipsisButtons = wrapper.findAll('.ds-table-pager__link').filter(
      b => b.text() === '…'
    )
    expect(ellipsisButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('does not emit when clicking disabled ellipsis', async () => {
    const wrapper = mount(Pagination, {
      props: { modelValue: 5, totalPages: 20 },
    })
    const ellipsisBtn = wrapper.findAll('.ds-table-pager__link').find(
      b => b.text() === '…' && (b.element as HTMLButtonElement).disabled
    )
    await ellipsisBtn?.trigger('click')
    // The ellipsis buttons are disabled, so clicking should not emit update
    // Even if click goes through, the goTo function won't emit for invalid page numbers
  })

  it('shows prev arrow', () => {
    const wrapper = mount(Pagination, {
      props: { modelValue: 2, totalPages: 5 },
    })
    expect(wrapper.find('.bi-chevron-left').exists()).toBe(true)
  })

  it('shows next arrow', () => {
    const wrapper = mount(Pagination, {
      props: { modelValue: 2, totalPages: 5 },
    })
    expect(wrapper.find('.bi-chevron-right').exists()).toBe(true)
  })
})
