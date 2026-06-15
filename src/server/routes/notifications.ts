import { Hono } from 'hono'
import { Notification } from '@/server/database/models'
import { successResponse, paginatedResponse } from '@/server/utils/apiResponse'
import { authenticate } from '@/server/middleware/auth'
import { AppError } from '@/server/middleware/errorHandler'

const notifications = new Hono()

notifications.get('/', authenticate(), async (c) => {
  const auth = c.get('auth')
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = (page - 1) * limit

  const { count, rows } = await Notification.findAndCountAll({
    where: { userId: auth.userId },
    order: [['createdAt', 'DESC']],
    limit, offset,
  })

  return paginatedResponse(c, rows, count, page, limit)
})

notifications.put('/:id/read', authenticate(), async (c) => {
  const auth = c.get('auth')
  const id = parseInt(c.req.param('id')!)

  const notification = await Notification.findByPk(id)
  if (!notification) throw new AppError('Notification not found', 404)
  if (notification.userId !== auth.userId) throw new AppError('Access denied', 403)

  await notification.update({ readAt: new Date() })

  return successResponse(c, notification, 'Notification marked as read')
})

notifications.put('/read-all', authenticate(), async (c) => {
  const auth = c.get('auth')

  await Notification.update(
    { readAt: new Date() },
    { where: { userId: auth.userId, readAt: null } }
  )

  return successResponse(c, { message: 'All notifications marked as read' })
})

export default notifications
