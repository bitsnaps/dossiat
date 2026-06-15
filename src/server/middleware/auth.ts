import type { Context, Next } from 'hono'
import { jwtVerify } from 'jose'
import { errorResponse } from '@/server/utils/apiResponse'

export interface AuthPayload {
  userId: number
  email: string
  role: 'agent' | 'client' | 'admin'
}

declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthPayload
  }
}

export function authenticate() {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret')

  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(c, 'Missing or invalid authorization header', 401)
    }

    const token = authHeader.slice(7)
    try {
      const { payload } = await jwtVerify(token, secret)
      c.set('auth', {
        userId: payload.userId as number,
        email: payload.email as string,
        role: payload.role as 'agent' | 'client' | 'admin',
      })
      await next()
    } catch {
      return errorResponse(c, 'Invalid or expired token', 401)
    }
  }
}

export function optionalAuth() {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret')

  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      await next()
      return
    }

    const token = authHeader.slice(7)
    try {
      const { payload } = await jwtVerify(token, secret)
      c.set('auth', {
        userId: payload.userId as number,
        email: payload.email as string,
        role: payload.role as 'agent' | 'client' | 'admin',
      })
    } catch {
      // Ignore invalid tokens for optional auth
    }
    await next()
  }
}
