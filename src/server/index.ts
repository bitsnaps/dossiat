import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { errorHandler } from '@/server/middleware/errorHandler'
import { rateLimiter } from '@/server/middleware/rateLimiter'
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

const app = new Hono()

// Global middleware
app.use('*', cors())
app.use('*', logger())
app.use('*', rateLimiter({ windowMs: 60_000, max: 200 }))
app.onError(errorHandler)

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

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
