<script lang="ts" setup>

interface TagOption {
  value: string
  label: string
  icon?: string
}

interface Props {
  modelValue?: string[]
  options: TagOption[]
  label?: string
  error?: string
  hint?: string
  disabled?: boolean
  removable?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  label: undefined,
  error: undefined,
  hint: undefined,
  disabled: false,
  removable: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  remove: [value: string]
}>()

function toggle(value: string, current: string[]) {
  const idx = current.indexOf(value)
  if (idx === -1) {
    emit('update:modelValue', [...current, value])
  } else {
    emit('update:modelValue', current.filter(v => v !== value))
  }
}

function onRemove(value: string, current: string[]) {
  emit('update:modelValue', current.filter(v => v !== value))
  emit('remove', value)
}

</script>

<template>
  <div :class="['ds-input-group', { 'ds-input-error': error }]">
    <label v-if="label" class="ds-input-label">{{ label }}</label>
    <div class="ds-tag-group" role="group">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        :class="[
          'ds-tag',
          { 'ds-tag--active': modelValue.includes(opt.value) },
          { 'ds-tag--disabled': disabled },
        ]"
        :disabled="disabled"
        @click="!disabled && toggle(opt.value, modelValue)"
      >
        <i v-if="opt.icon" :class="['bi', opt.icon, 'ds-tag__icon']" />
        <span class="ds-tag__label">{{ opt.label }}</span>
        <i
          v-if="removable && modelValue.includes(opt.value)"
          class="bi bi-x-lg ds-tag__remove"
          @click.stop="!disabled && onRemove(opt.value, modelValue)"
        />
      </button>
    </div>
    <span v-if="error" class="ds-input-error-text">{{ error }}</span>
    <span v-else-if="hint" class="ds-input-hint">{{ hint }}</span>
  </div>
</template>
