import type { Context } from 'hono'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function successResponse<T>(c: Context, data: T, message?: string, status = 200) {
  const body: ApiResponse<T> = { success: true, data }
  if (message) body.message = message
  return c.json(body, status as never)
}

export function errorResponse(c: Context, error: string, status = 400) {
  const body: ApiResponse = { success: false, error }
  return c.json(body, status as never)
}

export function paginatedResponse<T>(
  c: Context,
  data: T[],
  total: number,
  page: number,
  limit: number,
) {
  const body: ApiResponse<T[]> = {
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
  return c.json(body as never)
}
