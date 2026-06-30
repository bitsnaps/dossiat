import { ref } from 'vue'

interface ConfirmOptions {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'accent'
}

export function useConfirmDialog() {
  const isVisible = ref(false)
  const title = ref('')
  const message = ref('')
  const confirmLabel = ref('Confirm')
  const cancelLabel = ref('Cancel')
  const variant = ref<'danger' | 'accent'>('accent')

  let resolvePromise: ((value: boolean) => void) | null = null

  function showConfirm(options: ConfirmOptions): Promise<boolean> {
    title.value = options.title
    message.value = options.message ?? ''
    confirmLabel.value = options.confirmLabel ?? 'Confirm'
    cancelLabel.value = options.cancelLabel ?? 'Cancel'
    variant.value = options.variant ?? 'accent'
    isVisible.value = true

    return new Promise<boolean>((resolve) => {
      resolvePromise = resolve
    })
  }

  function confirm() {
    isVisible.value = false
    resolvePromise?.(true)
    resolvePromise = null
  }

  function cancel() {
    isVisible.value = false
    resolvePromise?.(false)
    resolvePromise = null
  }

  return {
    isVisible,
    title,
    message,
    confirmLabel,
    cancelLabel,
    variant,
    showConfirm,
    confirm,
    cancel,
  }
}
