import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}))

import { get, post } from '@/services/api'
import {
  getPayments,
  recordPayment,
  confirmPayer,
  confirmPayee,
  getCreditBalance,
  purchaseCredits,
  getCreditTransactions,
  getInvoices,
} from '@/services/payments'

const mockGet = vi.mocked(get)
const mockPost = vi.mocked(post)

describe('Payments Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPayments()', () => {
    it('calls GET /api/missions/:id/payments', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: [] } as any)

      const result = await getPayments('1')

      expect(mockGet).toHaveBeenCalledWith('/missions/1/payments')
      expect(result).toEqual({ success: true, data: [] })
    })
  })

  describe('recordPayment()', () => {
    it('calls POST /api/missions/:id/payments with payment data', async () => {
      mockPost.mockResolvedValueOnce({ success: true, data: { id: 1 } } as any)

      const result = await recordPayment('1', { amount: 100, currency: 'USD', method: 'cash' })

      expect(mockPost).toHaveBeenCalledWith('/missions/1/payments', {
        amount: 100,
        currency: 'USD',
        method: 'cash',
      })
      expect(result).toEqual({ success: true, data: { id: 1 } })
    })
  })

  describe('confirmPayer()', () => {
    it('calls POST /api/payments/:id/confirm-payer', async () => {
      mockPost.mockResolvedValueOnce({ success: true } as any)

      const result = await confirmPayer('1')

      expect(mockPost).toHaveBeenCalledWith('/payments/1/confirm-payer')
      expect(result).toEqual({ success: true })
    })
  })

  describe('confirmPayee()', () => {
    it('calls POST /api/payments/:id/confirm-payee', async () => {
      mockPost.mockResolvedValueOnce({ success: true } as any)

      const result = await confirmPayee('1')

      expect(mockPost).toHaveBeenCalledWith('/payments/1/confirm-payee')
      expect(result).toEqual({ success: true })
    })
  })

  describe('getCreditBalance()', () => {
    it('calls GET /api/agents/me/credits', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: { balance: 50 } } as any)

      const result = await getCreditBalance()

      expect(mockGet).toHaveBeenCalledWith('/agents/me/credits')
      expect(result).toEqual({ success: true, data: { balance: 50 } })
    })
  })

  describe('purchaseCredits()', () => {
    it('calls POST /api/agents/me/credits/purchase with amount', async () => {
      mockPost.mockResolvedValueOnce({ success: true } as any)

      const result = await purchaseCredits(100)

      expect(mockPost).toHaveBeenCalledWith('/agents/me/credits/purchase', { amount: 100 })
      expect(result).toEqual({ success: true })
    })
  })

  describe('getCreditTransactions()', () => {
    it('calls GET /api/agents/me/credit-transactions', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: [] } as any)

      const result = await getCreditTransactions()

      expect(mockGet).toHaveBeenCalledWith('/agents/me/credit-transactions')
      expect(result).toEqual({ success: true, data: [] })
    })
  })

  describe('getInvoices()', () => {
    it('calls GET /api/agents/me/invoices', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: [] } as any)

      const result = await getInvoices()

      expect(mockGet).toHaveBeenCalledWith('/agents/me/invoices')
      expect(result).toEqual({ success: true, data: [] })
    })
  })
})
