type PaymentMethod = 'cash' | 'stripe' | 'paypal' | 'bank_transfer'

interface FeeBreakdown {
  gatewayFee: number
  platformFee: number
  netAmount: number
}

const GATEWAY_FEE_RATE = 0.029 // 2.9%
const GATEWAY_FEE_FIXED = 0.30 // $0.30
const PLATFORM_FEE_RATE = 0.01 // 1%
const PLATFORM_FEE_MINIMUM = 1.0 // $1

/**
 * Calculate the gateway fee based on payment method.
 * Cash and bank_transfer have no gateway fees.
 * Stripe and PayPal charge 2.9% + $0.30.
 */
function calculateGatewayFee(amount: number, method: PaymentMethod): number {
  if (method === 'cash' || method === 'bank_transfer') {
    return 0
  }
  const fee = amount * GATEWAY_FEE_RATE + GATEWAY_FEE_FIXED
  return Math.round(fee * 100) / 100
}

/**
 * Calculate the platform fee: 1% of the net amount (after gateway fees),
 * with a minimum of $1.
 */
function calculatePlatformFee(netAmount: number): number {
  const fee = netAmount * PLATFORM_FEE_RATE
  return Math.max(Math.round(fee * 100) / 100, PLATFORM_FEE_MINIMUM)
}

/**
 * Calculate all fees for a payment and return the breakdown.
 * Platform fee is calculated on the net amount after gateway fees.
 */
function calculateAllFees(amount: number, method: PaymentMethod): FeeBreakdown {
  const gatewayFee = calculateGatewayFee(amount, method)
  const amountAfterGateway = Math.round((amount - gatewayFee) * 100) / 100
  const platformFee = calculatePlatformFee(amountAfterGateway)
  const netAmount = Math.round((amount - platformFee - gatewayFee) * 100) / 100

  return {
    gatewayFee,
    platformFee,
    netAmount: Math.max(netAmount, 0),
  }
}

export { calculateGatewayFee, calculatePlatformFee, calculateAllFees }
export type { PaymentMethod, FeeBreakdown }
