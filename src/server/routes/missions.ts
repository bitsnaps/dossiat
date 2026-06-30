import { Hono } from 'hono'
import { Op } from 'sequelize'
import { Mission, RecurrentMissionConfig, MissionAttachment, Conversation, User, ClientProfile, Subscription, SubscriptionPlan } from '@/server/database/models'
import { successResponse, paginatedResponse } from '@/server/utils/apiResponse'
import { authenticate } from '@/server/middleware/auth'
import { roleGuard } from '@/server/middleware/roleGuard'
import { validateRequest, validators } from '@/server/middleware/validateRequest'
import { AppError } from '@/server/middleware/errorHandler'
import { createNotification } from '@/server/services/notification'
import { checkSeatLimit } from '@/server/services/subscriptionGuard'

const missions = new Hono()

// GET /api/missions
missions.get('/', authenticate(), async (c) => {
  const auth = c.get('auth')
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = (page - 1) * limit

  const where: any = {}
  if (auth.role === 'agent') {
    where.agentId = auth.userId
  } else if (auth.role === 'client') {
    where.clientId = auth.userId
  }

  // Filter by status
  const status = c.req.query('status')
  if (status) where.status = status

  // Filter by type
  const type = c.req.query('type')
  if (type) where.type = type

  // Filter by date range
  const startDate = c.req.query('startDate')
  const endDate = c.req.query('endDate')
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt[Op.gte] = new Date(startDate)
    if (endDate) where.createdAt[Op.lte] = new Date(endDate)
  }

  const { count, rows } = await Mission.findAndCountAll({
    where,
    include: [
      { model: User, as: 'agent', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName', 'email'] },
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  })

  return paginatedResponse(c, rows, count, page, limit)
})

// POST /api/missions
missions.post('/',
  authenticate(),
  validateRequest({
    body: {
      title: validators.required(),
      clientId: validators.required(),
      pricingType: validators.isIn(['fixed', 'hourly', 'task_based']),
    },
  }),
  async (c) => {
    const auth = c.get('auth')
    const body = await c.req.json()

    if (auth.role !== 'agent') {
      throw new AppError('Only agents can create missions', 403)
    }

    // Check seat limit for the client
    const seatCheck = await checkSeatLimit(body.clientId)
    if (!seatCheck.allowed) {
      throw new AppError(`Client has reached the maximum of ${seatCheck.max} agent seats. Upgrade your plan to add more.`, 403)
    }

    const mission = await Mission.create({
      agentId: auth.userId,
      clientId: body.clientId,
      title: body.title,
      description: body.description || null,
      status: 'draft',
      type: body.type || 'one_time',
      pricingType: body.pricingType,
      agreedAmount: body.agreedAmount || null,
      currency: body.currency || 'USD',
      agreedChecklist: body.agreedChecklist || [],
    })

    // Create conversation for the mission
    await Conversation.create({ missionId: mission.id })

    // Notify the client about the new mission
    createNotification(body.clientId, 'mission.created', 'New Mission', `You have a new mission: ${mission.title}`, { missionId: mission.id })

    return successResponse(c, mission, 'Mission created', 201)
  }
)

// POST /api/missions/bulk — Enterprise only
missions.post('/bulk',
  authenticate(),
  async (c) => {
    const auth = c.get('auth')
    const { missions: missionData } = await c.req.json()

    if (!Array.isArray(missionData) || missionData.length === 0) {
      throw new AppError('missions must be a non-empty array', 422)
    }

    if (missionData.length > 100) {
      throw new AppError('Maximum 100 missions per bulk request', 422)
    }

    // Check Enterprise tier
    if (auth.role === 'client') {
      const clientProfile = await ClientProfile.findOne({ where: { userId: auth.userId } })
      if (!clientProfile) throw new AppError('Client profile not found', 404)

      const subscription = await Subscription.findOne({
        where: { clientId: clientProfile.id, status: 'active' },
        include: [{ model: SubscriptionPlan, as: 'plan' }],
      }) as any

      const hasFeature = subscription?.plan?.features?.csv_import
      if (!hasFeature) {
        throw new AppError('Bulk mission creation requires Enterprise plan', 403)
      }
    }

    // Validate each mission entry
    for (const entry of missionData) {
      if (!entry.title) throw new AppError('Each mission must have a title', 422)
      if (!entry.clientId) throw new AppError('Each mission must have a clientId', 422)
      if (!entry.pricingType) throw new AppError('Each mission must have a pricingType', 422)
    }

    const created: any[] = []

    for (const entry of missionData) {
      const clientId = auth.role === 'agent' ? entry.clientId : auth.userId
      const agentId = auth.role === 'agent' ? auth.userId : entry.clientId

      const mission = await Mission.create({
        agentId,
        clientId,
        title: entry.title,
        description: entry.description || null,
        status: 'draft',
        type: entry.type || 'one_time',
        pricingType: entry.pricingType,
        agreedAmount: entry.agreedAmount || null,
        currency: entry.currency || 'USD',
        agreedChecklist: entry.agreedChecklist || [],
      })

      await Conversation.create({ missionId: mission.id })
      createNotification(clientId, 'mission.created', 'New Mission', `You have a new mission: ${mission.title}`, { missionId: mission.id })

      created.push(mission)
    }

    return successResponse(c, { count: created.length, missions: created }, `${created.length} missions created`, 201)
  }
)

// GET /api/missions/:id
missions.get('/:id', authenticate(), async (c) => {
  const auth = c.get('auth')
  const id = parseInt(c.req.param('id')!)

  const mission = await Mission.findByPk(id, {
    include: [
      { model: User, as: 'agent', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: RecurrentMissionConfig, as: 'recurrenceConfig' },
      { model: MissionAttachment, as: 'attachments' },
    ],
  })

  if (!mission) throw new AppError('Mission not found', 404)

  // Permission check
  if (mission.agentId !== auth.userId && mission.clientId !== auth.userId && auth.role !== 'admin') {
    throw new AppError('Access denied', 403)
  }

  return successResponse(c, mission)
})

// PUT /api/missions/:id
missions.put('/:id',
  authenticate(),
  validateRequest({
    body: {
      title: validators.required(),
    },
  }),
  async (c) => {
    const auth = c.get('auth')
    const id = parseInt(c.req.param('id')!)
    const body = await c.req.json()

    const mission = await Mission.findByPk(id)
    if (!mission) throw new AppError('Mission not found', 404)

    if (mission.agentId !== auth.userId && mission.clientId !== auth.userId) {
      throw new AppError('Access denied', 403)
    }

    await mission.update({
      title: body.title,
      description: body.description,
      agreedAmount: body.agreedAmount,
      currency: body.currency,
      agreedChecklist: body.agreedChecklist,
    })

    return successResponse(c, mission, 'Mission updated')
  }
)

// DELETE /api/missions/:id
missions.delete('/:id', authenticate(), async (c) => {
  const auth = c.get('auth')
  const id = parseInt(c.req.param('id')!)

  const mission = await Mission.findByPk(id)
  if (!mission) throw new AppError('Mission not found', 404)

  if (mission.agentId !== auth.userId && mission.clientId !== auth.userId) {
    throw new AppError('Access denied', 403)
  }

  await mission.update({ status: 'cancelled' })

  // Notify the other party
  const otherUserId = auth.userId === mission.agentId ? mission.clientId : mission.agentId
  createNotification(otherUserId, 'mission.cancelled', 'Mission Cancelled', `Mission "${mission.title}" has been cancelled`, { missionId: mission.id })

  return successResponse(c, { message: 'Mission cancelled' })
})

// POST /api/missions/:id/agree
missions.post('/:id/agree', authenticate(), async (c) => {
  const auth = c.get('auth')
  const id = parseInt(c.req.param('id')!)

  const mission = await Mission.findByPk(id)
  if (!mission) throw new AppError('Mission not found', 404)

  if (mission.status !== 'pending_agreement') {
    throw new AppError('Mission is not in pending_agreement status', 400)
  }

  if (auth.userId !== mission.agentId && auth.userId !== mission.clientId) {
    throw new AppError('Only mission participants can agree', 403)
  }

  // Mark this party as agreed
  const updates: any = {}
  if (auth.userId === mission.agentId) {
    if (mission.agreedByAgent) throw new AppError('Agent has already agreed', 400)
    updates.agreedByAgent = true
  } else {
    if (mission.agreedByClient) throw new AppError('Client has already agreed', 400)
    updates.agreedByClient = true
  }

  await mission.update(updates)

  // Notify the other party
  const otherUserId = auth.userId === mission.agentId ? mission.clientId : mission.agentId
  const partyLabel = auth.userId === mission.agentId ? 'Agent' : 'Client'
  createNotification(otherUserId, 'mission.agreement_progress', 'Mission Agreement Update', `${partyLabel} has agreed to mission "${mission.title}"`, { missionId: mission.id })

  // Check if both parties have now agreed
  const refreshed = await Mission.findByPk(id)
  if (refreshed!.agreedByAgent && refreshed!.agreedByClient) {
    await refreshed!.update({ status: 'agreed' })
    // Notify both parties that the mission is fully agreed
    createNotification(mission.agentId, 'mission.agreed', 'Mission Agreed', `Mission "${mission.title}" has been fully agreed upon`, { missionId: mission.id })
    createNotification(mission.clientId, 'mission.agreed', 'Mission Agreed', `Mission "${mission.title}" has been fully agreed upon`, { missionId: mission.id })
  }

  return successResponse(c, refreshed, 'Agreement recorded')
})

// GET /api/missions/:id/agreement-status
missions.get('/:id/agreement-status', authenticate(), async (c) => {
  const auth = c.get('auth')
  const id = parseInt(c.req.param('id')!)

  const mission = await Mission.findByPk(id)
  if (!mission) throw new AppError('Mission not found', 404)

  if (mission.agentId !== auth.userId && mission.clientId !== auth.userId && auth.role !== 'admin') {
    throw new AppError('Access denied', 403)
  }

  return successResponse(c, {
    agreedByAgent: mission.agreedByAgent,
    agreedByClient: mission.agreedByClient,
    bothAgreed: mission.agreedByAgent && mission.agreedByClient,
  })
})

// PUT /api/missions/:id/status
missions.put('/:id/status',
  authenticate(),
  validateRequest({
    body: {
      status: validators.isIn(['pending_agreement', 'in_progress', 'completed']),
    },
  }),
  async (c) => {
    const auth = c.get('auth')
    const id = parseInt(c.req.param('id')!)
    const { status } = await c.req.json()

    const mission = await Mission.findByPk(id)
    if (!mission) throw new AppError('Mission not found', 404)

    if (mission.agentId !== auth.userId && mission.clientId !== auth.userId) {
      throw new AppError('Access denied', 403)
    }

    const validTransitions: Record<string, string[]> = {
      draft: ['pending_agreement'],
      pending_agreement: ['agreed', 'cancelled'],
      agreed: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'disputed'],
    }

    if (!validTransitions[mission.status]?.includes(status)) {
      throw new AppError(`Cannot transition from ${mission.status} to ${status}`, 400)
    }

    const updates: any = { status }
    if (status === 'in_progress') updates.startedAt = new Date()
    if (status === 'completed') updates.completedAt = new Date()

    await mission.update(updates)

    // Notify the other party about status change
    const otherUserId = auth.userId === mission.agentId ? mission.clientId : mission.agentId
    const statusLabels: Record<string, string> = {
      pending_agreement: 'sent for agreement',
      agreed: 'agreed upon',
      in_progress: 'started',
      completed: 'completed',
      disputed: 'disputed',
      cancelled: 'cancelled',
    }
    createNotification(otherUserId, 'mission.status_changed', 'Mission Status Updated', `Mission "${mission.title}" has been ${statusLabels[status] || status}`, { missionId: mission.id, status })

    return successResponse(c, mission, 'Mission status updated')
  }
)

// POST /api/missions/:id/attachments
missions.post('/:id/attachments',
  authenticate(),
  async (c) => {
    const auth = c.get('auth')
    const id = parseInt(c.req.param('id')!)

    const mission = await Mission.findByPk(id)
    if (!mission) throw new AppError('Mission not found', 404)

    if (mission.agentId !== auth.userId && mission.clientId !== auth.userId) {
      throw new AppError('Access denied', 403)
    }

    const body = await c.req.json()
    const attachment = await MissionAttachment.create({
      missionId: id,
      uploadedBy: auth.userId,
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      fileType: body.fileType,
      fileSize: body.fileSize,
    })

    return successResponse(c, attachment, 'Attachment added', 201)
  }
)

// GET /api/missions/:id/attachments
missions.get('/:id/attachments', authenticate(), async (c) => {
  const auth = c.get('auth')
  const id = parseInt(c.req.param('id')!)

  const mission = await Mission.findByPk(id)
  if (!mission) throw new AppError('Mission not found', 404)

  if (mission.agentId !== auth.userId && mission.clientId !== auth.userId) {
    throw new AppError('Access denied', 403)
  }

  const attachments = await MissionAttachment.findAll({
    where: { missionId: id },
    order: [['createdAt', 'DESC']],
  })

  return successResponse(c, attachments)
})

export default missions
