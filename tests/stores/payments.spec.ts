import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockGetPayments = vi.fn()
const mockGetCreditBalance = vi.fn()
const mockGetCreditTransactions = vi.fn()
const mockGetInvoices = vi.fn()

vi.mock('@/services/payments', () => ({
  getPayments: (...args: unknown[]) => mockGetPayments(...args),
  getCreditBalance: (...args: unknown[]) => mockGetCreditBalance(...args),
  getCreditTransactions: (...args: unknown[]) => mockGetCreditTransactions(...args),
  getInvoices: (...args: unknown[]) => mockGetInvoices(...args),
}))

import { usePaymentsStore } from '@/stores/payments'

describe('Payments Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('has empty payments', () => {
      const store = usePaymentsStore()
      expect(store.payments).toEqual([])
      expect(store.creditBalance).toBeNull()
      expect(store.invoices).toEqual([])
    })
  })

  describe('fetchPayments()', () => {
    it('loads payments from API', async () => {
      mockGetPayments.mockResolvedValueOnce({
        success: true,
        data: [{ id: 1, missionId: 1, amount: 100, currency: 'USD', method: 'cash', status: 'pending' }],
      })

      const store = usePaymentsStore()
      await store.fetchPayments('1')

      expect(store.payments).toHaveLength(1)
      expect(mockGetPayments).toHaveBeenCalledWith('1')
    })
  })

  describe('fetchCreditBalance()', () => {
    it('loads credit balance', async () => {
      mockGetCreditBalance.mockResolvedValueOnce({
        success: true,
        data: { balance: 50, currency: 'USD' },
      })

      const store = usePaymentsStore()
      await store.fetchCreditBalance()

      expect(store.creditBalance).toEqual({ balance: 50, currency: 'USD' })
    })
  })

  describe('fetchInvoices()', () => {
    it('loads invoices', async () => {
      mockGetInvoices.mockResolvedValueOnce({
        success: true,
        data: [{ id: 1, periodStart: '2026-01-01', periodEnd: '2026-01-31', totalFees: 10, currency: 'USD', status: 'paid' }],
      })

      const store = usePaymentsStore()
      await store.fetchInvoices()

      expect(store.invoices).toHaveLength(1)
    })
  })
})
