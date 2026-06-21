<script lang="ts" setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useClientProfileStore } from '@/stores/clientProfile'
import { useAuthStore } from '@/stores/auth'
import BCard from '@/components/base/BCard.vue'
import BBadge from '@/components/base/BBadge.vue'
import BButton from '@/components/base/BButton.vue'
import BAvatar from '@/components/base/BAvatar.vue'

const { t } = useI18n()
const route = useRoute()
const clientProfileStore = useClientProfileStore()
const authStore = useAuthStore()

const clientProfile = computed(() => clientProfileStore.profile)

const isOwnProfile = computed(() => {
  if (!authStore.isAuthenticated || !authStore.user || !clientProfile.value) return false
  return authStore.user.id === clientProfile.value.userId
})

onMounted(async () => {
  await clientProfileStore.fetchProfile()
})
</script>

<template>
  <div class="ds-client-profile">
    <!-- Loading -->
    <div v-if="clientProfileStore.loading" class="ds-loading">
      <i class="bi bi-arrow-repeat ds-loading__spinner" />
    </div>

    <!-- Not Found -->
    <div v-else-if="!clientProfile" class="ds-empty-state">
      <i class="bi bi-person-x ds-empty-state__icon" />
      <p>{{ t('clientProfile.view.notFound') }}</p>
      <BButton variant="ghost" to="/">{{ t('clientProfile.view.backToHome') }}</BButton>
    </div>

    <!-- Profile -->
    <template v-else>
      <!-- Hero -->
      <div class="ds-client-profile__hero">
        <BAvatar
          :name="`${authStore.user?.firstName} ${authStore.user?.lastName}`"
          size="lg"
        />
        <div class="ds-client-profile__hero-info">
          <h1 class="ds-client-profile__name">
            {{ authStore.user?.firstName }}
            {{ authStore.user?.lastName }}
          </h1>
          <div class="ds-client-profile__badges">
            <BBadge variant="info" size="sm">
              <i class="bi bi-building" />
              {{ t('clientProfile.view.client') }}
            </BBadge>
          </div>
        </div>
      </div>

      <!-- Company Info -->
      <BCard variant="bordered" padding="md" class="ds-client-profile__section">
        <template #header>
          <h2 class="ds-section-header__title">{{ t('clientProfile.view.company') }}</h2>
        </template>
        <div class="ds-client-profile__details">
          <div v-if="clientProfile.companyName" class="ds-client-profile__detail">
            <span class="ds-client-profile__detail-label">{{ t('clientProfile.settings.companyName') }}</span>
            <span class="ds-client-profile__detail-value">{{ clientProfile.companyName }}</span>
          </div>
          <div v-if="clientProfile.companySize" class="ds-client-profile__detail">
            <span class="ds-client-profile__detail-label">{{ t('clientProfile.settings.companySize') }}</span>
            <span class="ds-client-profile__detail-value">{{ clientProfile.companySize }}</span>
          </div>
          <div v-if="clientProfile.industry" class="ds-client-profile__detail">
            <span class="ds-client-profile__detail-label">{{ t('clientProfile.settings.industry') }}</span>
            <span class="ds-client-profile__detail-value">{{ clientProfile.industry }}</span>
          </div>
          <p v-if="!clientProfile.companyName && !clientProfile.companySize && !clientProfile.industry" class="ds-text-muted">
            —
          </p>
        </div>
      </BCard>

      <!-- Edit Link (own profile only) -->
      <div v-if="isOwnProfile" class="ds-client-profile__actions">
        <BButton variant="accent" to="/app/settings" icon="bi-pencil">
          {{ t('clientProfile.view.editProfile') }}
        </BButton>
      </div>
    </template>
  </div>
</template>
