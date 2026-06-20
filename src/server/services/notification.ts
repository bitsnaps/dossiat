import { Notification } from '@/server/database/models'

export type NotificationType =
  | 'mission.created'
  | 'mission.agreed'
  | 'mission.status_changed'
  | 'mission.completed'
  | 'mission.cancelled'
  | 'message.received'
  | 'payment.recorded'
  | 'payment.confirmed'
  | 'payment.failed'
  | 'dispute.created'
  | 'dispute.resolved'
  | 'dispute.escalated'
  | 'subscription.activated'
  | 'subscription.cancelled'
  | 'subscription.plan_changed'
  | 'recurrence.mission_generated'
  | 'invoice.generated'

/**
 * Create a single notification for a user.
 * Fire-and-forget: logs errors and returns null instead of throwing.
 */
export async function createNotification(
  userId: number,
  type: NotificationType | string,
  title: string,
  body: string,
  data: Record<string, unknown> = {},
): Promise<Notification | null> {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      body,
      data,
    })
    return notification
  } catch (error) {
    console.error(`Failed to create notification for user ${userId}:`, error)
    return null
  }
}

/**
 * Create notifications for multiple users at once.
 * Fire-and-forget: logs errors and returns whatever was successfully created.
 */
export async function bulkCreateNotifications(
  userIds: number[],
  type: NotificationType | string,
  title: string,
  body: string,
  data: Record<string, unknown> = {},
): Promise<Notification[]> {
  if (userIds.length === 0) return []

  try {
    const notifications = await Promise.all(
      userIds.map((userId) =>
        Notification.create({ userId, type, title, body, data })
      ),
    )
    return notifications
  } catch (error) {
    console.error(`Failed to bulk create notifications:`, error)
    return []
  }
}
