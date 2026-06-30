import { Op } from 'sequelize'
import { Mission, RecurrentMissionConfig, ClientProfile, Subscription, SubscriptionPlan } from '@/server/database/models'

interface SeatCheckResult {
  allowed: boolean
  current: number
  max: number
}

interface RecurrenceLimitResult {
  allowed: boolean
  current: number
  max: number
}

const DEFAULT_MAX_SEATS = 3
const DEFAULT_MAX_RECURRENT_MISSIONS = 10

/**
 * Check if a client has reached their seat limit (unique agents with active missions).
 * Returns the current count and max allowed (-1 = unlimited).
 */
export async function checkSeatLimit(clientUserId: number): Promise<SeatCheckResult> {
  const clientProfile = await ClientProfile.findOne({ where: { userId: clientUserId } })
  if (!clientProfile) {
    return { allowed: true, current: 0, max: DEFAULT_MAX_SEATS }
  }

  const subscription = await Subscription.findOne({
    where: { clientId: clientProfile.id, status: 'active' },
    include: [{ model: SubscriptionPlan, as: 'plan' }],
  }) as any

  const maxSeats = subscription?.plan?.maxSeats ?? DEFAULT_MAX_SEATS

  // -1 means unlimited
  if (maxSeats === -1) {
    return { allowed: true, current: 0, max: -1 }
  }

  // Count distinct agents the client has non-cancelled missions with
  const missions = await Mission.findAll({
    where: {
      clientId: clientUserId,
      status: { [Op.notIn]: ['cancelled'] },
    },
    attributes: ['agentId'],
  })

  const uniqueAgentIds = new Set(missions.map((m) => m.agentId))

  return {
    allowed: uniqueAgentIds.size < maxSeats,
    current: uniqueAgentIds.size,
    max: maxSeats,
  }
}

/**
 * Check if a client has reached their recurring mission limit.
 * Returns the current count and max allowed (-1 = unlimited).
 */
export async function checkRecurrentMissionLimit(clientUserId: number): Promise<RecurrenceLimitResult> {
  const clientProfile = await ClientProfile.findOne({ where: { userId: clientUserId } })
  if (!clientProfile) {
    return { allowed: true, current: 0, max: DEFAULT_MAX_RECURRENT_MISSIONS }
  }

  const subscription = await Subscription.findOne({
    where: { clientId: clientProfile.id, status: 'active' },
    include: [{ model: SubscriptionPlan, as: 'plan' }],
  }) as any

  const maxRecurrent = subscription?.plan?.maxRecurrentMissions ?? DEFAULT_MAX_RECURRENT_MISSIONS

  // -1 means unlimited
  if (maxRecurrent === -1) {
    return { allowed: true, current: 0, max: -1 }
  }

  // Count active recurrent mission configs for missions belonging to this client
  const clientMissions = await Mission.findAll({
    where: { clientId: clientUserId },
    attributes: ['id'],
  })
  const clientMissionIds = clientMissions.map((m) => m.id)

  if (clientMissionIds.length === 0) {
    return { allowed: true, current: 0, max: maxRecurrent }
  }

  const activeConfigs = await RecurrentMissionConfig.findAll({
    where: {
      missionId: { [Op.in]: clientMissionIds },
      isActive: true,
    },
  })

  return {
    allowed: activeConfigs.length < maxRecurrent,
    current: activeConfigs.length,
    max: maxRecurrent,
  }
}
