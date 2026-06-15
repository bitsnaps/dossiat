import { Hono } from 'hono'
import { User, Mission, Dispute, Payment } from '@/server/database/models'
import { successResponse, paginatedResponse } from '@/server/utils/apiResponse'
import { authenticate } from '@/server/middleware/auth'
import { adminOnly } from '@/server/middleware/roleGuard'
import { fn, col } from 'sequelize'

const admin = new Hono()

admin.use('*', authenticate(), adminOnly())

admin.get('/users', async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = (page - 1) * limit

  const { count, rows } = await User.findAndCountAll({
    attributes: { exclude: ['passwordHash'] },
    order: [['createdAt', 'DESC']],
    limit, offset,
  })

  return paginatedResponse(c, rows, count, page, limit)
})

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

admin.get('/disputes', async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = (page - 1) * limit

  const { count, rows } = await Dispute.findAndCountAll({
    where: { status: 'open' },
    order: [['createdAt', 'DESC']],
    limit, offset,
  })

  return paginatedResponse(c, rows, count, page, limit)
})

export default admin
