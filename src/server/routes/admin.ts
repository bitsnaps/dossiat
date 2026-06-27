import { Hono } from 'hono'
import { Op } from 'sequelize'
import { User, AgentProfile, ClientProfile, Mission, Dispute, Payment, SubscriptionPlan } from '@/server/database/models'
import { successResponse, paginatedResponse, errorResponse } from '@/server/utils/apiResponse'
import { authenticate } from '@/server/middleware/auth'
import { adminOnly } from '@/server/middleware/roleGuard'
import { validateRequest, validators } from '@/server/middleware/validateRequest'
import { AppError } from '@/server/middleware/errorHandler'
import { fn, col } from 'sequelize'

const admin = new Hono()

admin.use('*', authenticate(), adminOnly())

// ─── GET /api/admin/users ───
admin.get('/users', async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = (page - 1) * limit
  const search = c.req.query('search') || ''
  const role = c.req.query('role') || ''

  const where: any = {}
  if (search) {
    where[Op.or] = [
      { firstName: { [Op.like]: `%${search}%` } },
      { lastName: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ]
  }
  if (role && ['agent', 'client', 'admin'].includes(role)) {
    where.role = role
  }

  const { count, rows } = await User.findAndCountAll({
    attributes: { exclude: ['passwordHash'] },
    where,
    order: [['createdAt', 'DESC']],
    limit, offset,
  })

  return paginatedResponse(c, rows, count, page, limit)
})

// ─── GET /api/admin/users/:id ───
admin.get('/users/:id', async (c) => {
  const id = parseInt(c.req.param('id')!)
  if (isNaN(id)) throw new AppError('Invalid user ID', 422)

  const user = await User.findByPk(id, {
    attributes: { exclude: ['passwordHash'] },
    include: [
      { model: AgentProfile, as: 'agentProfile' },
      { model: ClientProfile, as: 'clientProfile' },
    ],
  })

  if (!user) throw new AppError('User not found', 404)

  return successResponse(c, user)
})

// ─── PUT /api/admin/users/:id ───
admin.put('/users/:id',
  validateRequest({
    body: {
      role: validators.isIn(['agent', 'client', 'admin']),
    },
  }),
  async (c) => {
    const id = parseInt(c.req.param('id')!)
    if (isNaN(id)) throw new AppError('Invalid user ID', 422)

    const user = await User.findByPk(id)
    if (!user) throw new AppError('User not found', 404)

    const updates: any = {}
    const body = await c.req.json()

    if (body.role !== undefined) updates.role = body.role
    if (body.emailVerified !== undefined) updates.emailVerified = body.emailVerified

    if (Object.keys(updates).length === 0) {
      throw new AppError('No valid fields to update', 422)
    }

    await user.update(updates)

    const updated = await User.findByPk(id, {
      attributes: { exclude: ['passwordHash'] },
      include: [
        { model: AgentProfile, as: 'agentProfile' },
        { model: ClientProfile, as: 'clientProfile' },
      ],
    })

    return successResponse(c, updated, 'User updated')
  }
)

// ─── DELETE /api/admin/users/:id ───
admin.delete('/users/:id', async (c) => {
  const id = parseInt(c.req.param('id')!)
  if (isNaN(id)) throw new AppError('Invalid user ID', 422)

  const user = await User.findByPk(id)
  if (!user) throw new AppError('User not found', 404)

  // Soft-delete: deactivate by setting emailVerified to false and changing email
  await user.update({ emailVerified: false })

  return successResponse(c, { id, emailVerified: false }, 'User deactivated')
})

// ─── GET /api/admin/missions ───
admin.get('/missions', async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = (page - 1) * limit
  const status = c.req.query('status') || ''
  const search = c.req.query('search') || ''
  const type = c.req.query('type') || ''

  const where: any = {}
  if (status) where.status = status
  if (type) where.type = type
  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ]
  }

  const { count, rows } = await Mission.findAndCountAll({
    where,
    include: [
      { model: User, as: 'agent', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName', 'email'] },
    ],
    order: [['createdAt', 'DESC']],
    limit, offset,
  })

  return paginatedResponse(c, rows, count, page, limit)
})

// ─── GET /api/admin/missions/:id ───
admin.get('/missions/:id', async (c) => {
  const id = parseInt(c.req.param('id')!)
  if (isNaN(id)) throw new AppError('Invalid mission ID', 422)

  const mission = await Mission.findByPk(id, {
    include: [
      { model: User, as: 'agent', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: Payment, as: 'payments' },
    ],
  })

  if (!mission) throw new AppError('Mission not found', 404)

  return successResponse(c, mission)
})

// ─── PUT /api/admin/missions/:id/status ───
admin.put('/missions/:id/status',
  validateRequest({
    body: {
      status: validators.required(),
    },
  }),
  async (c) => {
    const id = parseInt(c.req.param('id')!)
    if (isNaN(id)) throw new AppError('Invalid mission ID', 422)

    const mission = await Mission.findByPk(id)
    if (!mission) throw new AppError('Mission not found', 404)

    const { status } = await c.req.json()
    const validStatuses = ['draft', 'pending_agreement', 'agreed', 'in_progress', 'completed', 'disputed', 'cancelled']
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 422)
    }

    await mission.update({ status })

    return successResponse(c, mission, 'Mission status updated')
  }
)

// ─── GET /api/admin/payments ───
admin.get('/payments', async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = (page - 1) * limit
  const status = c.req.query('status') || ''
  const method = c.req.query('method') || ''

  const where: any = {}
  if (status) where.status = status
  if (method) where.method = method

  const { count, rows } = await Payment.findAndCountAll({
    where,
    include: [
      { model: User, as: 'payer', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: User, as: 'payee', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: Mission, as: 'mission', attributes: ['id', 'title'] },
    ],
    order: [['createdAt', 'DESC']],
    limit, offset,
  })

  return paginatedResponse(c, rows, count, page, limit)
})

// ─── GET /api/admin/payments/:id ───
admin.get('/payments/:id', async (c) => {
  const id = parseInt(c.req.param('id')!)
  if (isNaN(id)) throw new AppError('Invalid payment ID', 422)

  const payment = await Payment.findByPk(id, {
    include: [
      { model: User, as: 'payer', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: User, as: 'payee', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: Mission, as: 'mission', attributes: ['id', 'title', 'status'] },
    ],
  })

  if (!payment) throw new AppError('Payment not found', 404)

  return successResponse(c, payment)
})

// ─── GET /api/admin/disputes ───
admin.get('/disputes', async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = (page - 1) * limit
  const status = c.req.query('status') || ''

  const where: any = {}
  if (status) {
    where.status = status
  }

  const { count, rows } = await Dispute.findAndCountAll({
    where,
    include: [
      { model: Mission, as: 'mission', attributes: ['id', 'title'] },
      { model: User, as: 'initiator', attributes: ['id', 'firstName', 'lastName', 'email'] },
    ],
    order: [['createdAt', 'DESC']],
    limit, offset,
  })

  return paginatedResponse(c, rows, count, page, limit)
})

// ─── GET /api/admin/disputes/:id ───
admin.get('/disputes/:id', async (c) => {
  const id = parseInt(c.req.param('id')!)
  if (isNaN(id)) throw new AppError('Invalid dispute ID', 422)

  const { DisputeMessage } = await import('@/server/database/models')

  const dispute = await Dispute.findByPk(id, {
    include: [
      { model: Mission, as: 'mission', attributes: ['id', 'title', 'status', 'agentId', 'clientId'] },
      { model: User, as: 'initiator', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: DisputeMessage, as: 'messages', include: [{ model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'email'] }] },
    ],
  })

  if (!dispute) throw new AppError('Dispute not found', 404)

  return successResponse(c, dispute)
})

// ─── PUT /api/admin/disputes/:id/resolve ───
admin.put('/disputes/:id/resolve',
  validateRequest({
    body: {
      resolution: validators.required(),
    },
  }),
  async (c) => {
    const id = parseInt(c.req.param('id')!)
    if (isNaN(id)) throw new AppError('Invalid dispute ID', 422)

    const dispute = await Dispute.findByPk(id)
    if (!dispute) throw new AppError('Dispute not found', 404)

    const { resolution } = await c.req.json()

    await dispute.update({
      status: 'resolved',
      resolution,
      resolvedAt: new Date(),
    })

    return successResponse(c, dispute, 'Dispute resolved')
  }
)

// ─── Subscription Plans ───

admin.get('/subscription-plans', async (c) => {
  const plans = await SubscriptionPlan.findAll({
    order: [['price', 'ASC']],
  })

  return successResponse(c, plans)
})

admin.post('/subscription-plans',
  validateRequest({
    body: {
      name: validators.required(),
      price: validators.required(),
    },
  }),
  async (c) => {
    const { name, price, currency, interval, maxSeats, maxRecurrentMissions, features } = await c.req.json()

    const plan = await SubscriptionPlan.create({
      name,
      price,
      currency: currency || 'USD',
      interval: interval || 'monthly',
      maxSeats: maxSeats || 1,
      maxRecurrentMissions: maxRecurrentMissions || 10,
      features: features || {},
      isActive: true,
    })

    return successResponse(c, plan, 'Plan created', 201)
  }
)

admin.put('/subscription-plans/:id',
  validateRequest({
    body: {
      price: validators.required(),
    },
  }),
  async (c) => {
    const id = parseInt(c.req.param('id')!)
    if (isNaN(id)) throw new AppError('Invalid plan ID', 422)

    const plan = await SubscriptionPlan.findByPk(id)
    if (!plan) throw new AppError('Plan not found', 404)

    const updates = await c.req.json()
    await plan.update(updates)

    return successResponse(c, plan, 'Plan updated')
  }
)

admin.delete('/subscription-plans/:id', async (c) => {
  const id = parseInt(c.req.param('id')!)
  if (isNaN(id)) throw new AppError('Invalid plan ID', 422)

  const plan = await SubscriptionPlan.findByPk(id)
  if (!plan) throw new AppError('Plan not found', 404)

  await plan.update({ isActive: false })

  return successResponse(c, plan, 'Plan deactivated')
})

// ─── Stats ───

admin.get('/stats', async (c) => {
  const totalUsers = await User.count()
  const totalMissions = await Mission.count()
  const totalDisputes = await Dispute.count()
  const openDisputes = await Dispute.count({ where: { status: 'open' } })

  const revenueResult = await Payment.findOne({
    attributes: [[fn('SUM', col('platform_fee')), 'totalFees']],
    where: { status: 'confirmed' },
    raw: true,
  })

  return successResponse(c, {
    totalUsers,
    totalMissions,
    totalDisputes,
    openDisputes,
    totalRevenue: (revenueResult as any)?.totalFees || 0,
  })
})

export default admin
