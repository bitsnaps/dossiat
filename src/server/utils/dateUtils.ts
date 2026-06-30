/**
 * Calculate the next run date for a recurrent mission.
 *
 * Edge cases handled:
 * - Monthly: clamps dayOfMonth to the last day of the target month
 *   (e.g., Jan 31 → Feb 28/29)
 * - Weekly: properly multiplies interval across weeks
 */
export function calculateNextRun(
  frequency: string,
  interval: number,
  dayOfMonth?: number | null,
  dayOfWeek?: number | null,
): Date {
  const now = new Date()
  const next = new Date(now)

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + interval)
      break

    case 'weekly':
      if (dayOfWeek != null) {
        const currentDay = next.getDay()
        let daysUntil = dayOfWeek - currentDay
        if (daysUntil <= 0) daysUntil += 7
        next.setDate(next.getDate() + daysUntil + (interval - 1) * 7)
      } else {
        next.setDate(next.getDate() + interval * 7)
      }
      break

    case 'monthly':
      if (dayOfMonth != null) {
        // Advance by `interval` months first
        const targetMonth = next.getMonth() + interval
        const targetYear = next.getFullYear() + Math.floor(targetMonth / 12)
        const normalizedMonth = ((targetMonth % 12) + 12) % 12

        // Clamp to last day of the target month
        const lastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate()
        const clampedDay = Math.min(dayOfMonth, lastDay)

        next.setFullYear(targetYear, normalizedMonth, clampedDay)

        // If the resulting date is still in the past or same as now, push forward
        if (next <= now) {
          const nextTargetMonth = normalizedMonth + 1
          const nextTargetYear = targetYear + Math.floor(nextTargetMonth / 12)
          const nextNormalizedMonth = ((nextTargetMonth % 12) + 12) % 12
          const nextLastDay = new Date(nextTargetYear, nextNormalizedMonth + 1, 0).getDate()
          const nextClampedDay = Math.min(dayOfMonth, nextLastDay)
          next.setFullYear(nextTargetYear, nextNormalizedMonth, nextClampedDay)
        }
      } else {
        next.setMonth(next.getMonth() + interval)
      }
      break

    case 'annual':
      next.setFullYear(next.getFullYear() + interval)
      break
  }

  return next
}
