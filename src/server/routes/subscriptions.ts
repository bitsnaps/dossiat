import { Hono } from 'hono'
import { SubscriptionPlan, Subscription, SubscriptionInvoice, ClientProfile } from '@/server/database/models'
import { successResponse } from '@/server/utils/apiResponse'
import { authenticate } from '@/server/middleware/auth'
import { roleGuard } from '@/server/middleware/roleGuard'
import { validateRequest, validators } from '@/server/middleware/validateRequest'
import { AppError } from '@/server/middleware/errorHandler'

const subscriptions = new Hono()

// GET /api/subscriptions/plans
subscriptions.get('/plans', async (c) => {
  const plans = await SubscriptionPlan.findAll({ where: { isActive: true } })
  return successResponse(c, plans)
})

// POST /api/subscriptions
subscriptions.post('/',
  authenticate(),
  roleGuard('client'),
  validateRequest({ body: { planId: validators.required() } }),
  async (c) => {
    const auth = c.get('auth')
    const { planId } = await c.req.json()

    const plan = await SubscriptionPlan.findByPk(planId)
    if (!plan) throw new AppError('Plan not found', 404)

    const clientProfile = await ClientProfile.findOne({ where: { userId: auth.userId } })
    if (!clientProfile) throw new AppError('Client profile not found', 404)

    const existing = await Subscription.findOne({
      where: { clientId: clientProfile.id, status: 'active' },
    })
    if (existing) throw new AppError('Already subscribed to a plan', 400)

    const now = new Date()
    const periodEnd = new Date(now)
    if (plan.interval === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    }

    const subscription = await Subscription.create({
      clientId: clientProfile.id,
      planId,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    })

    return successResponse(c, subscription, 'Subscription created', 201)
  }
)

// GET /api/subscriptions/me
subscriptions.get('/me', authenticate(), roleGuard('client'), async (c) => {
  const auth = c.get('auth')
  const clientProfile = await ClientProfile.findOne({ where: { userId: auth.userId } })
  if (!clientProfile) throw new AppError('Client profile not found', 404)

  const subscription = await Subscription.findOne({
    where: { clientId: clientProfile.id, status: 'active' },
    include: [{ model: SubscriptionPlan, as: 'plan' }],
  })

  return successResponse(c, subscription)
})

// PUT /api/subscriptions/me
subscriptions.put('/me',
  authenticate(),
  roleGuard('client'),
  validateRequest({ body: { planId: validators.required() } }),
  async (c) => {
    const auth = c.get('auth')
    const { planId } = await c.req.json()

    const clientProfile = await ClientProfile.findOne({ where: { userId: auth.userId } })
    if (!clientProfile) throw new AppError('Client profile not found', 404)

    const subscription = await Subscription.findOne({
      where: { clientId: clientProfile.id, status: 'active' },
    })
    if (!subscription) throw new AppError('No active subscription', 404)

    const plan = await SubscriptionPlan.findByPk(planId)
    if (!plan) throw new AppError('Plan not found', 404)

    await subscription.update({ planId })

    return successResponse(c, subscription, 'Subscription updated')
  }
)

// DELETE /api/subscriptions/me
subscriptions.delete('/me', authenticate(), roleGuard('client'), async (c) => {
  const auth = c.get('auth')
  const clientProfile = await ClientProfile.findOne({ where: { userId: auth.userId } })
  if (!clientProfile) throw new AppError('Client profile not found', 404)

  const subscription = await Subscription.findOne({
    where: { clientId: clientProfile.id, status: 'active' },
  })
  if (!subscription) throw new AppError('No active subscription', 404)

  await subscription.update({ status: 'cancelled' })

  return successResponse(c, { message: 'Subscription cancelled' })
})

export default subscriptions
