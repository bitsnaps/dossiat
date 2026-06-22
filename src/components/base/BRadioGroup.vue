<script lang="ts" setup>

interface RadioOption {
  value: string
  label: string
  icon?: string
}

interface Props {
  modelValue?: string
  options: RadioOption[]
  name?: string
  label?: string
  error?: string
  hint?: string
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  name: undefined,
  label: undefined,
  error: undefined,
  hint: undefined,
  disabled: false,
  orientation: 'horizontal',
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const groupName = `ds-radio-${Math.round(Math.random()*10**5)}`

function onSelect(value: string) {
  emit('update:modelValue', value)
}

</script>

<template>
  <div :class="['ds-input-group', { 'ds-input-error': error }]">
    <label v-if="label" class="ds-input-label">{{ label }}</label>
    <div
      :class="[
        'ds-radio-group',
        { 'ds-radio-group--vertical': orientation === 'vertical' },
      ]"
      role="radiogroup"
      :aria-label="label"
    >
      <label
        v-for="opt in options"
        :key="opt.value"
        :class="['ds-radio-option', { 'ds-radio-option--active': modelValue === opt.value, 'ds-radio-option--disabled': disabled }]"
        @click="!disabled && onSelect(opt.value)"
      >
        <input
          type="radio"
          :name="name || groupName"
          :value="opt.value"
          :checked="modelValue === opt.value"
          :disabled="disabled"
          class="ds-radio-option__input"
        />
        <i v-if="opt.icon" :class="['bi', opt.icon, 'ds-radio-option__icon']" />
        <span class="ds-radio-option__label">{{ opt.label }}</span>
      </label>
    </div>
    <span v-if="error" class="ds-input-error-text">{{ error }}</span>
    <span v-else-if="hint" class="ds-input-hint">{{ hint }}</span>
  </div>
</template>
