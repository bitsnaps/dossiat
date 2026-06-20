import { get, post, put } from './api'

export function getDisputes() {
  return get('/disputes')
}

export function getDispute(id: string) {
  return get(`/disputes/${id}`)
}

export function sendMessage(disputeId: string, content: string) {
  return post(`/disputes/${disputeId}/messages`, { content })
}

export function resolveDispute(id: string, resolution: string) {
  return put(`/disputes/${id}/resolve`, { resolution })
}

export function escalateDispute(id: string) {
  return put(`/disputes/${id}/escalate`)
}
