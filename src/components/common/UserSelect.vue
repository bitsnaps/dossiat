<script lang="ts" setup>
import { ref, watch } from 'vue'
import { getNetworkUsers } from '@/services/users'
import type { ApiResponse } from '@/server/utils/apiResponse'

interface NetworkUser {
  id: number
  firstName: string
  lastName: string
  email: string
}

interface Props {
  modelValue?: string | number
  role: 'client' | 'agent'
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: undefined,
  placeholder: 'Select a user',
  error: undefined,
  disabled: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const users = ref<NetworkUser[]>([])
const loading = ref(false)

async function fetchUsers() {
  loading.value = true
  try {
    const response = await getNetworkUsers(props.role) as ApiResponse<NetworkUser[]>
    users.value = Array.isArray(response?.data) ? response.data : []
  } catch {
    users.value = []
  } finally {
    loading.value = false
  }
}

watch(() => props.role, fetchUsers, { immediate: true })

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
        :disabled="disabled || loading"
        class="ds-input ds-select"
        @change="onChange"
      >
        <option value="" disabled>{{ loading ? 'Loading...' : placeholder }}</option>
        <option
          v-for="user in users"
          :key="user.id"
          :value="String(user.id)"
        >
          {{ user.firstName }} {{ user.lastName }}
        </option>
      </select>
      <i class="bi bi-chevron-down ds-select__chevron" />
    </div>
    <span v-if="error" class="ds-input-error-text">{{ error }}</span>
  </div>
</template>
