<script lang="ts" setup>
import { ref } from 'vue'

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
  allowCustom?: boolean
  customPlaceholder?: string
  customAddLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  label: undefined,
  error: undefined,
  hint: undefined,
  disabled: false,
  removable: false,
  allowCustom: false,
  customPlaceholder: '',
  customAddLabel: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  remove: [value: string]
  add: [value: string]
}>()

const customValue = ref('')

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

function addCustom() {
  const trimmed = customValue.value.trim()
  if (!trimmed || props.disabled) return
  // Avoid duplicates (case-insensitive against existing selection)
  const exists = props.modelValue.some(
    v => v.toLowerCase() === trimmed.toLowerCase(),
  )
  if (!exists) {
    emit('update:modelValue', [...props.modelValue, trimmed])
    emit('add', trimmed)
  }
  customValue.value = ''
}

function onCustomKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    addCustom()
  }
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

      <!-- Custom tags added by the user (not part of the static options) -->
      <button
        v-for="value in modelValue.filter(v => !options.some(o => o.value === v))"
        :key="`custom-${value}`"
        type="button"
        :class="[
          'ds-tag',
          'ds-tag--active',
          'ds-tag--custom',
          { 'ds-tag--disabled': disabled },
        ]"
        :disabled="disabled"
        @click="!disabled && toggle(value, modelValue)"
      >
        <span class="ds-tag__label">{{ value }}</span>
        <i
          v-if="removable"
          class="bi bi-x-lg ds-tag__remove"
          @click.stop="!disabled && onRemove(value, modelValue)"
        />
      </button>
    </div>

    <!-- Add custom value input -->
    <div v-if="allowCustom" class="ds-tag-group__add">
      <input
        v-model="customValue"
        type="text"
        class="ds-input ds-tag-group__input"
        :placeholder="customPlaceholder"
        :disabled="disabled"
        @keydown="onCustomKeydown"
      />
      <button
        type="button"
        class="ds-btn ds-btn--sm ds-btn--outline ds-tag-group__add-btn"
        :disabled="disabled || !customValue.trim()"
        @click="addCustom"
      >
        {{ customAddLabel }}
      </button>
    </div>

    <span v-if="error" class="ds-input-error-text">{{ error }}</span>
    <span v-else-if="hint" class="ds-input-hint">{{ hint }}</span>
  </div>
</template>
