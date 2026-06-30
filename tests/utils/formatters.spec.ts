import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatDate, formatDateTime, formatRelativeTime, formatCurrency, formatFileSize } from '@/utils/formatters'

describe('formatDate', () => {
  it('returns fallback for null', () => {
    expect(formatDate(null)).toBe('—')
  })

  it('returns fallback for undefined', () => {
    expect(formatDate(undefined)).toBe('—')
  })

  it('returns custom fallback when provided', () => {
    expect(formatDate(null, 'N/A')).toBe('N/A')
  })

  it('formats a valid ISO date string', () => {
    const result = formatDate('2026-01-15T00:00:00Z')
    // Should contain month, day, year — format varies by locale
    expect(result).toMatch(/\d{1,2}/)
    expect(result).toContain('2026')
  })

  it('formats a valid date string with time component', () => {
    const result = formatDate('2026-06-30T14:30:00Z')
    expect(result).toContain('2026')
    // Date-only format should not include time components
    expect(result).not.toMatch(/\d{1,2}:\d{2}/)
  })

  it('returns fallback for empty string', () => {
    expect(formatDate('')).toBe('—')
  })
})

describe('formatDateTime', () => {
  it('returns fallback for null', () => {
    expect(formatDateTime(null)).toBe('—')
  })

  it('returns fallback for undefined', () => {
    expect(formatDateTime(undefined)).toBe('—')
  })

  it('returns custom fallback when provided', () => {
    expect(formatDateTime(null, 'No date')).toBe('No date')
  })

  it('formats a valid ISO date string with time', () => {
    const result = formatDateTime('2026-01-15T10:30:00Z')
    expect(result).toContain('2026')
    // DateTime format should include time
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })

  it('returns fallback for empty string', () => {
    expect(formatDateTime('')).toBe('—')
  })
})

describe('formatRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns fallback for null', () => {
    expect(formatRelativeTime(null)).toBe('')
  })

  it('returns fallback for undefined', () => {
    expect(formatRelativeTime(undefined)).toBe('')
  })

  it('returns custom fallback when provided', () => {
    expect(formatRelativeTime(null, 'unknown')).toBe('unknown')
  })

  it('returns "just now" for very recent timestamps', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-30T12:00:00Z'))
    expect(formatRelativeTime('2026-06-30T11:59:55Z')).toBe('just now')
  })

  it('returns minutes ago for timestamps within the last hour', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-30T12:00:00Z'))
    expect(formatRelativeTime('2026-06-30T11:55:00Z')).toBe('5m ago')
  })

  it('returns hours ago for timestamps within the last day', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-30T12:00:00Z'))
    expect(formatRelativeTime('2026-06-30T09:00:00Z')).toBe('3h ago')
  })

  it('returns days ago for timestamps older than a day', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-30T12:00:00Z'))
    expect(formatRelativeTime('2026-06-28T12:00:00Z')).toBe('2d ago')
  })

  it('returns fallback for empty string', () => {
    expect(formatRelativeTime('')).toBe('')
  })
})

describe('formatCurrency', () => {
  it('formats USD amount', () => {
    const result = formatCurrency(100, 'USD')
    expect(result).toContain('100')
  })

  it('formats EUR amount', () => {
    const result = formatCurrency(50.5, 'EUR')
    expect(result).toContain('50')
  })

  it('formats zero amount', () => {
    const result = formatCurrency(0, 'USD')
    expect(result).toContain('0')
  })

  it('formats negative amount', () => {
    const result = formatCurrency(-25, 'USD')
    expect(result).toContain('25')
  })

  it('formats large amounts', () => {
    const result = formatCurrency(10000, 'USD')
    expect(result).toContain('10')
  })

  it('formats decimal amounts', () => {
    const result = formatCurrency(99.99, 'USD')
    expect(result).toContain('99')
  })

  it('falls back for invalid currency code', () => {
    // Intl.NumberFormat throws RangeError for truly invalid codes
    // Some codes may not throw but produce odd results, so we test the catch path
    try {
      new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INVALID' }).format(100)
      // If it didn't throw, the function still works — just verify it returns something
      const result = formatCurrency(100, 'INVALID')
      expect(typeof result).toBe('string')
    } catch {
      const result = formatCurrency(100, 'INVALID')
      expect(result).toBe('INVALID 100')
    }
  })
})

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 B')
  })

  it('formats exactly 1024 bytes as KB', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB')
  })

  it('formats kilobytes', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB')
  })

  it('formats exactly 1 MB', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB')
  })

  it('formats megabytes', () => {
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB')
  })

  it('formats zero bytes', () => {
    expect(formatFileSize(0)).toBe('0 B')
  })

  it('formats 1 byte', () => {
    expect(formatFileSize(1)).toBe('1 B')
  })
})
