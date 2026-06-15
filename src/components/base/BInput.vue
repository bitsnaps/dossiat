<script lang="ts" setup>
interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  error?: string
  hint?: string
  icon?: string
  disabled?: boolean
  type?: string
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: undefined,
  placeholder: undefined,
  error: undefined,
  hint: undefined,
  icon: undefined,
  disabled: false,
  type: 'text',
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div :class="['ds-input-group', { 'ds-input-error': error }]">
    <label v-if="label" class="ds-input-label">{{ label }}</label>
    <div class="ds-input-wrapper">
      <i v-if="icon" :class="['bi', icon, 'ds-input-icon']" />
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="['ds-input', { 'ds-input-has-icon': icon }]"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <span v-if="error" class="ds-input-error-text">{{ error }}</span>
    <span v-else-if="hint" class="ds-input-hint">{{ hint }}</span>
  </div>
</template>
