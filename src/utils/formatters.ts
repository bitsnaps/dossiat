/**
 * Shared pure utility functions for formatting dates, currencies, and file sizes.
 */

/**
 * Format a date string to a readable date (e.g. "Jun 30, 2026").
 * Returns the fallback (default "—") when the input is null/undefined.
 */
export function formatDate(dateStr: string | null | undefined, fallback = '—'): string {
  if (!dateStr) return fallback
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format a date string to a readable date+time (e.g. "Jun 30, 2026, 10:00 AM").
 * Returns the fallback (default "—") when the input is null/undefined.
 */
export function formatDateTime(dateStr: string | null | undefined, fallback = '—'): string {
  if (!dateStr) return fallback
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format a date string to a relative time description (e.g. "5m ago", "3h ago").
 * Returns the fallback (default "") when the input is null/undefined.
 */
export function formatRelativeTime(dateStr: string | null | undefined, fallback = ''): string {
  if (!dateStr) return fallback
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

/**
 * Format a number as a currency string using Intl.NumberFormat.
 * Falls back to a simple concatenation when the currency code is invalid.
 */
export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount}`
  }
}

/**
 * Format a file size in bytes to a human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
