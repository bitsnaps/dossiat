import { Hono } from 'hono'
import { Op } from 'sequelize'
import { Mission, RecurrentMissionConfig, User } from '@/server/database/models'
import { successResponse } from '@/server/utils/apiResponse'
import { authenticate } from '@/server/middleware/auth'
import { validateRequest, validators } from '@/server/middleware/validateRequest'
import { AppError } from '@/server/middleware/errorHandler'

function calculateNextRun(
  frequency: string,
  interval: number,
  dayOfMonth?: number,
  dayOfWeek?: number,
): Date {
  const now = new Date()
  const next = new Date(now)

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + interval)
      break
    case 'weekly':
      if (dayOfWeek !== undefined && dayOfWeek !== null) {
        const currentDay = next.getDay()
        let daysUntil = dayOfWeek - currentDay
        if (daysUntil <= 0) daysUntil += 7
        next.setDate(next.getDate() + daysUntil + (interval - 1) * 7)
      } else {
        next.setDate(next.getDate() + interval * 7)
      }
      break
    case 'monthly':
      if (dayOfMonth !== undefined && dayOfMonth !== null) {
        next.setDate(dayOfMonth)
        if (next <= now) next.setMonth(next.getMonth() + interval)
      } else {
        next.setMonth(next.getMonth() + interval)
      }
      break
    case 'annual':
      next.setFullYear(next.getFullYear() + interval)
      break
  }

  return next
}

const recurrence = new Hono()

recurrence.get('/recurrences', authenticate(), async (c) => {
  const auth = c.get('auth')

  const missions = await Mission.findAll({
    where: { [Op.or]: [{ agentId: auth.userId }, { clientId: auth.userId }] },
    attributes: ['id'],
  })
  const missionIds = missions.map((m) => m.id)
  if (missionIds.length === 0) return successResponse(c, [])

  const configs = await RecurrentMissionConfig.findAll({
    where: { missionId: { [Op.in]: missionIds }, isActive: true },
    include: [{
      model: Mission,
      as: 'mission',
      include: [
        { model: User, as: 'agent', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName', 'email'] },
      ],
    }],
    order: [['nextRunAt', 'ASC']],
  })

  return successResponse(c, configs)
})

recurrence.post('/missions/:id/recurrence',
  authenticate(),
  validateRequest({
    body: {
      frequency: validators.isIn(['daily', 'weekly', 'monthly', 'annual']),
      interval: validators.required(),
    },
  }),
  async (c) => {
    const auth = c.get('auth')
    const missionId = parseInt(c.req.param('id')!)
    const { frequency, interval, dayOfMonth, dayOfWeek } = await c.req.json()

    const mission = await Mission.findByPk(missionId)
    if (!mission) throw new AppError('Mission not found', 404)
    if (mission.agentId !== auth.userId) throw new AppError('Only the agent can set recurrence', 403)

    const existing = await RecurrentMissionConfig.findOne({ where: { missionId } })
    if (existing) throw new AppError('Recurrence already configured', 400)

    const nextRunAt = calculateNextRun(frequency, interval, dayOfMonth, dayOfWeek)

    const config = await RecurrentMissionConfig.create({
      missionId,
      frequency,
      interval: Number(interval),
      dayOfMonth: dayOfMonth || null,
      dayOfWeek: dayOfWeek || null,
      nextRunAt,
      isActive: true,
    })

    await mission.update({ type: 'recurrent' })

    return successResponse(c, config, 'Recurrence configured', 201)
  }
)

recurrence.put('/missions/:id/recurrence',
  authenticate(),
  validateRequest({
    body: {
      frequency: validators.isIn(['daily', 'weekly', 'monthly', 'annual']),
      interval: validators.required(),
    },
  }),
  async (c) => {
    const auth = c.get('auth')
    const missionId = parseInt(c.req.param('id')!)
    const { frequency, interval, dayOfMonth, dayOfWeek } = await c.req.json()

    const mission = await Mission.findByPk(missionId)
    if (!mission) throw new AppError('Mission not found', 404)
    if (mission.agentId !== auth.userId) throw new AppError('Only the agent can update recurrence', 403)

    const config = await RecurrentMissionConfig.findOne({ where: { missionId } })
    if (!config) throw new AppError('Recurrence not configured', 404)

    const nextRunAt = calculateNextRun(frequency, interval, dayOfMonth, dayOfWeek)

    await config.update({
      frequency,
      interval: Number(interval),
      dayOfMonth: dayOfMonth || null,
      dayOfWeek: dayOfWeek || null,
      nextRunAt,
    })

    return successResponse(c, config, 'Recurrence updated')
  }
)

recurrence.delete('/missions/:id/recurrence', authenticate(), async (c) => {
  const auth = c.get('auth')
  const missionId = parseInt(c.req.param('id')!)

  const mission = await Mission.findByPk(missionId)
  if (!mission) throw new AppError('Mission not found', 404)
  if (mission.agentId !== auth.userId) throw new AppError('Only the agent can disable recurrence', 403)

  const config = await RecurrentMissionConfig.findOne({ where: { missionId } })
  if (!config) throw new AppError('Recurrence not configured', 404)

  await config.update({ isActive: false })
  await mission.update({ type: 'one_time' })

  return successResponse(c, { message: 'Recurrence disabled' })
})

export default recurrence
