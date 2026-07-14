import { Hono } from 'hono'
import { Op } from 'sequelize'
import { Payment, Mission, PlatformCredit, CreditTransaction, Invoice } from '@/server/database/models'
import { successResponse, paginatedResponse } from '@/server/utils/apiResponse'
import { authenticate } from '@/server/middleware/auth'
import { validateRequest, validators } from '@/server/middleware/validateRequest'
import { AppError } from '@/server/middleware/errorHandler'
import { calculateAllFees, isGatewayMethod } from '@/server/services/payment'
import type { PaymentMethod } from '@/server/services/payment'
import { createNotification } from '@/server/services/notification'

const payments = new Hono()

/** Parse capped pagination params from query string. */
function pagination(c: { req: { query: (k: string) => string | undefined } }) {
  const page = Math.max(parseInt(c.req.query('page') || '1', 10) || 1, 1)
  const limit = Math.min(Math.max(parseInt(c.req.query('limit') || '20', 10) || 20, 1), 100)
  const offset = (page - 1) * limit
  return { page, limit, offset }
}

payments.get('/missions/:id/payments', authenticate(), async (c) => {
  const auth = c.get('auth')
  const missionId = parseInt(c.req.param('id')!)

  const mission = await Mission.findByPk(missionId)
  if (!mission) throw new AppError('Mission not found', 404)
  if (mission.agentId !== auth.userId && mission.clientId !== auth.userId && auth.role !== 'admin') {
    throw new AppError('Access denied', 403)
  }

  const { page, limit, offset } = pagination(c)
  const { count, rows } = await Payment.findAndCountAll({
    where: { missionId },
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  })
  return paginatedResponse(c, rows, count, page, limit)
})

payments.post('/missions/:id/payments',
  authenticate(),
  validateRequest({
    body: {
      amount: validators.required(),
      method: validators.isIn(['cash', 'stripe', 'paypal', 'bank_transfer']),
    },
  }),
  async (c) => {
    const auth = c.get('auth')
    const missionId = parseInt(c.req.param('id')!)
    const { amount, method, currency } = await c.req.json()

    const mission = await Mission.findByPk(missionId)
    if (!mission) throw new AppError('Mission not found', 404)
    if (mission.agentId !== auth.userId && mission.clientId !== auth.userId && auth.role !== 'admin') {
      throw new AppError('Access denied', 403)
    }
    if (mission.agentId === null) {
      throw new AppError('Mission has no assigned agent', 400)
    }
    const agentId = mission.agentId

    const { gatewayFee, platformFee, netAmount } = calculateAllFees(Number(amount), method as PaymentMethod)

    const payment = await Payment.create({
      missionId,
      payerId: mission.clientId,
      payeeId: agentId,
      amount: Number(amount),
      currency: currency || mission.currency || 'USD',
      method,
      platformFee,
      gatewayFee,
      netAmount,
      status: 'pending',
    })

    // Notify the payee (agent) about the new payment
    createNotification(agentId, 'payment.recorded', 'Payment Recorded', `A payment of ${payment.amount} ${payment.currency} has been recorded for mission "${mission.title}"`, { missionId: mission.id, paymentId: payment.id })

    return successResponse(c, payment, 'Payment recorded', 201)
  }
)

payments.post('/payments/:id/confirm-payer', authenticate(), async (c) => {
  const auth = c.get('auth')
  const paymentId = parseInt(c.req.param('id')!)

  const payment = await Payment.findByPk(paymentId)
  if (!payment) throw new AppError('Payment not found', 404)
  if (payment.payerId !== auth.userId) throw new AppError('Only payer can confirm', 403)

  await payment.update({ confirmedByPayer: true })
  if (payment.confirmedByPayer && payment.confirmedByPayee) {
    await payment.update({ status: 'confirmed', confirmedAt: new Date() })
  }

  return successResponse(c, payment, 'Payment confirmed by payer')
})

payments.post('/payments/:id/confirm-payee', authenticate(), async (c) => {
  const auth = c.get('auth')
  const paymentId = parseInt(c.req.param('id')!)

  const payment = await Payment.findByPk(paymentId)
  if (!payment) throw new AppError('Payment not found', 404)
  if (payment.payeeId !== auth.userId) throw new AppError('Only payee can confirm', 403)

  const wasBothConfirmed = payment.confirmedByPayer && payment.confirmedByPayee

  await payment.update({ confirmedByPayee: true })

  if (!wasBothConfirmed && payment.confirmedByPayer && payment.confirmedByPayee) {
    await payment.update({ status: 'confirmed', confirmedAt: new Date() })

    // Notify both parties about confirmed payment
    createNotification(payment.payerId, 'payment.confirmed', 'Payment Confirmed', `Your payment of ${payment.amount} ${payment.currency} has been confirmed`, { paymentId: payment.id, missionId: payment.missionId })
    createNotification(payment.payeeId, 'payment.confirmed', 'Payment Confirmed', `A payment of ${payment.amount} ${payment.currency} has been confirmed`, { paymentId: payment.id, missionId: payment.missionId })

    // Deduct platform fee from agent credits for off-platform payments
    const method = payment.method as PaymentMethod
    if (!isGatewayMethod(method)) {
      const platformFee = Number(payment.platformFee)

      let credit = await PlatformCredit.findOne({ where: { agentId: auth.userId } })
      if (!credit) {
        credit = await PlatformCredit.create({ agentId: auth.userId, balance: 0, currency: payment.currency })
      }

      const currentBalance = Number(credit.balance)
      if (currentBalance >= platformFee) {
        await credit.update({ balance: currentBalance - platformFee })

        await CreditTransaction.create({
          creditId: credit.id,
          type: 'deduction',
          amount: platformFee,
          description: `Platform fee for payment #${payment.id} (mission #${payment.missionId})`,
        })
      }
      // If insufficient credits, the payment is still confirmed
      // Outstanding fee tracked for billing cycle / invoice
    }
  }

  return successResponse(c, payment, 'Payment confirmed by payee')
})

payments.get('/agents/me/credits', authenticate(), async (c) => {
  const auth = c.get('auth')
  const credit = await PlatformCredit.findOne({ where: { agentId: auth.userId } })
  return successResponse(c, credit || { balance: 0, currency: 'USD' })
})

payments.post('/agents/me/credits/purchase',
  authenticate(),
  validateRequest({ body: { amount: validators.required() } }),
  async (c) => {
    const auth = c.get('auth')
    const { amount } = await c.req.json()

    let credit = await PlatformCredit.findOne({ where: { agentId: auth.userId } })
    if (!credit) {
      credit = await PlatformCredit.create({ agentId: auth.userId, balance: 0, currency: 'USD' })
    }

    await credit.update({ balance: Number(credit.balance) + Number(amount) })

    await CreditTransaction.create({
      creditId: credit.id,
      type: 'purchase',
      amount: Number(amount),
      description: `Purchased ${amount} platform credits`,
    })

    return successResponse(c, credit, 'Credits purchased')
  }
)

payments.get('/agents/me/credit-transactions', authenticate(), async (c) => {
  const auth = c.get('auth')
  const credit = await PlatformCredit.findOne({ where: { agentId: auth.userId } })
  if (!credit) return paginatedResponse(c, [], 0, 1, 20)

  const { page, limit, offset } = pagination(c)
  const { count, rows } = await CreditTransaction.findAndCountAll({
    where: { creditId: credit.id },
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  })

  return paginatedResponse(c, rows, count, page, limit)
})

payments.get('/agents/me/payments', authenticate(), async (c) => {
  const auth = c.get('auth')
  const where: any = auth.role === 'admin'
    ? {}
    : {
        [Op.or]: [
          { payerId: auth.userId },
          { payeeId: auth.userId },
        ],
      }
  const { page, limit, offset } = pagination(c)
  const { count, rows } = await Payment.findAndCountAll({
    where,
    include: [{ model: Mission, as: 'mission', attributes: ['id', 'title'] }],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  })
  return paginatedResponse(c, rows, count, page, limit)
})

payments.get('/agents/me/invoices', authenticate(), async (c) => {
  const auth = c.get('auth')
  const { page, limit, offset } = pagination(c)
  const { count, rows } = await Invoice.findAndCountAll({
    where: { agentId: auth.userId },
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  })
  return paginatedResponse(c, rows, count, page, limit)
})

export default payments
