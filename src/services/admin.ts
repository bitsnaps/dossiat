import { get, post, put, del } from './api'

// ─── Stats ───

export function getStats() {
  return get('/admin/stats')
}

// ─── Users ───

export function getUsers(params?: { page?: number; limit?: number; search?: string; role?: string }) {
  return get('/admin/users', { params })
}

export function getUser(id: string) {
  return get(`/admin/users/${id}`)
}

export function updateUser(id: string, data: { role?: string; emailVerified?: boolean }) {
  return put(`/admin/users/${id}`, data)
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

// ─── Disputes ───

export function getDisputes(params?: { page?: number; limit?: number; status?: string }) {
  return get('/admin/disputes', { params })
}

export function getDispute(id: string) {
  return get(`/admin/disputes/${id}`)
}

export function resolveDispute(id: string, resolution: string) {
  return put(`/admin/disputes/${id}/resolve`, { resolution })
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
