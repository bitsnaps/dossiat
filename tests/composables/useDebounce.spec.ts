import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { useDebounce } from '@/composables/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('default state', () => {
    it('immediateValue starts as empty string', () => {
      const { immediateValue } = useDebounce()
      expect(immediateValue.value).toBe('')
    })

    it('debouncedValue starts as empty string', () => {
      const { debouncedValue } = useDebounce()
      expect(debouncedValue.value).toBe('')
    })
  })

  describe('custom initial value', () => {
    it('accepts custom initial value for both refs', () => {
      const { immediateValue, debouncedValue } = useDebounce({ initialValue: 'hello' })
      expect(immediateValue.value).toBe('hello')
      expect(debouncedValue.value).toBe('hello')
    })
  })

  describe('update()', () => {
    it('immediateValue updates instantly', () => {
      const { immediateValue, update } = useDebounce()
      update('search term')
      expect(immediateValue.value).toBe('search term')
    })

    it('debouncedValue updates after delay', () => {
      const { debouncedValue, update } = useDebounce({ delay: 300 })
      update('search term')
      expect(debouncedValue.value).toBe('')

      vi.advanceTimersByTime(300)
      expect(debouncedValue.value).toBe('search term')
    })

    it('uses default 300ms delay', () => {
      const { debouncedValue, update } = useDebounce()
      update('test')
      vi.advanceTimersByTime(299)
      expect(debouncedValue.value).toBe('')
      vi.advanceTimersByTime(1)
      expect(debouncedValue.value).toBe('test')
    })

    it('accepts custom delay', () => {
      const { debouncedValue, update } = useDebounce({ delay: 500 })
      update('test')
      vi.advanceTimersByTime(499)
      expect(debouncedValue.value).toBe('')
      vi.advanceTimersByTime(1)
      expect(debouncedValue.value).toBe('test')
    })
  })

  describe('rapid updates', () => {
    it('collapses rapid updates into single debounced value', () => {
      const { debouncedValue, update } = useDebounce({ delay: 300 })
      update('first')
      vi.advanceTimersByTime(100)
      update('second')
      vi.advanceTimersByTime(100)
      update('third')
      vi.advanceTimersByTime(300)
      expect(debouncedValue.value).toBe('third')
    })
  })
})
