import { Hono } from 'hono'
import { Conversation, Message, MessageAttachment, Mission, User } from '@/server/database/models'
import { successResponse, paginatedResponse } from '@/server/utils/apiResponse'
import { authenticate } from '@/server/middleware/auth'
import { validateRequest, validators } from '@/server/middleware/validateRequest'
import { AppError } from '@/server/middleware/errorHandler'
import { Op } from 'sequelize'
import { createNotification } from '@/server/services/notification'

const messages = new Hono()

messages.get('/conversations', authenticate(), async (c) => {
  const auth = c.get('auth')

  const missions = await Mission.findAll({
    where: { [Op.or]: [{ agentId: auth.userId }, { clientId: auth.userId }] },
    attributes: ['id', 'title', 'agentId', 'clientId'],
  })
  const missionIds = missions.map((m) => m.id)
  if (missionIds.length === 0) return successResponse(c, [])

  const conversations = await Conversation.findAll({
    where: { missionId: { [Op.in]: missionIds } },
    include: [
      { model: Mission, as: 'mission', attributes: ['id', 'title', 'agentId', 'clientId'] },
    ],
  })

  const conversationIds = conversations.map((cn) => cn.id)

  // Get last message for each conversation
  const lastMessages = await Message.findAll({
    where: { conversationId: { [Op.in]: conversationIds } },
    include: [
      { model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName'] },
    ],
    order: [['createdAt', 'DESC']],
  })

  // Get unread counts per conversation
  const unreadCounts = await Message.findAll({
    attributes: ['conversationId', [
      Message.sequelize!.fn('COUNT', Message.sequelize!.col('Message.id')),
      'unreadCount',
    ]],
    where: {
      conversationId: { [Op.in]: conversationIds },
      senderId: { [Op.ne]: auth.userId },
      readAt: null,
    },
    group: ['conversationId'],
  })

  const unreadMap = new Map<number, number>()
  for (const row of unreadCounts) {
    unreadMap.set((row as any).conversationId, Number((row as any).get('unreadCount')))
  }

  // Build response with last message and unread count
  const result = conversations.map((cn) => {
    const lastMsg = lastMessages.find((m) => m.conversationId === cn.id)
    const mission = (cn as any).mission

    // Determine counterparty
    const counterpartyId = auth.userId === mission?.agentId ? mission?.clientId : mission?.agentId

    return {
      id: cn.id,
      missionId: cn.missionId,
      missionTitle: mission?.title || '',
      counterpartyId,
      lastMessage: lastMsg
        ? {
            id: lastMsg.id,
            content: lastMsg.content,
            createdAt: lastMsg.createdAt,
            senderId: lastMsg.senderId,
            sender: (lastMsg as any).sender,
          }
        : null,
      unreadCount: unreadMap.get(cn.id) || 0,
      createdAt: cn.createdAt,
    }
  })

  // Sort by last message date (conversations without messages at the end)
  result.sort((a, b) => {
    const dateA = a.lastMessage?.createdAt || a.createdAt
    const dateB = b.lastMessage?.createdAt || b.createdAt
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })

  return successResponse(c, result)
})

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

    // Notify the other party in the mission conversation
    const recipientId = auth.userId === mission.agentId ? mission.clientId : mission.agentId
    createNotification(recipientId, 'message.received', 'New Message', `You have a new message on mission "${mission.title}"`, { missionId: mission.id, messageId: message.id })

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

messages.post('/conversations/:id/read-all', authenticate(), async (c) => {
  const auth = c.get('auth')
  const conversationId = parseInt(c.req.param('id')!)

  const conversation = await Conversation.findByPk(conversationId, {
    include: [{ model: Mission, as: 'mission' }],
  }) as any

  if (!conversation) throw new AppError('Conversation not found', 404)
  const mission = conversation.mission
  if (!mission || (mission.agentId !== auth.userId && mission.clientId !== auth.userId)) {
    throw new AppError('Access denied', 403)
  }

  await Message.update(
    { readAt: new Date() },
    {
      where: {
        conversationId,
        senderId: { [Op.ne]: auth.userId },
        readAt: null,
      },
    },
  )

  return successResponse(c, { message: 'All messages marked as read' })
})

export default messages
