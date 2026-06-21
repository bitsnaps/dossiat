import { get, post, put, del } from './api'

export interface RecurrenceData {
  frequency: 'daily' | 'weekly' | 'monthly' | 'annual'
  interval: number
  dayOfMonth?: number | null
  dayOfWeek?: number | null
}

export function getRecurrences() {
  return get('/recurrences')
}

export function createRecurrence(missionId: string, data: RecurrenceData) {
  return post(`/missions/${missionId}/recurrence`, data)
}

export function updateRecurrence(missionId: string, data: RecurrenceData) {
  return put(`/missions/${missionId}/recurrence`, data)
}

export function deleteRecurrence(missionId: string) {
  return del(`/missions/${missionId}/recurrence`)
}
