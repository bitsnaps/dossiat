import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ApiResponse } from '@/server/utils/apiResponse'
import {
  getAllPayments as apiGetAllPayments,
  getPayments as apiGetPayments,
  recordPayment as apiRecordPayment,
  confirmPayer as apiConfirmPayer,
  confirmPayee as apiConfirmPayee,
  getCreditBalance as apiGetCreditBalance,
  purchaseCredits as apiPurchaseCredits,
  getCreditTransactions as apiGetCreditTransactions,
  getInvoices as apiGetInvoices,
  getStripeStatus as apiGetStripeStatus,
  connectStripe as apiConnectStripe,
} from '@/services/payments'

export interface Payment {
  id: number
  missionId: number
  mission?: { id: number; title: string }
  payerId: number
  payeeId: number
  amount: number
  currency: string
  method: string
  status: string
  platformFee?: number
  gatewayFee?: number
  netAmount?: number
  confirmedByPayer?: boolean
  confirmedByPayee?: boolean
  confirmedAt?: string
  createdAt?: string
}

interface CreditBalance {
  balance: number
  currency: string
}

interface CreditTransaction {
  id: number
  type: string
  amount: number
  description: string
  createdAt?: string
}

export interface Invoice {
  id: number
  periodStart: string
  periodEnd: string
  totalFees: number
  currency: string
  status: string
  paidAt?: string
  createdAt?: string
}

interface StripeStatus {
  configured: boolean
  connected: boolean
  detailsSubmitted?: boolean
  accountId?: string
}

export const usePaymentsStore = defineStore('payments', () => {
  const payments = ref<Payment[]>([])
  const creditBalance = ref<CreditBalance | null>(null)
  const creditTransactions = ref<CreditTransaction[]>([])
  const invoices = ref<Invoice[]>([])
  const stripeStatus = ref<StripeStatus | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAllPayments() {
    loading.value = true
    error.value = null
    try {
      const response = await apiGetAllPayments() as ApiResponse<Payment[]>
      payments.value = response.data || []
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch payments'
    } finally {
      loading.value = false
    }
  }

  async function fetchPayments(missionId: string) {
    loading.value = true
    error.value = null
    try {
      const response = await apiGetPayments(missionId) as ApiResponse<Payment[]>
      payments.value = response.data || []
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch payments'
    } finally {
      loading.value = false
    }
  }

  async function recordPayment(missionId: string, data: {
    amount: number
    currency: string
    method: 'cash' | 'stripe' | 'paypal' | 'bank_transfer'
    payeeId?: string
  }) {
    loading.value = true
    error.value = null
    try {
      const response = await apiRecordPayment(missionId, data) as ApiResponse<Payment>
      return response.data!
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to record payment'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function confirmPayer(paymentId: string) {
    error.value = null
    try {
      const response = await apiConfirmPayer(paymentId) as ApiResponse<Payment>
      const payment = response.data!
      const idx = payments.value.findIndex((p) => p.id === payment.id)
      if (idx !== -1) payments.value[idx] = payment
      return payment
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to confirm payment'
      throw err
    }
  }

  async function confirmPayee(paymentId: string) {
    error.value = null
    try {
      const response = await apiConfirmPayee(paymentId) as ApiResponse<Payment>
      const payment = response.data!
      const idx = payments.value.findIndex((p) => p.id === payment.id)
      if (idx !== -1) payments.value[idx] = payment
      return payment
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to confirm payment'
      throw err
    }
  }

  async function fetchCreditBalance() {
    try {
      const response = await apiGetCreditBalance() as ApiResponse<CreditBalance>
      creditBalance.value = response.data!
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch credit balance'
    }
  }

  async function purchaseCredits(amount: number) {
    error.value = null
    try {
      const response = await apiPurchaseCredits(amount) as ApiResponse<CreditBalance>
      creditBalance.value = response.data!
      return response.data!
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to purchase credits'
      throw err
    }
  }

  async function fetchCreditTransactions() {
    loading.value = true
    try {
      const response = await apiGetCreditTransactions() as ApiResponse<CreditTransaction[]>
      creditTransactions.value = response.data || []
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch transactions'
    } finally {
      loading.value = false
    }
  }

  async function fetchInvoices() {
    loading.value = true
    try {
      const response = await apiGetInvoices() as ApiResponse<Invoice[]>
      invoices.value = response.data || []
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch invoices'
    } finally {
      loading.value = false
    }
  }

  async function fetchStripeStatus() {
    error.value = null
    try {
      const response = await apiGetStripeStatus() as ApiResponse<StripeStatus>
      stripeStatus.value = response.data!
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch Stripe status'
    }
  }

  async function connectStripe() {
    error.value = null
    try {
      const response = await apiConnectStripe() as ApiResponse<{ accountId: string; url: string }>
      return response.data!
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to connect Stripe'
      throw err
    }
  }

  return {
    payments,
    creditBalance,
    creditTransactions,
    invoices,
    stripeStatus,
    loading,
    error,
    fetchAllPayments,
    fetchPayments,
    recordPayment,
    confirmPayer,
    confirmPayee,
    fetchCreditBalance,
    purchaseCredits,
    fetchCreditTransactions,
    fetchInvoices,
    fetchStripeStatus,
    connectStripe,
  }
})
