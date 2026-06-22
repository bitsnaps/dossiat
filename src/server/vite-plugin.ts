import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'
import { Hono } from 'hono'

/**
 * Vite plugin that serves the Hono API server as middleware.
 * This allows running both frontend and backend with a single `pnpm dev` command.
 */
export function honoDevPlugin(): Plugin {
  let cachedApp: Hono | null = null

  return {
    name: 'vite-plugin-hono-api',

    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url?.startsWith('/api')) {
          return next()
        }

        try {
          // Use Vite's SSR loader to resolve @/ path aliases
          const mod = await server.ssrLoadModule('./src/server/index.ts')
          cachedApp = mod.default || mod

          // Convert Node.js IncomingMessage to Web Request for Hono
          const protocol = req.headers['x-forwarded-proto'] || 'http'
          const host = req.headers.host || 'localhost'
          const url = `${protocol}://${host}${req.url}`

          const headers = new Headers()
          for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === 'string') {
              headers.set(key, value)
            } else if (Array.isArray(value)) {
              headers.set(key, value.join(', '))
            }
          }

          const isBodyAllowed = req.method !== 'GET' && req.method !== 'HEAD'
          let body: BodyInit | undefined

          if (isBodyAllowed && req.readable) {
            const chunks: Buffer[] = []
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
            }
            body = Buffer.concat(chunks)
          }

          const webReq = new Request(url, {
            method: req.method ?? 'GET',
            headers,
            body,
          })

          const webRes = await cachedApp!.fetch(webReq)

          // Send response back through Node.js
          res.statusCode = webRes.status
          webRes.headers.forEach((value, key) => {
            res.setHeader(key, value)
          })

          const resBody = await webRes.arrayBuffer()
          res.end(Buffer.from(resBody))
        } catch (err) {
          console.error('API error:', err)
          next()
        }
      })
    },
  }
}
