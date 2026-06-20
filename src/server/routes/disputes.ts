import { Hono } from 'hono'
import { Dispute, DisputeMessage, Mission, User } from '@/server/database/models'
import { successResponse, paginatedResponse } from '@/server/utils/apiResponse'
import { authenticate } from '@/server/middleware/auth'
import { validateRequest, validators } from '@/server/middleware/validateRequest'
import { AppError } from '@/server/middleware/errorHandler'
import { createNotification } from '@/server/services/notification'

const disputes = new Hono()

// GET /api/disputes
disputes.get('/', authenticate(), async (c) => {
  const auth = c.get('auth')
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = (page - 1) * limit

  const where: any = {}
  if (auth.role !== 'admin') {
    where.initiatedBy = auth.userId
  }

  const { count, rows } = await Dispute.findAndCountAll({
    where,
    include: [
      { model: Mission, as: 'mission', attributes: ['id', 'title', 'status'] },
      { model: User, as: 'initiator', attributes: ['id', 'firstName', 'lastName'] },
    ],
    order: [['createdAt', 'DESC']],
    limit, offset,
  })

  return paginatedResponse(c, rows, count, page, limit)
})

// GET /api/disputes/:id
disputes.get('/:id', authenticate(), async (c) => {
  const auth = c.get('auth')
  const id = parseInt(c.req.param('id')!)

  const dispute = await Dispute.findByPk(id, {
    include: [
      { model: Mission, as: 'mission' },
      { model: User, as: 'initiator', attributes: ['id', 'firstName', 'lastName'] },
      { model: DisputeMessage, as: 'messages', include: [{ model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName'] }] },
    ],
  })

  if (!dispute) throw new AppError('Dispute not found', 404)

  return successResponse(c, dispute)
})

// POST /api/disputes/:id/messages
disputes.post('/:id/messages',
  authenticate(),
  validateRequest({ body: { content: validators.required() } }),
  async (c) => {
    const auth = c.get('auth')
    const id = parseInt(c.req.param('id')!)
    const { content } = await c.req.json()

    const dispute = await Dispute.findByPk(id)
    if (!dispute) throw new AppError('Dispute not found', 404)

    const message = await DisputeMessage.create({
      disputeId: id,
      senderId: auth.userId,
      content,
    })

    return successResponse(c, message, 'Message sent', 201)
  }
)

// PUT /api/disputes/:id/resolve
disputes.put('/:id/resolve',
  authenticate(),
  validateRequest({ body: { resolution: validators.required() } }),
  async (c) => {
    const auth = c.get('auth')
    const id = parseInt(c.req.param('id')!)
    const { resolution } = await c.req.json()

    const dispute = await Dispute.findByPk(id)
    if (!dispute) throw new AppError('Dispute not found', 404)

    await dispute.update({
      status: 'resolved',
      resolution,
      resolvedAt: new Date(),
    })

    // Notify both parties about dispute resolution
    const mission = await Mission.findByPk(dispute.missionId)
    if (mission) {
      createNotification(mission.agentId, 'dispute.resolved', 'Dispute Resolved', `Dispute on mission "${mission.title}" has been resolved`, { disputeId: dispute.id, missionId: mission.id })
      createNotification(mission.clientId, 'dispute.resolved', 'Dispute Resolved', `Dispute on mission "${mission.title}" has been resolved`, { disputeId: dispute.id, missionId: mission.id })
    }

    return successResponse(c, dispute, 'Dispute resolved')
  }
)

// PUT /api/disputes/:id/escalate
disputes.put('/:id/escalate', authenticate(), async (c) => {
  const auth = c.get('auth')
  const id = parseInt(c.req.param('id')!)

  const dispute = await Dispute.findByPk(id)
  if (!dispute) throw new AppError('Dispute not found', 404)

    await dispute.update({ status: 'escalated' })

    // Notify both parties about escalation
    const mission = await Mission.findByPk(dispute.missionId)
    if (mission) {
      createNotification(mission.agentId, 'dispute.escalated', 'Dispute Escalated', `Dispute on mission "${mission.title}" has been escalated for admin review`, { disputeId: dispute.id, missionId: mission.id })
      createNotification(mission.clientId, 'dispute.escalated', 'Dispute Escalated', `Dispute on mission "${mission.title}" has been escalated for admin review`, { disputeId: dispute.id, missionId: mission.id })
    }

    return successResponse(c, dispute, 'Dispute escalated')
})

// POST /api/missions/:id/dispute
disputes.post('/missions/:id/dispute',
  authenticate(),
  validateRequest({ body: { reason: validators.required() } }),
  async (c) => {
    const auth = c.get('auth')
    const missionId = parseInt(c.req.param('id')!)
    const { reason } = await c.req.json()

    const mission = await Mission.findByPk(missionId)
    if (!mission) throw new AppError('Mission not found', 404)
    if (mission.agentId !== auth.userId && mission.clientId !== auth.userId) {
      throw new AppError('Access denied', 403)
    }

    await mission.update({ status: 'disputed' })

    const dispute = await Dispute.create({
      missionId,
      initiatedBy: auth.userId,
      reason,
      status: 'open',
    })

    // Notify the other party about dispute creation
    const recipientId = auth.userId === mission.agentId ? mission.clientId : mission.agentId
    createNotification(recipientId, 'dispute.created', 'Dispute Initiated', `A dispute has been initiated on mission "${mission.title}"`, { disputeId: dispute.id, missionId: mission.id })

    return successResponse(c, dispute, 'Dispute initiated', 201)
  }
)

export default disputes
