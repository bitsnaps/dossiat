<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const role = ref<'agent' | 'client'>('agent')

async function handleSubmit() {
  await authStore.register({
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    password: password.value,
    role: role.value,
  })
  if (authStore.isAuthenticated) {
    router.push('/app/dashboard')
  }
}
</script>

<template>
  <div>
    <h2>{{ t('auth.register.title') }}</h2>
    <p class="ds-auth-subtitle">{{ t('auth.register.subtitle') }}</p>

    <div v-if="authStore.error" class="ds-alert ds-alert--danger">
      <i class="bi bi-exclamation-triangle-fill" />
      <span>{{ authStore.error }}</span>
    </div>

    <form class="ds-auth-form" @submit.prevent="handleSubmit">
      <div class="ds-auth-role-select">
        <button
          type="button"
          class="ds-auth-role-option"
          :class="{ 'ds-auth-role-option--active': role === 'agent' }"
          @click="role = 'agent'"
        >
          <i class="bi bi-person-workspace" />
          <span>{{ t('auth.register.roleAgent') }}</span>
        </button>
        <button
          type="button"
          class="ds-auth-role-option"
          :class="{ 'ds-auth-role-option--active': role === 'client' }"
          @click="role = 'client'"
        >
          <i class="bi bi-building" />
          <span>{{ t('auth.register.roleClient') }}</span>
        </button>
      </div>

      <div class="row g-2">
        <div class="col-6">
          <div class="ds-input-group">
            <label class="ds-input-label">{{ t('auth.register.firstName') }}</label>
            <input
              v-model="firstName"
              type="text"
              name="firstName"
              class="ds-input"
              :placeholder="t('auth.register.firstNamePlaceholder')"
              required
            />
          </div>
        </div>
        <div class="col-6">
          <div class="ds-input-group">
            <label class="ds-input-label">{{ t('auth.register.lastName') }}</label>
            <input
              v-model="lastName"
              type="text"
              name="lastName"
              class="ds-input"
              :placeholder="t('auth.register.lastNamePlaceholder')"
              required
            />
          </div>
        </div>
      </div>

      <div class="ds-input-group">
        <label class="ds-input-label">{{ t('auth.register.email') }}</label>
        <div class="ds-input-wrapper">
          <i class="bi bi-envelope ds-input-icon" />
          <input
            v-model="email"
            type="email"
            class="ds-input ds-input-has-icon"
            :placeholder="t('auth.register.emailPlaceholder')"
            required
          />
        </div>
      </div>

      <div class="ds-input-group">
        <label class="ds-input-label">{{ t('auth.register.password') }}</label>
        <div class="ds-input-wrapper">
          <i class="bi bi-lock ds-input-icon" />
          <input
            v-model="password"
            type="password"
            class="ds-input ds-input-has-icon"
            :placeholder="t('auth.register.passwordPlaceholder')"
            required
          />
        </div>
      </div>

      <button type="submit" class="ds-btn ds-btn--accent" :disabled="authStore.loading">
        <span v-if="authStore.loading" class="ds-btn-spinner" />
        {{ t('auth.register.submit') }}
      </button>
    </form>

    <div class="ds-auth-footer">
      {{ t('auth.register.hasAccount') }}
      <RouterLink to="/login">{{ t('auth.register.login') }}</RouterLink>
    </div>
  </div>
</template>
