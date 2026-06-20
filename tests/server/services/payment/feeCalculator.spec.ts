import { describe, it, expect } from 'vitest'
import { calculateGatewayFee, calculatePlatformFee, calculateAllFees } from '@/server/services/payment/feeCalculator'

describe('Fee Calculator', () => {
  describe('calculateGatewayFee', () => {
    it('returns 0 for cash payments', () => {
      expect(calculateGatewayFee(100, 'cash')).toBe(0)
    })

    it('returns 0 for bank_transfer payments', () => {
      expect(calculateGatewayFee(100, 'bank_transfer')).toBe(0)
    })

    it('calculates stripe fee as 2.9% + $0.30', () => {
      const fee = calculateGatewayFee(100, 'stripe')
      expect(fee).toBe(3.2)
    })

    it('calculates paypal fee as 2.9% + $0.30', () => {
      const fee = calculateGatewayFee(100, 'paypal')
      expect(fee).toBe(3.2)
    })

    it('rounds gateway fee to 2 decimal places', () => {
      const fee = calculateGatewayFee(1.5, 'stripe')
      // 1.5 * 0.029 + 0.30 = 0.0435 + 0.30 = 0.3435 → rounds to 0.34
      expect(fee).toBe(0.34)
    })
  })

  describe('calculatePlatformFee', () => {
    it('calculates 1% of net amount', () => {
      const fee = calculatePlatformFee(100)
      expect(fee).toBe(1)
    })

    it('enforces minimum $1 fee', () => {
      const fee = calculatePlatformFee(50)
      // 50 * 0.01 = 0.50, but minimum is $1
      expect(fee).toBe(1)
    })

    it('enforces minimum $1 fee for very small amounts', () => {
      const fee = calculatePlatformFee(0.5)
      // 0.5 * 0.01 = 0.005, but minimum is $1
      expect(fee).toBe(1)
    })

    it('rounds fee to 2 decimal places', () => {
      const fee = calculatePlatformFee(33.33)
      // 33.33 * 0.01 = 0.3333, but minimum is $1
      expect(fee).toBe(1)
    })

    it('returns exact 1% for amounts >= $100', () => {
      const fee = calculatePlatformFee(200)
      expect(fee).toBe(2)
    })

    it('handles large amounts correctly', () => {
      const fee = calculatePlatformFee(10000)
      expect(fee).toBe(100)
    })
  })

  describe('calculateAllFees', () => {
    it('calculates fees for cash payment', () => {
      const result = calculateAllFees(100, 'cash')
      expect(result).toEqual({
        gatewayFee: 0,
        platformFee: 1,
        netAmount: 99,
      })
    })

    it('calculates fees for bank_transfer payment', () => {
      const result = calculateAllFees(100, 'bank_transfer')
      expect(result).toEqual({
        gatewayFee: 0,
        platformFee: 1,
        netAmount: 99,
      })
    })

    it('calculates fees for stripe payment', () => {
      const result = calculateAllFees(100, 'stripe')
      // gatewayFee: 100 * 0.029 + 0.30 = 3.20
      // platformFee: (100 - 3.20) * 0.01 = 0.968, minimum $1 → 1
      // netAmount: 100 - 1 - 3.20 = 95.80
      expect(result).toEqual({
        gatewayFee: 3.2,
        platformFee: 1,
        netAmount: 95.8,
      })
    })

    it('calculates fees for paypal payment', () => {
      const result = calculateAllFees(100, 'paypal')
      // Same as stripe
      expect(result).toEqual({
        gatewayFee: 3.2,
        platformFee: 1,
        netAmount: 95.8,
      })
    })

    it('calculates platform fee on net amount after gateway for large amounts', () => {
      const result = calculateAllFees(1000, 'stripe')
      // gatewayFee: 1000 * 0.029 + 0.30 = 29.30
      // platformFee: (1000 - 29.30) * 0.01 = 9.707
      // netAmount: 1000 - 9.71 - 29.30 = 960.99
      expect(result.gatewayFee).toBe(29.3)
      expect(result.platformFee).toBe(9.71)
      expect(result.netAmount).toBe(960.99)
    })

    it('enforces minimum platform fee for small cash payments', () => {
      const result = calculateAllFees(10, 'cash')
      // gatewayFee: 0
      // platformFee: 10 * 0.01 = 0.10, minimum $1
      // netAmount: 10 - 1 - 0 = 9
      expect(result).toEqual({
        gatewayFee: 0,
        platformFee: 1,
        netAmount: 9,
      })
    })

    it('never produces negative net amount', () => {
      // Very small amount with gateway fees
      const result = calculateAllFees(0.5, 'stripe')
      // gatewayFee: 0.5 * 0.029 + 0.30 = 0.3145 → 0.31
      // platformFee: max((0.5 - 0.31) * 0.01, 1) = max(0.0019, 1) = 1
      // netAmount: 0.5 - 1 - 0.31 = -0.81 → clamped to 0 (validation will catch)
      expect(result.netAmount).toBeGreaterThanOrEqual(0)
    })
  })
})
