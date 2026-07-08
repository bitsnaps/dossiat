import { get, post, put, patch, del } from './api'

// ─── Stats ───

export function getStats() {
  return get('/admin/stats')
}

export function getRevenueStats(params?: { period?: string; from?: string; to?: string }) {
  return get('/admin/stats/revenue', { params })
}

export function getActivityFeed(params?: { limit?: number }) {
  return get('/admin/stats/activity', { params })
}

// ─── Users ───

export function getUsers(params?: { page?: number; limit?: number; search?: string; role?: string }) {
  return get('/admin/users', { params })
}

export function getUser(id: string) {
  return get(`/admin/users/${id}`)
}

export function createUser(data: { email: string; firstName: string; lastName: string; role?: string; password: string }) {
  return post('/admin/users', data)
}

export function updateUser(id: string, data: {
  firstName?: string
  lastName?: string
  email?: string
  role?: string
  emailVerified?: boolean
}) {
  return put(`/admin/users/${id}`, data)
}

export function resetUserPassword(id: string, password: string) {
  return patch(`/admin/users/${id}/reset-password`, { password })
}

export function deactivateUser(id: string) {
  return patch(`/admin/users/${id}/deactivate`)
}

export function activateUser(id: string) {
  return patch(`/admin/users/${id}/activate`)
}

export function deleteUser(id: string) {
  return del(`/admin/users/${id}`)
}

// ─── Missions ───

export function getMissions(params?: { page?: number; limit?: number; status?: string; search?: string; type?: string }) {
  return get('/admin/missions', { params })
}

export function getMission(id: string) {
  return get(`/admin/missions/${id}`)
}

export function createMission(data: {
  agentId: number
  clientId: number
  title: string
  description?: string
  type?: string
  pricingType: string
  agreedAmount?: number
  currency?: string
  agreedChecklist?: string[]
}) {
  return post('/admin/missions', data)
}

export function updateMission(id: string, data: {
  title?: string
  description?: string
  type?: string
  pricingType?: string
  agreedAmount?: number
  currency?: string
  agreedChecklist?: string[]
}) {
  return put(`/admin/missions/${id}`, data)
}

export function deleteMission(id: string) {
  return del(`/admin/missions/${id}`)
}

export function updateMissionStatus(id: string, status: string) {
  return put(`/admin/missions/${id}/status`, { status })
}

// ─── Payments ───

export function getPayments(params?: { page?: number; limit?: number; status?: string; method?: string }) {
  return get('/admin/payments', { params })
}

export function getPayment(id: string) {
  return get(`/admin/payments/${id}`)
}

export function createPayment(data: {
  missionId: number
  payerId: number
  payeeId: number
  amount: number
  method: string
  currency?: string
  status?: string
}) {
  return post('/admin/payments', data)
}

export function updatePayment(id: string, data: {
  amount?: number
  method?: string
  currency?: string
  status?: string
}) {
  return put(`/admin/payments/${id}`, data)
}

export function deletePayment(id: string) {
  return del(`/admin/payments/${id}`)
}

export function updatePaymentStatus(id: string, status: string) {
  return patch(`/admin/payments/${id}/status`, { status })
}

// ─── Disputes ───

export function getDisputes(params?: { page?: number; limit?: number; status?: string; search?: string }) {
  return get('/admin/disputes', { params })
}

export function getDispute(id: string) {
  return get(`/admin/disputes/${id}`)
}

export function createDispute(data: { missionId: number; initiatedBy: number; reason: string }) {
  return post('/admin/disputes', data)
}

export function updateDispute(id: string, data: { reason?: string; status?: string; resolution?: string }) {
  return put(`/admin/disputes/${id}`, data)
}

export function deleteDispute(id: string) {
  return del(`/admin/disputes/${id}`)
}

export function resolveDispute(id: string, resolution: string) {
  return put(`/admin/disputes/${id}/resolve`, { resolution })
}

export function escalateDispute(id: string) {
  return put(`/admin/disputes/${id}/escalate`)
}

export function updateDisputeStatus(id: string, status: string) {
  return patch(`/admin/disputes/${id}/status`, { status })
}

export function sendDisputeMessage(id: string, content: string) {
  return post(`/admin/disputes/${id}/messages`, { content })
}

// ─── Subscription Plans ───

export function getPlans() {
  return get('/admin/subscription-plans')
}

export function createPlan(data: { name: string; price: number; currency?: string; interval?: string; maxSeats?: number; maxRecurrentMissions?: number; features?: Record<string, unknown> }) {
  return post('/admin/subscription-plans', data)
}

export function updatePlan(id: string, data: Record<string, unknown>) {
  return put(`/admin/subscription-plans/${id}`, data)
}

export function deletePlan(id: string) {
  return del(`/admin/subscription-plans/${id}`)
}
