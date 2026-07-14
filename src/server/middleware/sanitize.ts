import type { Context, Next } from 'hono'
import { errorResponse } from '@/server/utils/apiResponse'

/**
 * Input sanitization middleware (XSS prevention).
 *
 * Strips HTML tags from string values in parsed JSON request bodies before
 * they reach route handlers. Recursively walks objects and arrays. Only
 * processes `application/json` content-type bodies; multipart/form-data
 * uploads are validated separately by the upload validation helper.
 *
 * No third-party dependency — uses a regex-based tag stripper.
 */

/** Matches HTML/XML tags: `<...>` including self-closing and script blocks. */
const HTML_TAG_RE = /<[^>]*>/g

/**
 * Strip HTML tags from a single string.
 * Also neutralizes `javascript:` URIs and event-handler-like fragments.
 */
export function sanitizeString(value: string): string {
  if (typeof value !== 'string') return value
  let out = value.replace(HTML_TAG_RE, '')
  // Neutralize `javascript:` protocol in any remaining text
  out = out.replace(/javascript:/gi, '')
  return out
}

/** Recursively sanitize any value (string, array, object). */
export function sanitizeValue<T>(input: T): T {
  if (typeof input === 'string') return sanitizeString(input) as unknown as T
  if (Array.isArray(input)) return input.map(sanitizeValue) as unknown as T
  if (input !== null && typeof input === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(input as Record<string, unknown>)) {
      result[key] = sanitizeValue(val)
    }
    return result as unknown as T
  }
  return input
}

/**
 * Middleware that sanitizes JSON request bodies in place.
 *
 * Hono caches the parsed body; we read it, sanitize, and write back via
 * `c.req.bodyCache.parsedBody` so downstream `c.req.json()` calls return
 * the sanitized version.
 */
export function sanitizeInput() {
  return async (c: Context, next: Next) => {
    const contentType = c.req.header('content-type') || ''
    if (!contentType.includes('application/json')) {
      await next()
      return
    }

    try {
      const body = await c.req.json()
      const sanitized = sanitizeValue(body)
      // Hono's json() calls #cachedBody("text") which returns bodyCache["text"]
      // (a Promise<string>) then JSON.parse's it. Inject a resolved Promise
      // holding the sanitized JSON string so downstream c.req.json() returns
      // the sanitized object.
      ;(c.req as any).bodyCache = (c.req as any).bodyCache || {}
      ;(c.req as any).bodyCache.text = Promise.resolve(JSON.stringify(sanitized))
    } catch {
      // Invalid JSON — let validateRequest handle the 400
    }

    await next()
  }
}

export { errorResponse }
