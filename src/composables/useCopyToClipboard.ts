import { ref, computed } from 'vue'

export function useCopyToClipboard() {
  const copied = ref(false)

  const isSupported = computed(() =>
    typeof navigator !== 'undefined' && !!navigator.clipboard?.writeText,
  )

  async function copy(text: string): Promise<boolean> {
    copied.value = false
    if (!isSupported.value) {
      return false
    }
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      return true
    } catch {
      copied.value = false
      return false
    }
  }

  return {
    copied,
    isSupported,
    copy,
  }
}
