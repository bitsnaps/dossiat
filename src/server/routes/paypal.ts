import { Hono } from 'hono'
import { Client, Environment, OrdersController, CheckoutPaymentIntent } from '@paypal/paypal-server-sdk'
import { authenticate } from '@/server/middleware/auth'
import { validateRequest, validators } from '@/server/middleware/validateRequest'
import { successResponse } from '@/server/utils/apiResponse'
import { AppError } from '@/server/middleware/errorHandler'
import { AgentProfile, Payment, Mission } from '@/server/database/models'
import { createNotification } from '@/server/services/notification'

function isPaypalConfigured(): boolean {
  return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET)
}

function getOrdersController(): OrdersController {
  if (!isPaypalConfigured()) {
    throw new AppError('PayPal is not configured on this platform', 501)
  }

  const environment = process.env.PAYPAL_MODE === 'live'
    ? Environment.Production
    : Environment.Sandbox

  const client = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: process.env.PAYPAL_CLIENT_ID!,
      oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET!,
    },
    environment,
  })

  return new OrdersController(client)
}

const paypal = new Hono()

// POST /api/payments/paypal/setup — PayPal account setup for agent
paypal.post('/setup', authenticate(), async (c) => {
  if (!isPaypalConfigured()) {
    throw new AppError('PayPal is not configured on this platform', 501)
  }

  const auth = c.get('auth')
  const profile = await AgentProfile.findOne({ where: { userId: auth.userId } })
  if (!profile) throw new AppError('Agent profile not found', 404)

  const paypalEmail = (profile as any).paypalEmail

  return successResponse(c, {
    connected: !!paypalEmail,
    paypalEmail: paypalEmail || null,
    onboardingUrl: `https://www.paypal.com/bizsignup/partner/entry?partner_id=${process.env.PAYPAL_CLIENT_ID}&integration_type=THIRD_PARTY&product=PAYMENT_SOLUTIONS&return_url=${process.env.APP_URL || 'http://localhost:5173'}/settings/billing`,
  }, paypalEmail ? 'PayPal account connected' : 'Redirect to PayPal to connect account')
})

// POST /api/payments/paypal/create-order — Create PayPal order for a mission
paypal.post('/create-order',
  authenticate(),
  validateRequest({
    body: {
      missionId: validators.required(),
      amount: validators.required(),
    },
  }),
  async (c) => {
    if (!isPaypalConfigured()) {
      throw new AppError('PayPal is not configured on this platform', 501)
    }

    const ordersController = getOrdersController()
    const auth = c.get('auth')
    const { missionId, amount, currency } = await c.req.json()

    const mission = await Mission.findByPk(missionId)
    if (!mission) throw new AppError('Mission not found', 404)
    if (mission.agentId !== auth.userId && mission.clientId !== auth.userId) {
      throw new AppError('Access denied', 403)
    }

    const orderRequest = {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          amount: {
            currencyCode: currency || mission.currency || 'USD',
            value: Number(amount).toFixed(2),
          },
          description: `Payment for mission: ${mission.title}`,
          customId: `mission_${mission.id}`,
        },
      ],
      applicationContext: {
        returnUrl: `${process.env.APP_URL || 'http://localhost:5173'}/missions/${mission.id}?payment=success`,
        cancelUrl: `${process.env.APP_URL || 'http://localhost:5173'}/missions/${mission.id}?payment=cancelled`,
      },
    }

    const response = await ordersController.createOrder({ body: orderRequest })

    const result = response.result as any
    const approvalUrl = result.links?.find((l: any) => l.rel === 'approve')?.href

    return successResponse(c, {
      orderId: result.id,
      approvalUrl,
      status: result.status,
    }, 'PayPal order created')
  },
)

// POST /api/payments/paypal/capture — Capture a PayPal order after approval
paypal.post('/capture',
  authenticate(),
  validateRequest({ body: { orderId: validators.required() } }),
  async (c) => {
    if (!isPaypalConfigured()) {
      throw new AppError('PayPal is not configured on this platform', 501)
    }

    const ordersController = getOrdersController()
    const auth = c.get('auth')
    const { orderId, missionId } = await c.req.json()

    const response = await ordersController.captureOrder({
      id: orderId,
      prefer: 'return=representation',
    } as any)

    const order = response.result as any

    if (order.status !== 'COMPLETED') {
      throw new AppError('PayPal order was not completed', 400)
    }

    const capture = order.purchaseUnits?.[0]?.payments?.captures?.[0]
    if (!capture) throw new AppError('No capture found in order', 400)

    const captureAmount = parseFloat(capture.amount?.value || '0')
    const captureCurrency = capture.amount?.currencyCode || 'USD'

    // Record the payment if missionId provided
    if (missionId) {
      const mission = await Mission.findByPk(missionId)
      if (mission && mission.agentId !== null) {
        const agentId = mission.agentId
        const gatewayFee = captureAmount * 0.0349 + 0.49 // PayPal fee
        const platformFee = Math.max(1, captureAmount * 0.01)

        await Payment.create({
          missionId,
          payerId: auth.userId,
          payeeId: agentId,
          amount: captureAmount,
          currency: captureCurrency,
          method: 'paypal',
          platformFee,
          gatewayFee,
          netAmount: captureAmount - gatewayFee - platformFee,
          status: 'confirmed',
          confirmedAt: new Date(),
          confirmedByPayer: true,
          confirmedByPayee: true,
        })

        createNotification(agentId, 'payment.confirmed', 'Payment Confirmed', `A PayPal payment of ${captureAmount} ${captureCurrency} has been confirmed`, { missionId, orderId })
      }
    }

    return successResponse(c, {
      orderId,
      captureId: capture.id,
      status: capture.status,
      amount: captureAmount,
      currency: captureCurrency,
    }, 'PayPal order captured')
  },
)

// POST /api/payments/paypal/webhook — Handle PayPal webhook events
paypal.post('/webhook', async (c) => {
  if (!isPaypalConfigured()) {
    throw new AppError('PayPal is not configured on this platform', 501)
  }

  const body = await c.req.json()
  const eventType = body.event_type

  switch (eventType) {
    case 'PAYMENT.CAPTURE.COMPLETED': {
      // Handled via capture endpoint; webhook is a safety net
      break
    }

    case 'PAYMENT.CAPTURE.DENIED':
    case 'PAYMENT.CAPTURE.REFUNDED': {
      break
    }
  }

  return successResponse(c, { received: true })
})

// GET /api/payments/paypal/status — Check PayPal connection status
paypal.get('/status', authenticate(), async (c) => {
  const auth = c.get('auth')

  if (!isPaypalConfigured()) {
    return successResponse(c, {
      configured: false,
      connected: false,
      message: 'PayPal is not configured on this platform',
    })
  }

  const profile = await AgentProfile.findOne({ where: { userId: auth.userId } })
  const paypalEmail = profile ? (profile as any).paypalEmail : null

  return successResponse(c, {
    configured: true,
    connected: !!paypalEmail,
    paypalEmail: paypalEmail || null,
  })
})

export default paypal
