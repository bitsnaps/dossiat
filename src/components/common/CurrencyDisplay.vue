<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  amount: number
  currency: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const formatted = computed(() => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: props.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(props.amount)
  } catch {
    return `${props.currency} ${props.amount}`
  }
})

const parts = computed(() => {
  const text = formatted.value
  const code = props.currency
  const amount = text.replace(code, '').trim()
  return { amount, code }
})
</script>

<template>
  <span :class="['ds-currency-display', `ds-currency-display--${size}`]">
    <span class="ds-currency-display__amount font-mono">{{ parts.amount }}</span>
    <span class="ds-currency-display__code font-mono">{{ parts.code }}</span>
  </span>
</template>