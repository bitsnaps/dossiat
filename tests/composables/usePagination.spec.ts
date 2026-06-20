import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { usePagination } from '@/composables/usePagination'

describe('usePagination', () => {
  describe('default state', () => {
    it('defaults to page 1', () => {
      const { page } = usePagination()
      expect(page.value).toBe(1)
    })

    it('defaults to 20 items per page', () => {
      const { perPage } = usePagination()
      expect(perPage.value).toBe(20)
    })

    it('defaults total to 0', () => {
      const { total } = usePagination()
      expect(total.value).toBe(0)
    })

    it('totalPages is 0 when total is 0', () => {
      const { totalPages } = usePagination()
      expect(totalPages.value).toBe(0)
    })
  })

  describe('custom initial values', () => {
    it('accepts custom initial page', () => {
      const { page } = usePagination({ initialPage: 3 })
      expect(page.value).toBe(3)
    })

    it('accepts custom initial perPage', () => {
      const { perPage } = usePagination({ initialPerPage: 10 })
      expect(perPage.value).toBe(10)
    })
  })

  describe('totalPages computed', () => {
    it('calculates totalPages correctly', () => {
      const { total, perPage, totalPages } = usePagination()
      total.value = 55
      perPage.value = 20
      expect(totalPages.value).toBe(3)
    })

    it('rounds up fractional pages', () => {
      const { total, perPage, totalPages } = usePagination()
      total.value = 41
      perPage.value = 20
      expect(totalPages.value).toBe(3)
    })

    it('is exact when total is divisible by perPage', () => {
      const { total, perPage, totalPages } = usePagination()
      total.value = 60
      perPage.value = 20
      expect(totalPages.value).toBe(3)
    })
  })

  describe('hasNext / hasPrev computed', () => {
    it('hasNext is false when on last page', () => {
      const { page, total, perPage, hasNext } = usePagination()
      page.value = 3
      total.value = 55
      perPage.value = 20
      expect(hasNext.value).toBe(false)
    })

    it('hasNext is true when not on last page', () => {
      const { page, total, perPage, hasNext } = usePagination()
      page.value = 1
      total.value = 55
      perPage.value = 20
      expect(hasNext.value).toBe(true)
    })

    it('hasPrev is false when on page 1', () => {
      const { hasPrev } = usePagination()
      expect(hasPrev.value).toBe(false)
    })

    it('hasPrev is true when page > 1', () => {
      const { page, hasPrev } = usePagination()
      page.value = 2
      expect(hasPrev.value).toBe(true)
    })
  })

  describe('next()', () => {
    it('increments page by 1', () => {
      const { page, total, next } = usePagination()
      total.value = 40
      expect(page.value).toBe(1)
      next()
      expect(page.value).toBe(2)
    })

    it('does not increment past totalPages', () => {
      const { page, total, perPage, next } = usePagination()
      total.value = 40
      perPage.value = 20
      page.value = 2
      next()
      expect(page.value).toBe(2)
    })
  })

  describe('prev()', () => {
    it('decrements page by 1', () => {
      const { page, prev } = usePagination()
      page.value = 3
      prev()
      expect(page.value).toBe(2)
    })

    it('does not decrement below 1', () => {
      const { page, prev } = usePagination()
      page.value = 1
      prev()
      expect(page.value).toBe(1)
    })
  })

  describe('goTo()', () => {
    it('sets page to specified value', () => {
      const { page, goTo } = usePagination()
      goTo(5)
      expect(page.value).toBe(5)
    })

    it('clamps to valid range (min 1)', () => {
      const { page, goTo } = usePagination()
      goTo(0)
      expect(page.value).toBe(1)
    })

    it('clamps to valid range (max totalPages)', () => {
      const { page, total, perPage, goTo } = usePagination()
      total.value = 40
      perPage.value = 20
      goTo(100)
      expect(page.value).toBe(2)
    })
  })

  describe('reset()', () => {
    it('resets page to 1', () => {
      const { page, reset } = usePagination()
      page.value = 5
      reset()
      expect(page.value).toBe(1)
    })
  })

  describe('reactive total change', () => {
    it('updates totalPages when total changes', async () => {
      const t = ref(0)
      const { total, perPage, totalPages } = usePagination()
      total.value = t.value

      t.value = 100
      total.value = t.value
      await nextTick()

      expect(totalPages.value).toBe(5)
    })
  })
})
