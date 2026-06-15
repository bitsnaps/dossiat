import type { Context, Next } from 'hono'
import { errorResponse } from '@/server/utils/apiResponse'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

function getStore(): Map<string, RateLimitEntry> {
  return store
}

export function rateLimiter(options: { windowMs?: number; max?: number } = {}) {
  const windowMs = options.windowMs || 60_000 // 1 minute
  const max = options.max || 100

  return async (c: Context, next: Next) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
    const key = `${ip}:${c.req.path}`
    const now = Date.now()
    const store = getStore()

    let entry = store.get(key)
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs }
      store.set(key, entry)
    }

    entry.count++

    c.header('X-RateLimit-Limit', String(max))
    c.header('X-RateLimit-Remaining', String(Math.max(0, max - entry.count)))
    c.header('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)))

    if (entry.count > max) {
      return errorResponse(c, 'Too many requests', 429)
    }

    await next()
  }
}

export function resetRateLimitStore() {
  store.clear()
}

export function getRateLimitStore() {
  return getStore()
}
