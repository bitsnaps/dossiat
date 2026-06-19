<script lang="ts" setup>

interface Props {
  modelValue?: boolean | undefined
  label?: string
  error?: string
  hint?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: false,
  label: undefined,
  error: undefined,
  hint: undefined,
  disabled: false
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const refId = `ds-checkbox-${Math.round(Math.random()*10**5)}`

function onChange(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).checked)
}

</script>

<template>
  <div :class="['ds-input-group', { 'ds-input-error': error }]">
    <div class="ds-input-checkbox">
      <input
        type="checkbox"
        :id="refId"
        :checked="modelValue"
        :disabled="disabled"
        class="ds-checkbox"
        @change="onChange"
      />
      <label v-if="label || $slots.default" class="ds-input-label" :for="refId">
        <slot>{{ label }}</slot>
      </label>
    </div>
    <span v-if="error" class="ds-input-error-text">{{ error }}</span>
    <span v-else-if="hint" class="ds-input-hint">{{ hint }}</span>
  </div>
</template>

