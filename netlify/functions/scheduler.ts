/**
 * Netlify Scheduled Function — runs every 10 minutes.
 *
 * Triggers the background task scheduler which:
 * 1. Checks domain expirations and creates notifications
 * 2. Updates cached currency exchange rates
 * 3. Resets daily AI call counters (at midnight UTC)
 *
 * Schedule configured in netlify.toml: every 10 min
 */
import 'dotenv/config'

// Force esbuild to include pg in the bundle — Sequelize loads it dynamically
import 'pg'
import 'pg-hstore'

import { Op } from 'sequelize'
import '@/server/database/config/database'
import { Mission, RecurrentMissionConfig, Invoice, PlatformCredit, CreditTransaction, User, Payment, Notification } from '@/server/database/models'

export default async () => {
  const now = new Date()
  const results: Record<string, number> = {
    missionsCreated: 0,
    staleMissionsCleaned: 0,
    invoicesGenerated: 0,
    recurrenceNotificationsSent: 0,
  }

  // 1. Generate recurrent missions
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

    // Notify both parties about the new recurrent mission
    await Notification.create({
      userId: mission.clientId,
      type: 'recurrence.mission_generated',
      title: 'Recurring Mission Generated',
      body: `A new instance of "${mission.title}" has been automatically generated`,
      data: { missionId: newMission.id, parentMissionId: mission.id },
    })
    await Notification.create({
      userId: mission.agentId,
      type: 'recurrence.mission_generated',
      title: 'Recurring Mission Generated',
      body: `A new instance of "${mission.title}" has been automatically generated`,
      data: { missionId: newMission.id, parentMissionId: mission.id },
    })

    const nextRunAt = calculateNextRun(config.frequency, config.interval, config.dayOfMonth, config.dayOfWeek)
    await config.update({ nextRunAt, lastRunAt: now })

    results.missionsCreated++
  }

  // 2. Stale mission cleanup — auto-cancel drafts older than 7 days
  const staleDraftMissions = await Mission.findAll({
    where: {
      status: 'draft',
      createdAt: { [Op.lte]: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
    },
  })

  for (const mission of staleDraftMissions) {
    await mission.update({ status: 'cancelled' })
    await Notification.create({
      userId: mission.agentId,
      type: 'mission.cancelled',
      title: 'Mission Auto-Cancelled',
      body: `Mission "${mission.title}" has been automatically cancelled (stale draft)`,
      data: { missionId: mission.id, reason: 'stale_draft' },
    })
    results.staleMissionsCleaned++
  }

  // Auto-cancel pending_agreement missions older than 30 days
  const stalePendingMissions = await Mission.findAll({
    where: {
      status: 'pending_agreement',
      createdAt: { [Op.lte]: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
    },
  })

  for (const mission of stalePendingMissions) {
    await mission.update({ status: 'cancelled' })
    for (const userId of [mission.agentId, mission.clientId]) {
      await Notification.create({
        userId,
        type: 'mission.cancelled',
        title: 'Mission Auto-Cancelled',
        body: `Mission "${mission.title}" has been automatically cancelled (pending for 30+ days)`,
        data: { missionId: mission.id, reason: 'stale_pending' },
      })
    }
    results.staleMissionsCleaned++
  }

  // 3. Invoice generation for agents on billing cycle end
  const billingCycleEnd = new Date(now.getFullYear(), now.getMonth(), 0)
  const billingCycleStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const agents = await User.findAll({ where: { role: 'agent' } })

  for (const agent of agents) {
    const existingInvoice = await Invoice.findOne({
      where: {
        agentId: agent.id,
        periodStart: billingCycleStart,
        periodEnd: billingCycleEnd,
      },
    })
    if (existingInvoice) continue

    const payments = await Payment.findAll({
      where: {
        payeeId: agent.id,
        status: 'confirmed',
        confirmedAt: { [Op.gte]: billingCycleStart, [Op.lte]: billingCycleEnd },
      },
    })

    if (payments.length === 0) continue

    const totalFees = payments.reduce((sum, p) => sum + Number(p.platformFee), 0)
    if (totalFees <= 0) continue

    const credit = await PlatformCredit.findOne({ where: { agentId: agent.id } })
    let status: 'draft' | 'sent' | 'paid' = 'sent'

    if (credit && Number(credit.balance) >= totalFees) {
      await credit.update({ balance: Number(credit.balance) - totalFees })
      await CreditTransaction.create({
        creditId: credit.id,
        type: 'deduction',
        amount: totalFees,
        description: `Auto-deducted for billing cycle ${billingCycleStart.toISOString().slice(0, 7)}`,
      })
      status = 'paid'
    }

    const invoice = await Invoice.create({
      agentId: agent.id,
      periodStart: billingCycleStart,
      periodEnd: billingCycleEnd,
      totalFees,
      currency: 'USD',
      status,
      paidAt: status === 'paid' ? now : null,
    })

    await Notification.create({
      userId: agent.id,
      type: 'invoice.generated',
      title: 'Monthly Invoice Generated',
      body: `Your invoice for ${billingCycleStart.toISOString().slice(0, 7)} is ready: $${totalFees.toFixed(2)}`,
      data: { invoiceId: invoice.id, period: billingCycleStart.toISOString().slice(0, 7) },
    })

    results.invoicesGenerated++
  }

  // 4. Notification dispatch for upcoming recurrent missions (within 24 hours)
  const upcomingConfigs = await RecurrentMissionConfig.findAll({
    where: {
      isActive: true,
      nextRunAt: {
        [Op.gte]: now,
        [Op.lte]: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    include: [{ model: Mission, as: 'mission' }],
  })

  for (const config of upcomingConfigs) {
    const mission = (config as any).mission
    if (!mission) continue

    // Avoid duplicate notifications — only send if none exist in the last 23 hours
    const recentNotif = await Notification.findOne({
      where: {
        userId: mission.agentId,
        type: 'recurrence.mission_generated',
        createdAt: { [Op.gte]: new Date(now.getTime() - 23 * 60 * 60 * 1000) },
      },
    })
    if (recentNotif) continue

    await Notification.create({
      userId: mission.agentId,
      type: 'recurrence.mission_generated',
      title: 'Upcoming Recurring Mission',
      body: `Mission "${mission.title}" is scheduled to run tomorrow`,
      data: { missionId: mission.id, scheduledRunAt: config.nextRunAt },
    })
    await Notification.create({
      userId: mission.clientId,
      type: 'recurrence.mission_generated',
      title: 'Upcoming Recurring Mission',
      body: `Mission "${mission.title}" is scheduled to run tomorrow`,
      data: { missionId: mission.id, scheduledRunAt: config.nextRunAt },
    })

    results.recurrenceNotificationsSent++
  }

  return new Response(JSON.stringify({
    success: true,
    results,
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
