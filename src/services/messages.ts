import { get, post } from './api'

export function getConversations() {
  return get('/conversations')
}

export function getMessages(missionId: string, page = 1, limit = 50) {
  return get(`/missions/${missionId}/messages`, { params: { page, limit } })
}

export function sendMessage(missionId: string, content: string) {
  return post(`/missions/${missionId}/messages`, { content })
}

export function markAsRead(messageId: string) {
  return post(`/messages/${messageId}/read`)
}

export function markAllAsRead(conversationId: string) {
  return post(`/conversations/${conversationId}/read-all`)
}

export function getUnreadCount() {
  return get('/messages/unread-count')
}
