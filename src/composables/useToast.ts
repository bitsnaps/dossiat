import { ref } from 'vue'

export interface Toast {
  id: number
  variant: 'info' | 'success' | 'warning' | 'danger'
  message: string
  title?: string
  duration?: number
}

export const toasts = ref<Toast[]>([])
let nextId = 0
const timers = new Map<number, ReturnType<typeof setTimeout>>()

const DEFAULT_DURATION = 5000

function addToast(options: Omit<Toast, 'id'>): number {
  const id = ++nextId
  const toast: Toast = { ...options, id }
  toasts.value.push(toast)

  if (options.duration !== 0) {
    const duration = options.duration ?? DEFAULT_DURATION
    const timer = setTimeout(() => {
      removeToast(id)
    }, duration)
    timers.set(id, timer)
  }

  return id
}

function removeToast(id: number) {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

export function useToast() {
  function success(message: string, options?: { title?: string; duration?: number }) {
    return addToast({ variant: 'success', message, ...options })
  }

  function error(message: string, options?: { title?: string; duration?: number }) {
    return addToast({ variant: 'danger', message, ...options })
  }

  function warning(message: string, options?: { title?: string; duration?: number }) {
    return addToast({ variant: 'warning', message, ...options })
  }

  function info(message: string, options?: { title?: string; duration?: number }) {
    return addToast({ variant: 'info', message, ...options })
  }

  function clearAll() {
    for (const timer of timers.values()) {
      clearTimeout(timer)
    }
    timers.clear()
    toasts.value = []
  }

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  }
}
