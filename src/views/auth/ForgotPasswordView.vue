<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { forgotPassword } from '@/services/auth'

const { t } = useI18n()

const email = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref<string | null>(null)

async function handleSubmit() {
  loading.value = true
  error.value = null
  try {
    await forgotPassword(email.value)
    success.value = true
  } catch (err: any) {
    error.value = err.response?.data?.error || err.message || 'Failed to send reset email'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h2>{{ t('auth.forgotPassword.title') }}</h2>
    <p class="ds-auth-subtitle">{{ t('auth.forgotPassword.subtitle') }}</p>

    <div v-if="success" class="ds-alert ds-alert--success">
      <i class="bi bi-check-circle-fill" />
      <span>{{ t('auth.forgotPassword.success') }}</span>
    </div>

    <div v-else>
      <div v-if="error" class="ds-alert ds-alert--danger">
        <i class="bi bi-exclamation-triangle-fill" />
        <span>{{ error }}</span>
      </div>

      <form class="ds-auth-form" @submit.prevent="handleSubmit">
        <div class="ds-input-group">
          <label class="ds-input-label">{{ t('auth.forgotPassword.email') }}</label>
          <div class="ds-input-wrapper">
            <i class="bi bi-envelope ds-input-icon" />
            <input
              v-model="email"
              type="email"
              class="ds-input ds-input-has-icon"
              :placeholder="t('auth.forgotPassword.emailPlaceholder')"
              required
            />
          </div>
        </div>

        <button type="submit" class="ds-btn ds-btn--accent" :disabled="loading">
          <span v-if="loading" class="ds-btn-spinner" />
          {{ t('auth.forgotPassword.submit') }}
        </button>
      </form>
    </div>

    <div class="ds-auth-footer">
      <RouterLink to="/login">{{ t('auth.forgotPassword.backToLogin') }}</RouterLink>
    </div>
  </div>
</template>
