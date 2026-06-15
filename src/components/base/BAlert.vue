<script lang="ts" setup>
import { ref, computed } from 'vue'

type AlertVariant = 'info' | 'success' | 'warning' | 'danger' | 'accent'

const props = withDefaults(defineProps<{
  variant?: AlertVariant
  dismissible?: boolean
  icon?: string
  title?: string
}>(), {
  variant: 'info',
  dismissible: false,
})

const emit = defineEmits<{
  dismiss: []
}>()

const visible = ref(true)

const iconMap: Record<AlertVariant, string> = {
  info: 'bi-info-circle',
  success: 'bi-check-circle',
  warning: 'bi-exclamation-triangle',
  danger: 'bi-x-circle',
  accent: 'bi-lightning',
}

const resolvedIcon = computed(() => props.icon || iconMap[props.variant])

function onDismiss() {
  visible.value = false
  emit('dismiss')
}
</script>

<template>
  <div v-if="visible" :class="['ds-alert', `ds-alert--${variant}`]">
    <span class="ds-alert__icon">
      <i :class="['bi', resolvedIcon]" />
    </span>
    <div class="ds-alert__content">
      <div v-if="title" class="ds-alert__title">{{ title }}</div>
      <slot />
    </div>
    <button v-if="dismissible" class="ds-alert__close" @click="onDismiss">
      <i class="bi bi-x-lg" />
    </button>
  </div>
</template>
