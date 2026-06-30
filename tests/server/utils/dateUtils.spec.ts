import { describe, it, expect, vi, afterEach } from 'vitest'
import { calculateNextRun } from '@/server/utils/dateUtils'

describe('calculateNextRun', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('daily', () => {
    it('returns next day with interval 1', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-06-15T10:00:00Z'))
      const result = calculateNextRun('daily', 1)
      expect(result.getDate()).toBe(16)
      expect(result.getMonth()).toBe(5) // June
    })

    it('skips N days with interval > 1', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-06-15T10:00:00Z'))
      const result = calculateNextRun('daily', 3)
      expect(result.getDate()).toBe(18)
    })
  })

  describe('weekly', () => {
    it('returns next occurrence of specific day of week', () => {
      vi.useFakeTimers()
      // Monday June 15, 2026
      vi.setSystemTime(new Date('2026-06-15T10:00:00Z'))
      const result = calculateNextRun('weekly', 1, null, 3) // Wednesday
      expect(result.getDay()).toBe(3)
      expect(result.getDate()).toBe(17)
    })

    it('wraps to next week if target day already passed', () => {
      vi.useFakeTimers()
      // Wednesday June 17, 2026
      vi.setSystemTime(new Date('2026-06-17T10:00:00Z'))
      const result = calculateNextRun('weekly', 1, null, 3) // Wednesday (same day)
      // Should go to next Wednesday
      expect(result.getDay()).toBe(3)
      expect(result.getDate()).toBe(24)
    })

    it('adds interval * 7 days when no dayOfWeek specified', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-06-15T10:00:00Z'))
      const result = calculateNextRun('weekly', 2)
      expect(result.getDate()).toBe(29) // 15 + 14
    })
  })

  describe('monthly', () => {
    it('returns same day next month with interval 1', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-06-15T10:00:00Z'))
      const result = calculateNextRun('monthly', 1, 15)
      expect(result.getMonth()).toBe(6) // July
      expect(result.getDate()).toBe(15)
    })

    it('clamps day to last day of short month (Jan 31 → Feb 28)', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-31T10:00:00Z'))
      const result = calculateNextRun('monthly', 1, 31)
      expect(result.getMonth()).toBe(1) // February
      expect(result.getDate()).toBe(28) // 2026 is not a leap year
    })

    it('clamps day to last day of April (30 days) when day=31', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-31T10:00:00Z'))
      const result = calculateNextRun('monthly', 1, 31)
      expect(result.getMonth()).toBe(3) // April
      expect(result.getDate()).toBe(30)
    })

    it('advances by N months with interval > 1', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-06-15T10:00:00Z'))
      const result = calculateNextRun('monthly', 3, 15)
      expect(result.getMonth()).toBe(8) // September
      expect(result.getDate()).toBe(15)
    })

    it('advances without specific day', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-06-15T10:00:00Z'))
      const result = calculateNextRun('monthly', 1)
      expect(result.getMonth()).toBe(6) // July
    })
  })

  describe('annual', () => {
    it('returns same date next year', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-06-15T10:00:00Z'))
      const result = calculateNextRun('annual', 1)
      expect(result.getFullYear()).toBe(2027)
      expect(result.getMonth()).toBe(5)
      expect(result.getDate()).toBe(15)
    })

    it('advances by N years', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-06-15T10:00:00Z'))
      const result = calculateNextRun('annual', 2)
      expect(result.getFullYear()).toBe(2028)
    })
  })
})
