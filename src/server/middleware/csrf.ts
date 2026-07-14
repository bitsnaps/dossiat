import type { Context, Next } from 'hono'
import { errorResponse } from '@/server/utils/apiResponse'

/**
 * CSRF protection middleware (defense-in-depth).
 *
 * Dossiat uses stateless Bearer-token auth (no cookies), so classic CSRF
 * is not directly exploitable. This middleware guards against the remaining
 * vector — content-type confusion — by rejecting `text/plain` and
 * `application/x-www-form-urlencoded` request bodies on state-changing
 * methods. JSON API endpoints only accept `application/json` (or no body),
 * which browsers cannot submit cross-origin without a CORS preflight that we
 * control.
 *
 * Safe methods (GET, HEAD, OPTIONS) are always allowed.
 */

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
const BLOCKED_CONTENT_TYPES = ['application/x-www-form-urlencoded', 'text/plain']

export function csrfProtection() {
  return async (c: Context, next: Next) => {
    const method = c.req.method.toUpperCase()

    if (STATE_CHANGING_METHODS.has(method)) {
      const contentType = (c.req.header('content-type') || '').toLowerCase().split(';')[0].trim()

      if (contentType && BLOCKED_CONTENT_TYPES.includes(contentType)) {
        return errorResponse(c, 'Unsupported content type for this endpoint', 415)
      }
    }

    await next()
  }
}
