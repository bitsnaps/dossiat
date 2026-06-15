import type { Context } from '@netlify/functions'
import app from '@/server/index'

export default async (context: Context) => {
  const url = new URL(context.request.url)
  const req = new Request(url.toString(), {
    method: context.request.method,
    headers: Object.fromEntries(context.request.headers.entries()),
    body: context.request.method !== 'GET' && context.request.method !== 'HEAD'
      ? await context.request.text()
      : undefined,
  })

  return app.fetch(req)
}

export const config = {
  path: '/api/*',
}
