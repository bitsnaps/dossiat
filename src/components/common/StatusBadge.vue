<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BBadge from '@/components/base/BBadge.vue'

interface Props {
  status: string
  type?: 'mission' | 'payment' | 'subscription' | 'role' | 'dispute'
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'mission',
  size: 'sm',
})

const { t } = useI18n()

const missionVariantMap: Record<string, string> = {
  open: 'info',
  in_progress: 'info',
  agreed: 'accent',
  pending_agreement: 'warning',
  completed: 'success',
  disputed: 'danger',
  draft: 'default',
  cancelled: 'default',
}

const paymentVariantMap: Record<string, string> = {
  completed: 'success',
  pending: 'warning',
  confirmed: 'info',
  failed: 'danger',
  refunded: 'info',
  draft: 'default',
}

const subscriptionVariantMap: Record<string, string> = {
  active: 'success',
  past_due: 'warning',
  cancelled: 'default',
  trialing: 'info',
  paused: 'default',
}

const roleVariantMap: Record<string, string> = {
  admin: 'danger',
  agent: 'info',
  client: 'success',
}

const disputeVariantMap: Record<string, string> = {
  open: 'info',
  reconciling: 'warning',
  resolved: 'success',
  escalated: 'danger',
}

const variantMap: Record<string, Record<string, string>> = {
  mission: missionVariantMap,
  payment: paymentVariantMap,
  subscription: subscriptionVariantMap,
  role: roleVariantMap,
  dispute: disputeVariantMap,
}

const variant = computed(() => {
  const map = variantMap[props.type] || missionVariantMap
  return (map[props.status] || 'default') as 'success' | 'info' | 'warning' | 'danger' | 'accent' | 'default'
})

const labelKey = computed(() => `common.status.${props.type}.${props.status}`)

const fallbackLabel = computed(() => {
  return props.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
})
</script>

<template>
  <BBadge :variant="variant" :size="size">
    <slot>
      {{ t(labelKey, fallbackLabel) }}
    </slot>
  </BBadge>
</template>
