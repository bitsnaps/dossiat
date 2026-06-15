import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { Payment, Mission, User } from '@/server/database/models'
import sequelize from '@/server/database/config/database'

describe('CHECK Constraints & Business Rules (2i)', () => {
  let agentId: number
  let clientId: number
  let missionId: number

  beforeAll(async () => {
    await sequelize.authenticate()

    const agent = await User.create({
      email: `check-agent-${Date.now()}@test.com`,
      passwordHash: 'hashed',
      firstName: 'Agent',
      lastName: 'Check',
      role: 'agent',
    })
    agentId = agent.id

    const client = await User.create({
      email: `check-client-${Date.now()}@test.com`,
      passwordHash: 'hashed',
      firstName: 'Client',
      lastName: 'Check',
      role: 'client',
    })
    clientId = client.id

    const mission = await Mission.create({
      agentId,
      clientId,
      title: 'Check Test Mission',
      pricingType: 'fixed',
      status: 'draft',
      type: 'one_time',
      agreedAmount: 500,
      currency: 'USD',
    })
    missionId = mission.id
  })

  afterAll(async () => {
    await Payment.destroy({ where: { missionId } })
    await Mission.destroy({ where: { id: missionId } })
    await User.destroy({ where: { id: [agentId, clientId] } })
  })

  it('rejects negative payment amounts', async () => {
    await expect(
      Payment.create({
        missionId,
        payerId: clientId,
        payeeId: agentId,
        amount: -100,
        currency: 'USD',
        method: 'cash',
        netAmount: -100,
        status: 'pending',
      })
    ).rejects.toThrow()
  })

  it('rejects zero payment amounts', async () => {
    await expect(
      Payment.create({
        missionId,
        payerId: clientId,
        payeeId: agentId,
        amount: 0,
        currency: 'USD',
        method: 'cash',
        netAmount: 0,
        status: 'pending',
      })
    ).rejects.toThrow()
  })

  it('accepts valid positive payment amounts', async () => {
    const payment = await Payment.create({
      missionId,
      payerId: clientId,
      payeeId: agentId,
      amount: 100,
      currency: 'USD',
      method: 'cash',
      netAmount: 99,
      status: 'pending',
    })
    expect(payment.amount).toBe(100)
    await payment.destroy()
  })

  it('rejects negative platform fees', async () => {
    await expect(
      Payment.create({
        missionId,
        payerId: clientId,
        payeeId: agentId,
        amount: 100,
        currency: 'USD',
        method: 'cash',
        netAmount: 100,
        platformFee: -5,
        status: 'pending',
      })
    ).rejects.toThrow()
  })

  it('rejects negative gateway fees', async () => {
    await expect(
      Payment.create({
        missionId,
        payerId: clientId,
        payeeId: agentId,
        amount: 100,
        currency: 'USD',
        method: 'stripe',
        netAmount: 100,
        gatewayFee: -3,
        status: 'pending',
      })
    ).rejects.toThrow()
  })

  it('rejects net_amount greater than amount', async () => {
    await expect(
      Payment.create({
        missionId,
        payerId: clientId,
        payeeId: agentId,
        amount: 100,
        currency: 'USD',
        method: 'cash',
        netAmount: 200,
        status: 'pending',
      })
    ).rejects.toThrow()
  })
})
