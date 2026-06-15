import { Hono } from 'hono'
import { Conversation, Message, MessageAttachment, Mission, User } from '@/server/database/models'
import { successResponse, paginatedResponse } from '@/server/utils/apiResponse'
import { authenticate } from '@/server/middleware/auth'
import { validateRequest, validators } from '@/server/middleware/validateRequest'
import { AppError } from '@/server/middleware/errorHandler'
import { Op } from 'sequelize'

const messages = new Hono()

messages.get('/missions/:id/messages', authenticate(), async (c) => {
  const auth = c.get('auth')
  const missionId = parseInt(c.req.param('id')!)
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '50')
  const offset = (page - 1) * limit

  const mission = await Mission.findByPk(missionId)
  if (!mission) throw new AppError('Mission not found', 404)
  if (mission.agentId !== auth.userId && mission.clientId !== auth.userId) {
    throw new AppError('Access denied', 403)
  }

  const conversation = await Conversation.findOne({ where: { missionId } })
  if (!conversation) throw new AppError('Conversation not found', 404)

  const { count, rows } = await Message.findAndCountAll({
    where: { conversationId: conversation.id },
    include: [
      { model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName'] },
      { model: MessageAttachment, as: 'attachments' },
    ],
    order: [['createdAt', 'ASC']],
    limit, offset,
  })

  return paginatedResponse(c, rows, count, page, limit)
})

messages.post('/missions/:id/messages',
  authenticate(),
  validateRequest({ body: { content: validators.required() } }),
  async (c) => {
    const auth = c.get('auth')
    const missionId = parseInt(c.req.param('id')!)
    const { content } = await c.req.json()

    const mission = await Mission.findByPk(missionId)
    if (!mission) throw new AppError('Mission not found', 404)
    if (mission.agentId !== auth.userId && mission.clientId !== auth.userId) {
      throw new AppError('Access denied', 403)
    }

    let conversation = await Conversation.findOne({ where: { missionId } })
    if (!conversation) conversation = await Conversation.create({ missionId })

    const message = await Message.create({
      conversationId: conversation.id,
      senderId: auth.userId,
      content,
    })

    return successResponse(c, message, 'Message sent', 201)
  }
)

messages.post('/messages/:id/read', authenticate(), async (c) => {
  const auth = c.get('auth')
  const messageId = parseInt(c.req.param('id')!)

  const message = await Message.findByPk(messageId, {
    include: [{ model: Conversation, as: 'conversation', include: [{ model: Mission, as: 'mission' }] }],
  }) as any

  if (!message) throw new AppError('Message not found', 404)
  const mission = message.conversation?.mission
  if (!mission || (mission.agentId !== auth.userId && mission.clientId !== auth.userId)) {
    throw new AppError('Access denied', 403)
  }

  await message.update({ readAt: new Date() })
  return successResponse(c, { message: 'Message marked as read' })
})

messages.get('/messages/unread-count', authenticate(), async (c) => {
  const auth = c.get('auth')

  const missions = await Mission.findAll({
    where: { [Op.or]: [{ agentId: auth.userId }, { clientId: auth.userId }] },
  })
  const missionIds = missions.map((m) => m.id)
  if (missionIds.length === 0) return successResponse(c, { count: 0 })

  const conversations = await Conversation.findAll({
    where: { missionId: { [Op.in]: missionIds } },
  })
  const conversationIds = conversations.map((cn) => cn.id)
  if (conversationIds.length === 0) return successResponse(c, { count: 0 })

  const count = await Message.count({
    where: {
      conversationId: { [Op.in]: conversationIds },
      senderId: { [Op.ne]: auth.userId },
      readAt: null,
    },
  })

  return successResponse(c, { count })
})

export default messages
