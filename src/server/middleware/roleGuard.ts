import type { Context, Next } from 'hono'
import { errorResponse } from '@/server/utils/apiResponse'
import type { AuthPayload } from './auth'

export function roleGuard(...roles: AuthPayload['role'][]) {
  return async (c: Context, next: Next) => {
    const auth = c.get('auth')
    if (!auth) {
      return errorResponse(c, 'Authentication required', 401)
    }
    if (!roles.includes(auth.role)) {
      return errorResponse(c, 'Insufficient permissions', 403)
    }
    await next()
  }
}

export function agentOnly() {
  return roleGuard('agent')
}

export function clientOnly() {
  return roleGuard('client')
}

export function adminOnly() {
  return roleGuard('admin')
}
