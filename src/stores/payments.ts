import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ApiResponse } from '@/server/utils/apiResponse'
import {
  getPayments as apiGetPayments,
  getCreditBalance as apiGetCreditBalance,
  getCreditTransactions as apiGetCreditTransactions,
  getInvoices as apiGetInvoices,
} from '@/services/payments'

interface Payment {
  id: number
  missionId: number
  amount: number
  currency: string
  method: string
  status: string
  createdAt?: string
}

interface CreditBalance {
  balance: number
  currency: string
}

interface Invoice {
  id: number
  periodStart: string
  periodEnd: string
  totalFees: number
  currency: string
  status: string
}

export const usePaymentsStore = defineStore('payments', () => {
  const payments = ref<Payment[]>([])
  const creditBalance = ref<CreditBalance | null>(null)
  const invoices = ref<Invoice[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

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

  async function fetchCreditBalance() {
    try {
      const response = await apiGetCreditBalance() as ApiResponse<CreditBalance>
      creditBalance.value = response.data!
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch credit balance'
    }
  }

  async function fetchCreditTransactions() {
    loading.value = true
    try {
      const response = await apiGetCreditTransactions() as ApiResponse<unknown[]>
      return response.data || []
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch transactions'
      return []
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

  return {
    payments,
    creditBalance,
    invoices,
    loading,
    error,
    fetchPayments,
    fetchCreditBalance,
    fetchCreditTransactions,
    fetchInvoices,
  }
})
