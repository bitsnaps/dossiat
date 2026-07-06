import { get, post, put, del } from './api'

interface MissionListParams {
  status?: string
  type?: string
  page?: number
  limit?: number
}

export interface CreateMissionData {
  title: string
  description?: string
  clientId?: string
  pricingType: 'fixed' | 'hourly' | 'task_based'
  agreedAmount?: number
  currency?: string
  agreedChecklist?: string[]
}

export interface ClaimMissionData {
  agreedAmount?: number
}

export function getMissions(params?: MissionListParams) {
  return get('/missions', params ? { params } : undefined)
}

export function createMission(data: CreateMissionData) {
  return post('/missions', data)
}

export function getMission(id: string) {
  return get(`/missions/${id}`)
}

export function updateMission(id: string, data: Partial<CreateMissionData>) {
  return put(`/missions/${id}`, data)
}

export function deleteMission(id: string) {
  return del(`/missions/${id}`)
}

export function agreeMission(id: string) {
  return post(`/missions/${id}/agree`)
}

export function claimMission(id: string, data?: ClaimMissionData) {
  return post(`/missions/${id}/claim`, data)
}

export function createBulkMissions(missions: CreateMissionData[]) {
  return post('/missions/bulk', { missions })
}

export function getAgreementStatus(id: string) {
  return get(`/missions/${id}/agreement-status`)
}

export function updateMissionStatus(id: string, status: string) {
  return put(`/missions/${id}/status`, { status })
}

export function uploadAttachment(id: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return post(`/missions/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function getAttachments(id: string) {
  return get(`/missions/${id}/attachments`)
}
