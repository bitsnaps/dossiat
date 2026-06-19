<script lang="ts" setup>
import { ref } from 'vue'

interface Props {
  label?: string
  placement?: 'start' | 'end'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  label: undefined,
  placement: 'start',
  disabled: false
})

const emit = defineEmits<{ select: [event: MouseEvent] }>()
const open = ref(false)

function toggle() {
  open.value = !open.value
}

function onSelect(e: MouseEvent) {
  open.value = false
  emit('select', e)
}
</script>

<template>
  <div :class="['ds-dropdown', { 'ds-dropdown--end': placement === 'end' }]" @click.stop>
    <div class="ds-dropdown-trigger" @click="toggle">
      <slot name="trigger">
        <button type="button" class="ds-btn ds-btn--outline ds-btn--sm" :disabled="disabled">
          {{ label || 'Select' }}
          <i class="bi bi-chevron-down"></i>
        </button>
      </slot>
    </div>
    <div :class="['ds-dropdown-menu', { 'ds-dropdown-open': open }]" @click="onSelect">
      <slot />
    </div>
  </div>
</template>

