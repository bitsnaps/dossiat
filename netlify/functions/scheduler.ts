import type { Context } from '@netlify/functions'
import { Op } from 'sequelize'
import '@/server/database/config/database'
import { Mission, RecurrentMissionConfig } from '@/server/database/models'

export default async (context: Context) => {
  const now = new Date()
  let missionsCreated = 0

  // Find all active recurrent configs where nextRunAt has passed
  const dueConfigs = await RecurrentMissionConfig.findAll({
    where: {
      isActive: true,
      nextRunAt: { [Op.lte]: now },
    },
    include: [{ model: Mission, as: 'mission' }],
  })

  for (const config of dueConfigs) {
    const mission = (config as any).mission
    if (!mission) continue

    // Create a new mission based on the template
    const newMission = await Mission.create({
      agentId: mission.agentId,
      clientId: mission.clientId,
      title: mission.title,
      description: mission.description,
      status: 'draft',
      type: 'one_time',
      pricingType: mission.pricingType,
      agreedAmount: mission.agreedAmount,
      currency: mission.currency,
      agreedChecklist: mission.agreedChecklist,
    })

    // Update the config with next run time
    const nextRunAt = calculateNextRun(config.frequency, config.interval, config.dayOfMonth, config.dayOfWeek)
    await config.update({ nextRunAt, lastRunAt: now })

    missionsCreated++
  }

  return new Response(JSON.stringify({
    success: true,
    missionsCreated,
    timestamp: now.toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function calculateNextRun(
  frequency: string,
  interval: number,
  dayOfMonth?: number | null,
  dayOfWeek?: number | null,
): Date {
  const now = new Date()
  const next = new Date(now)

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + interval)
      break
    case 'weekly':
      if (dayOfWeek != null) {
        const currentDay = next.getDay()
        let daysUntil = dayOfWeek - currentDay
        if (daysUntil <= 0) daysUntil += 7
        next.setDate(next.getDate() + daysUntil + (interval - 1) * 7)
      } else {
        next.setDate(next.getDate() + interval * 7)
      }
      break
    case 'monthly':
      if (dayOfMonth != null) {
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
