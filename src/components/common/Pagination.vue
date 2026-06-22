<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  modelValue: number
  totalPages: number
  siblingCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  siblingCount: 1,
})

const emit = defineEmits<{ 'update:modelValue': [page: number] }>()

const pages = computed(() => {
  const total = props.totalPages
  const current = props.modelValue
  const siblings = props.siblingCount
  const range: (number | 'ellipsis')[] = []

  if (total <= 0) return range

  const left = Math.max(2, current - siblings)
  const right = Math.min(total - 1, current + siblings)

  range.push(1)

  if (left > 2) {
    range.push('ellipsis')
  }

  for (let i = left; i <= right; i++) {
    range.push(i)
  }

  if (right < total - 1) {
    range.push('ellipsis')
  }

  if (total > 1) {
    range.push(total)
  }

  return range
})

function goTo(page: number) {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:modelValue', page)
  }
}
</script>

<template>
  <nav v-if="totalPages > 1" class="ds-breadcrumb" aria-label="Pagination">
    <ul class="ds-table-pager">
      <li :class="['ds-table-pager__item', { 'ds-table-pager__item--disabled': modelValue <= 1 }]">
        <button class="ds-table-pager__link" :disabled="modelValue <= 1" @click="goTo(modelValue - 1)">
          <i class="bi bi-chevron-left" />
        </button>
      </li>
      <li
        v-for="(page, idx) in pages"
        :key="idx"
        :class="[
          'ds-table-pager__item',
          {
            'ds-table-pager__item--active': page === modelValue,
            'ds-table-pager__item--disabled': page === 'ellipsis',
          },
        ]"
      >
        <button
          v-if="page === 'ellipsis'"
          class="ds-table-pager__link"
          disabled
        >
          …
        </button>
        <button
          v-else
          class="ds-table-pager__link"
          :class="{ 'ds-table-pager__link--active': page === modelValue }"
          @click="goTo(page)"
        >
          {{ page }}
        </button>
      </li>
      <li :class="['ds-table-pager__item', { 'ds-table-pager__item--disabled': modelValue >= totalPages }]">
        <button class="ds-table-pager__link" :disabled="modelValue >= totalPages" @click="goTo(modelValue + 1)">
          <i class="bi bi-chevron-right" />
        </button>
      </li>
    </ul>
  </nav>
</template>
