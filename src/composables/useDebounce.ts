import { ref } from 'vue'

interface DebounceOptions {
  delay?: number
  initialValue?: string
}

export function useDebounce(options: DebounceOptions = {}) {
  const delay = options.delay ?? 300
  const immediateValue = ref(options.initialValue ?? '')
  const debouncedValue = ref(options.initialValue ?? '')
  let timeout: ReturnType<typeof setTimeout> | null = null

  function update(val: string) {
    immediateValue.value = val
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      debouncedValue.value = val
    }, delay)
  }

  return {
    immediateValue,
    debouncedValue,
    update,
  }
}
