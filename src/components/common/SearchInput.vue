<script lang="ts" setup>
import { watch } from 'vue'
import { useDebounce } from '@/composables/useDebounce'

interface Props {
  modelValue?: string
  placeholder?: string
  debounce?: number
  maxWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: undefined,
  debounce: 300,
  maxWidth: '320px',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [value: string]
}>()

const { immediateValue, update } = useDebounce({ delay: props.debounce })

watch(() => props.modelValue, (val) => {
  if (val !== immediateValue.value) {
    update(val)
  }
}, { immediate: true })

watch(immediateValue, (val) => {
  emit('update:modelValue', val)
  emit('search', val)
})

function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  update(val)
}

function clear() {
  immediateValue.value = ''
  emit('update:modelValue', '')
  emit('search', '')
}
</script>

<template>
  <div class="ds-search-input" :style="{ maxWidth }">
    <i class="bi bi-search ds-search-input__icon" />
    <input
      class="ds-search-input__input"
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      @input="onInput"
    />
    <button
      v-if="modelValue"
      class="ds-search-input__clear"
      type="button"
      @click="clear"
    >
      <i class="bi bi-x-lg" />
    </button>
  </div>
</template>
