import { secureHeaders } from 'hono/secure-headers'

/**
 * Secure HTTP headers middleware.
 *
 * Wraps Hono's built-in `secureHeaders` which sets:
 *  - X-Content-Type-Options: nosniff
 *  - X-Frame-Options: DENY
 *  - Cross-Origin-Opener-Policy / Cross-Origin-Embedder-Policy
 *  - Referrer-Policy: strict-origin-when-cross-origin
 *
 * No new third-party dependency — ships with Hono.
 */
export { secureHeaders }
