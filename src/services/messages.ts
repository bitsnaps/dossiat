import { get, post } from './api'

export function getMessages(missionId: string) {
  return get(`/missions/${missionId}/messages`)
}

export function sendMessage(missionId: string, content: string) {
  return post(`/missions/${missionId}/messages`, { content })
}

export function markAsRead(messageId: string) {
  return post(`/messages/${messageId}/read`)
}

export function getUnreadCount() {
  return get('/messages/unread-count')
}
