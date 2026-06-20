import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useToast } from '@/composables/useToast'

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    const { clearAll } = useToast()
    clearAll()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('addToast()', () => {
    it('adds a toast with auto-generated id', () => {
      const { toasts, addToast } = useToast()
      addToast({ variant: 'success', message: 'Saved!' })
      expect(toasts.value).toHaveLength(1)
      expect(toasts.value[0].message).toBe('Saved!')
      expect(toasts.value[0].variant).toBe('success')
      expect(toasts.value[0].id).toBeTypeOf('number')
    })

    it('returns the toast id', () => {
      const { addToast } = useToast()
      const id = addToast({ variant: 'info', message: 'Test' })
      expect(id).toBeTypeOf('number')
    })

    it('generates unique ids for consecutive toasts', () => {
      const { addToast } = useToast()
      const id1 = addToast({ variant: 'info', message: 'First' })
      const id2 = addToast({ variant: 'info', message: 'Second' })
      expect(id1).not.toBe(id2)
    })
  })

  describe('removeToast()', () => {
    it('removes a toast by id', () => {
      const { toasts, addToast, removeToast } = useToast()
      const id = addToast({ variant: 'info', message: 'Test' })
      expect(toasts.value).toHaveLength(1)
      removeToast(id)
      expect(toasts.value).toHaveLength(0)
    })

    it('does nothing for non-existent id', () => {
      const { toasts, addToast, removeToast } = useToast()
      addToast({ variant: 'info', message: 'Test' })
      removeToast(9999)
      expect(toasts.value).toHaveLength(1)
    })
  })

  describe('convenience methods', () => {
    it('success() adds toast with variant success', () => {
      const { toasts, success } = useToast()
      success('Done!')
      expect(toasts.value[0].variant).toBe('success')
      expect(toasts.value[0].message).toBe('Done!')
    })

    it('error() adds toast with variant danger', () => {
      const { toasts, error } = useToast()
      error('Failed!')
      expect(toasts.value[0].variant).toBe('danger')
      expect(toasts.value[0].message).toBe('Failed!')
    })

    it('warning() adds toast with variant warning', () => {
      const { toasts, warning } = useToast()
      warning('Caution!')
      expect(toasts.value[0].variant).toBe('warning')
      expect(toasts.value[0].message).toBe('Caution!')
    })

    it('info() adds toast with variant info', () => {
      const { toasts, info } = useToast()
      info('FYI')
      expect(toasts.value[0].variant).toBe('info')
      expect(toasts.value[0].message).toBe('FYI')
    })

    it('convenience methods accept optional title', () => {
      const { toasts, success } = useToast()
      success('Done!', { title: 'Success' })
      expect(toasts.value[0].title).toBe('Success')
    })
  })

  describe('auto-dismiss', () => {
    it('removes toast after default duration (5000ms)', () => {
      const { toasts, addToast } = useToast()
      addToast({ variant: 'info', message: 'Test' })
      expect(toasts.value).toHaveLength(1)

      vi.advanceTimersByTime(5000)
      expect(toasts.value).toHaveLength(0)
    })

    it('removes toast after custom duration', () => {
      const { toasts, addToast } = useToast()
      addToast({ variant: 'info', message: 'Test', duration: 2000 })
      expect(toasts.value).toHaveLength(1)

      vi.advanceTimersByTime(1999)
      expect(toasts.value).toHaveLength(1)

      vi.advanceTimersByTime(1)
      expect(toasts.value).toHaveLength(0)
    })

    it('does not auto-dismiss when duration is 0', () => {
      const { toasts, addToast } = useToast()
      addToast({ variant: 'info', message: 'Persistent', duration: 0 })

      vi.advanceTimersByTime(10000)
      expect(toasts.value).toHaveLength(1)
    })
  })
})
