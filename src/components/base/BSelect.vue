<script lang="ts" setup>

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface Props {
  modelValue?: string
  options: SelectOption[]
  label?: string
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: undefined,
  placeholder: undefined,
  error: undefined,
  hint: undefined,
  disabled: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function onChange(e: Event) {
  emit('update:modelValue', (e.target as HTMLSelectElement).value)
}

</script>

<template>
  <div :class="['ds-input-group', { 'ds-input-error': error }]">
    <label v-if="label" class="ds-input-label">{{ label }}</label>
    <div class="ds-input-wrapper">
      <select
        :value="modelValue"
        :disabled="disabled"
        class="ds-input ds-select"
        @change="onChange"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
          :disabled="opt.disabled"
        >
          {{ opt.label }}
        </option>
      </select>
      <i class="bi bi-chevron-down ds-select__chevron" />
    </div>
    <span v-if="error" class="ds-input-error-text">{{ error }}</span>
    <span v-else-if="hint" class="ds-input-hint">{{ hint }}</span>
  </div>
</template>
