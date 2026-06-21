import { onMounted, onUnmounted } from 'vue'
import { useMessagesStore } from '@/stores/messages'

/**
 * Composable that polls the unread message count at a fixed interval.
 * Auto-cleans up on unmount. Only polls when user is authenticated.
 */
export function useMessagePolling(intervalMs = 30_000) {
  const messagesStore = useMessagesStore()
  let timer: ReturnType<typeof setInterval> | null = null

  function start() {
    if (timer) return
    messagesStore.fetchUnreadCount()
    timer = setInterval(() => {
      messagesStore.fetchUnreadCount()
    }, intervalMs)
  }

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  onMounted(start)
  onUnmounted(stop)

  return { start, stop }
}
