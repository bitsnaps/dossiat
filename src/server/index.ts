import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { errorHandler } from '@/server/middleware/errorHandler'
import { rateLimiter } from '@/server/middleware/rateLimiter'
import { secureHeaders } from '@/server/middleware/secureHeaders'
import { sanitizeInput } from '@/server/middleware/sanitize'
import { csrfProtection } from '@/server/middleware/csrf'
import { requestLogger } from '@/server/middleware/requestLogger'
import authRoutes from '@/server/routes/auth'
import userRoutes from '@/server/routes/users'
import missionRoutes from '@/server/routes/missions'
import messageRoutes from '@/server/routes/messages'
import paymentRoutes from '@/server/routes/payments'
import stripeRoutes from '@/server/routes/stripe'
import paypalRoutes from '@/server/routes/paypal'
import subscriptionRoutes from '@/server/routes/subscriptions'
import disputeRoutes from '@/server/routes/disputes'
import notificationRoutes from '@/server/routes/notifications'
import adminRoutes from '@/server/routes/admin'
import recurrenceRoutes from '@/server/routes/recurrence'
import sequelize from '@/server/database/config/database'

const app = new Hono()

// Global middleware (order matters)
app.use('*', cors())
app.use('*', secureHeaders())
app.use('*', requestLogger())
app.use('*', rateLimiter({ windowMs: 60_000, max: 200 }))
app.use('*', csrfProtection())
app.use('*', sanitizeInput())
app.onError(errorHandler)

// Health check — pings the database and reports uptime
app.get('/api/health', async (c) => {
  try {
    await sequelize.authenticate()
    return c.json({
      status: 'ok',
      db: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    })
  } catch {
    return c.json(
      { status: 'degraded', db: 'disconnected', timestamp: new Date().toISOString() },
      503 as never,
    )
  }
})

// Routes
app.route('/api/auth', authRoutes)
app.route('/api/users', userRoutes)
app.route('/api/missions', missionRoutes)
app.route('/api', messageRoutes)
app.route('/api', paymentRoutes)
app.route('/api/payments/stripe', stripeRoutes)
app.route('/api/payments/paypal', paypalRoutes)
app.route('/api/subscriptions', subscriptionRoutes)
app.route('/api/disputes', disputeRoutes)
app.route('/api/notifications', notificationRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api', recurrenceRoutes)

export default app
