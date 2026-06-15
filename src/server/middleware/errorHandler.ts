import type { Context } from 'hono'
import { errorResponse } from '@/server/utils/apiResponse'

export class AppError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'AppError'
    this.status = status
  }
}

export function errorHandler(err: Error, c: Context) {
  const status = (err as any).status || 500
  const message = status === 500 ? 'Internal server error' : err.message
  return errorResponse(c, message, status)
}
