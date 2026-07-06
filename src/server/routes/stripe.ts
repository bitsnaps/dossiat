import { Hono } from 'hono'
import Stripe from 'stripe'
import { authenticate } from '@/server/middleware/auth'
import { validateRequest, validators } from '@/server/middleware/validateRequest'
import { successResponse } from '@/server/utils/apiResponse'
import { AppError } from '@/server/middleware/errorHandler'
import { AgentProfile, User, Payment, Mission } from '@/server/database/models'
import { createNotification } from '@/server/services/notification'

function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new AppError('Stripe is not configured on this platform', 501)
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}

const stripe = new Hono()

// POST /api/payments/stripe/connect — Agent OAuth connect flow
stripe.post('/connect', authenticate(), async (c) => {
  if (!isStripeConfigured()) {
    throw new AppError('Stripe is not configured on this platform', 501)
  }

  const stripeClient = getStripeClient()
  const auth = c.get('auth')
  const profile = await AgentProfile.findOne({ where: { userId: auth.userId } })
  if (!profile) throw new AppError('Agent profile not found', 404)

  let accountId = (profile as any).stripeAccountId

  if (!accountId) {
    const user = await User.findByPk(auth.userId)
    const account = await stripeClient.accounts.create({
      type: 'express',
      email: user?.email,
      metadata: { userId: auth.userId, agentProfileId: profile.id },
    })
    accountId = account.id
    await profile.update({ stripeAccountId: accountId } as any)
  }

  const appUrl = process.env.APP_URL || 'http://localhost:5173'
  const accountLink = await stripeClient.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/settings/billing`,
    return_url: `${appUrl}/settings/billing`,
    type: 'account_onboarding',
  })

  return successResponse(c, {
    accountId,
    url: accountLink.url,
  }, 'Stripe Connect account link generated')
})

// POST /api/payments/stripe/create-checkout-session
stripe.post('/create-checkout-session',
  authenticate(),
  validateRequest({
    body: {
      missionId: validators.required(),
      amount: validators.required(),
    },
  }),
  async (c) => {
    if (!isStripeConfigured()) {
      throw new AppError('Stripe is not configured on this platform', 501)
    }

    const stripeClient = getStripeClient()
    const auth = c.get('auth')
    const { missionId, amount, currency } = await c.req.json()

    const mission = await Mission.findByPk(missionId)
    if (!mission) throw new AppError('Mission not found', 404)
    if (mission.agentId !== auth.userId && mission.clientId !== auth.userId) {
      throw new AppError('Access denied', 403)
    }

    const agentProfile = mission.agentId !== null
      ? await AgentProfile.findOne({ where: { userId: mission.agentId } })
      : null
    const stripeAccountId = agentProfile ? (agentProfile as any).stripeAccountId : null

    const platformFee = Math.max(1, Number(amount) * 0.01)

    const sessionParams = {
      mode: 'payment' as const,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency || mission.currency || 'USD',
            product_data: {
              name: mission.title,
              description: mission.description || `Payment for mission #${mission.id}`,
            },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        missionId: String(mission.id),
        payerId: String(auth.userId),
        payeeId: String(mission.agentId),
      },
      success_url: `${process.env.APP_URL || 'http://localhost:5173'}/missions/${mission.id}?payment=success`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:5173'}/missions/${mission.id}?payment=cancelled`,
      application_fee_amount: Math.round(platformFee * 100),
      ...(stripeAccountId ? { transfer_data: { destination: stripeAccountId } } : {}),
    } as Stripe.Checkout.SessionCreateParams

    const session = await stripeClient.checkout.sessions.create(sessionParams)

    return successResponse(c, {
      sessionId: session.id,
      url: session.url,
    }, 'Checkout session created')
  },
)

// POST /api/payments/stripe/webhook — Handle Stripe webhook events
stripe.post('/webhook', async (c) => {
  if (!isStripeConfigured()) {
    throw new AppError('Stripe is not configured on this platform', 501)
  }

  const stripeClient = getStripeClient()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new AppError('Stripe webhook secret not configured', 501)
  }

  const body = await c.req.text()
  const sig = c.req.header('stripe-signature')
  if (!sig) throw new AppError('Missing stripe-signature header', 400)

  let event: Stripe.Event
  try {
    event = stripeClient.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    throw new AppError('Invalid webhook signature', 400)
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const { missionId, payerId, payeeId } = session.metadata || {}

      if (missionId && payerId && payeeId) {
        const amount = (session.amount_total || 0) / 100

        const existing = await Payment.findOne({ where: { missionId: Number(missionId), method: 'stripe' } })
        if (!existing) {
          const gatewayFee = amount * 0.029 + 0.30
          const platformFee = Math.max(1, amount * 0.01)

          await Payment.create({
            missionId: Number(missionId),
            payerId: Number(payerId),
            payeeId: Number(payeeId),
            amount,
            currency: (session.currency || 'usd').toUpperCase(),
            method: 'stripe',
            platformFee,
            gatewayFee,
            netAmount: amount - gatewayFee - platformFee,
            status: 'confirmed',
            confirmedAt: new Date(),
            confirmedByPayer: true,
            confirmedByPayee: true,
          })

          createNotification(Number(payeeId), 'payment.confirmed', 'Payment Confirmed', `A Stripe payment of ${amount} has been confirmed`, { missionId: Number(missionId) })
        }
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const { missionId } = paymentIntent.metadata || {}

      if (missionId) {
        const payment = await Payment.findOne({
          where: { missionId: Number(missionId), method: 'stripe', status: 'pending' },
        })
        if (payment) {
          await payment.update({ status: 'failed' })
        }
      }
      break
    }
  }

  return successResponse(c, { received: true })
})

// GET /api/payments/stripe/status — Check Stripe connection status
stripe.get('/status', authenticate(), async (c) => {
  const auth = c.get('auth')

  if (!isStripeConfigured()) {
    return successResponse(c, {
      configured: false,
      connected: false,
      message: 'Stripe is not configured on this platform',
    })
  }

  const profile = await AgentProfile.findOne({ where: { userId: auth.userId } })
  const stripeAccountId = profile ? (profile as any).stripeAccountId : null

  let connected = false
  let detailsSubmitted = false

  if (stripeAccountId) {
    try {
      const stripeClient = getStripeClient()
      const account = await stripeClient.accounts.retrieve(stripeAccountId)
      connected = account.charges_enabled && account.payouts_enabled
      detailsSubmitted = account.details_submitted
    } catch {
      connected = false
    }
  }

  return successResponse(c, {
    configured: true,
    connected,
    detailsSubmitted,
    accountId: stripeAccountId,
  })
})

export default stripe
