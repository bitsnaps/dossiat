import { ref, computed } from 'vue'

interface PaginationOptions {
  initialPage?: number
  initialPerPage?: number
}

export function usePagination(options: PaginationOptions = {}) {
  const page = ref(options.initialPage ?? 1)
  const perPage = ref(options.initialPerPage ?? 20)
  const total = ref(0)

  const totalPages = computed(() =>
    perPage.value > 0 ? Math.ceil(total.value / perPage.value) : 0,
  )

  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrev = computed(() => page.value > 1)

  function next() {
    if (hasNext.value) {
      page.value++
    }
  }

  function prev() {
    if (hasPrev.value) {
      page.value--
    }
  }

  function goTo(p: number) {
    if (p < 1) {
      page.value = 1
    } else if (totalPages.value > 0 && p > totalPages.value) {
      page.value = totalPages.value
    } else {
      page.value = p
    }
  }

  function reset() {
    page.value = 1
  }

  return {
    page,
    perPage,
    total,
    totalPages,
    hasNext,
    hasPrev,
    next,
    prev,
    goTo,
    reset,
  }
}
