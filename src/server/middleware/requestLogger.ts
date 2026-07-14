import type { Context, Next } from 'hono'

/**
 * Structured request logger middleware.
 *
 * Emits one JSON line per request with method, path, status, latency (ms),
 * client IP, and ISO timestamp. Replaces Hono's default `logger()` for
 * production-grade structured logging suitable for log aggregation.
 *
 * Errors are logged by the global error handler; this middleware logs the
 * final response status regardless of success/failure.
 */

export interface RequestLogEntry {
  level: 'info' | 'warn' | 'error'
  method: string
  path: string
  status: number
  ms: number
  ip: string
  ts: string
}

function getClientIp(c: Context): string {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown'
  )
}

export function requestLogger() {
  return async (c: Context, next: Next) => {
    const start = Date.now()
    await next()
    const ms = Date.now() - start
    const status = c.res.status

    const entry: RequestLogEntry = {
      level: status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info',
      method: c.req.method,
      path: c.req.path,
      status,
      ms,
      ip: getClientIp(c),
      ts: new Date().toISOString(),
    }

    const line = JSON.stringify(entry)
    if (entry.level === 'error') {
      console.error(line)
    } else if (entry.level === 'warn') {
      console.warn(line)
    } else {
      console.log(line)
    }
  }
}

/**
 * Structured error logger — used by the global error handler.
 */
export function logError(err: Error, status: number, c: Context): void {
  const entry = {
    level: 'error' as const,
    message: err.message,
    name: err.name,
    status,
    stack: err.stack,
    method: c.req.method,
    path: c.req.path,
    ip: getClientIp(c),
    ts: new Date().toISOString(),
  }
  console.error(JSON.stringify(entry))
}
