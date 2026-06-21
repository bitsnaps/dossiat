<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  label?: string
  placement?: 'start' | 'end'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  placement: 'start',
  disabled: false
})

const resolvedLabel = computed(() => props.label || t('components.dropdown.select'))

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
          {{ resolvedLabel }}
          <i class="bi bi-chevron-down"></i>
        </button>
      </slot>
    </div>
    <div :class="['ds-dropdown-menu', { 'ds-dropdown-open': open }]" @click="onSelect">
      <slot />
    </div>
  </div>
</template>

