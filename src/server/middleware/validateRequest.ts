import type { Context, Next } from 'hono'
import { errorResponse } from '@/server/utils/apiResponse'

export interface ValidationSchema {
  body?: Record<string, (value: any) => string | null>
  query?: Record<string, (value: any) => string | null>
  params?: Record<string, (value: any) => string | null>
}

export function validateRequest(schema: ValidationSchema) {
  return async (c: Context, next: Next) => {
    const errors: string[] = []

    if (schema.body) {
      let body: any
      try {
        body = await c.req.json()
      } catch {
        return errorResponse(c, 'Invalid JSON body', 400)
      }
      for (const [field, validator] of Object.entries(schema.body)) {
        const error = validator(body[field])
        if (error) errors.push(`${field}: ${error}`)
      }
    }

    if (schema.query) {
      const url = new URL(c.req.url)
      for (const [field, validator] of Object.entries(schema.query)) {
        const error = validator(url.searchParams.get(field))
        if (error) errors.push(`${field}: ${error}`)
      }
    }

    if (schema.params) {
      const params = c.req.param()
      for (const [field, validator] of Object.entries(schema.params)) {
        const error = validator(params[field])
        if (error) errors.push(`${field}: ${error}`)
      }
    }

    if (errors.length > 0) {
      return errorResponse(c, errors.join(', '), 422)
    }

    await next()
  }
}

export const validators = {
  required: (msg?: string) => (value: any) => {
    if (value === undefined || value === null || value === '') return msg || 'is required'
    return null
  },
  email: (msg?: string) => (value: any) => {
    if (!value) return null
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(value) ? null : (msg || 'must be a valid email')
  },
  minLength: (min: number, msg?: string) => (value: any) => {
    if (!value) return null
    return value.length >= min ? null : (msg || `must be at least ${min} characters`)
  },
  maxLength: (max: number, msg?: string) => (value: any) => {
    if (!value) return null
    return value.length <= max ? null : (msg || `must be at most ${max} characters`)
  },
  isIn: (allowed: any[], msg?: string) => (value: any) => {
    if (value === undefined || value === null) return null
    return allowed.includes(value) ? null : (msg || `must be one of: ${allowed.join(', ')}`)
  },
  isNumber: (msg?: string) => (value: any) => {
    if (value === undefined || value === null) return null
    return !isNaN(Number(value)) ? null : (msg || 'must be a number')
  },
  isBoolean: (msg?: string) => (value: any) => {
    if (value === undefined || value === null) return null
    return typeof value === 'boolean' ? null : (msg || 'must be a boolean')
  },
}
