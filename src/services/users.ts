import { get, put, post } from './api'

export function getMe() {
  return get('/users/me')
}

export function updateMe(data: {
  firstName?: string
  lastName?: string
}) {
  return put('/users/me', data)
}

export function changePassword(data: {
  currentPassword: string
  newPassword: string
}) {
  return put('/users/me/password', data)
}

export function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('avatar', file)
  return post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function getAgentProfile(slug: string) {
  return get(`/users/agents/${slug}`)
}

export function generateInviteLink() {
  return post('/users/agents/me/invite-link')
}

export function updateAgentProfile(data: {
  bio?: string
  specialties?: string[]
  acceptedClientTypes?: 'B2B' | 'B2C' | 'Both'
  currency?: string
  timezone?: string
}) {
  return put('/users/agents/me', data)
}

export function getClientProfile() {
  return get('/clients/me')
}

export function updateClientProfile(data: {
  companyName?: string
  companySize?: string
  industry?: string
}) {
  return put('/clients/me', data)
}

export function getNetworkUsers(role?: 'client' | 'agent') {
  const query = role ? `?role=${role}` : ''
  return get(`/users/network${query}`)
}

export function discoverAgents(params?: {
  q?: string
  clientType?: 'B2B' | 'B2C' | 'Both'
  limit?: number
  offset?: number
}) {
  return get('/users/agents/discover', { params })
}
