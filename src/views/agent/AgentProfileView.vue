<script lang="ts" setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAgentProfileStore } from '@/stores/agentProfile'
import { useAuthStore } from '@/stores/auth'
import BCard from '@/components/base/BCard.vue'
import BBadge from '@/components/base/BBadge.vue'
import BButton from '@/components/base/BButton.vue'
import BAvatar from '@/components/base/BAvatar.vue'
import InviteLinkShare from '@/components/agent/InviteLinkShare.vue'

const { t } = useI18n()
const route = useRoute()
const agentProfileStore = useAgentProfileStore()
const authStore = useAuthStore()

const slug = computed(() => route.params.slug as string)

const isUnauthenticated = computed(() => !authStore.isAuthenticated)

const isOwnProfile = computed(() => {
  if (!authStore.isAuthenticated || !authStore.user || !agentProfileStore.publicProfile) return false
  return authStore.user.id === agentProfileStore.publicProfile.user?.id
})

// The own-profile slug for InviteLinkShare — comes from the authenticated user's profile
const ownInviteSlug = computed(() => agentProfileStore.profile?.uniqueInviteSlug || slug.value)

const clientTypeLabel = computed(() => {
  const type = agentProfileStore.publicProfile?.acceptedClientTypes
  if (type === 'B2B') return t('agentProfile.view.b2b')
  if (type === 'B2C') return t('agentProfile.view.b2c')
  return t('agentProfile.view.both')
})

onMounted(async () => {
  await agentProfileStore.fetchPublicProfile(slug.value)
  // If viewing own profile, also fetch the full profile for the invite slug
  if (isOwnProfile.value) {
    await agentProfileStore.fetchProfile()
  }
})

onUnmounted(() => {
  agentProfileStore.clearPublicProfile()
})
</script>

<template>
  <div class="ds-agent-profile">
    <!-- Loading -->
    <div v-if="agentProfileStore.loading" class="ds-loading">
      <i class="bi bi-arrow-repeat ds-loading__spinner" />
    </div>

    <!-- Not Found -->
    <div v-else-if="!agentProfileStore.publicProfile" class="ds-empty-state">
      <i class="bi bi-person-x ds-empty-state__icon" />
      <p>{{ t('agentProfile.view.notFound') }}</p>
      <BButton variant="ghost" to="/">{{ t('agentProfile.view.backToHome') }}</BButton>
    </div>

    <!-- Profile -->
    <template v-else>
      <!-- Hero -->
      <div class="ds-agent-profile__hero">
        <BAvatar
          :src="agentProfileStore.publicProfile.profilePhotoUrl || undefined"
          :name="`${agentProfileStore.publicProfile.user.firstName} ${agentProfileStore.publicProfile.user.lastName}`"
          size="lg"
        />
        <div class="ds-agent-profile__hero-info">
          <h1 class="ds-agent-profile__name">
            {{ agentProfileStore.publicProfile.user.firstName }}
            {{ agentProfileStore.publicProfile.user.lastName }}
          </h1>
          <div class="ds-agent-profile__badges">
            <BBadge variant="success" size="sm">
              <i class="bi bi-patch-check-fill" />
              {{ t('agentProfile.view.verified') }}
            </BBadge>
          </div>
        </div>
      </div>

      <!-- About -->
      <BCard variant="bordered" padding="md" class="ds-agent-profile__section">
        <template #header>
          <h2 class="ds-section-header__title">{{ t('agentProfile.view.about') }}</h2>
        </template>
        <p v-if="agentProfileStore.publicProfile.bio" class="ds-agent-profile__bio">
          {{ agentProfileStore.publicProfile.bio }}
        </p>
        <p v-else class="ds-text-muted">—</p>
      </BCard>

      <!-- Specialties -->
      <BCard
        v-if="agentProfileStore.publicProfile.specialties?.length"
        variant="bordered"
        padding="md"
        class="ds-agent-profile__section"
      >
        <template #header>
          <h2 class="ds-section-header__title">{{ t('agentProfile.view.specialties') }}</h2>
        </template>
        <div class="ds-agent-profile__tags">
          <BBadge
            v-for="s in agentProfileStore.publicProfile.specialties"
            :key="s"
            variant="accent"
          >
            {{ s }}
          </BBadge>
        </div>
      </BCard>

      <!-- Accepts -->
      <BCard variant="bordered" padding="md" class="ds-agent-profile__section">
        <template #header>
          <h2 class="ds-section-header__title">{{ t('agentProfile.view.accepts') }}</h2>
        </template>
        <BBadge variant="info">{{ clientTypeLabel }}</BBadge>
      </BCard>

      <!-- Invite Link (own profile only) -->
      <BCard
        v-if="isOwnProfile && agentProfileStore.publicProfile.user"
        variant="bordered"
        padding="md"
        class="ds-agent-profile__section"
      >
        <template #header>
          <h2 class="ds-section-header__title">{{ t('agentProfile.settings.inviteLink') }}</h2>
        </template>
        <InviteLinkShare :slug="ownInviteSlug" />
      </BCard>

      <!-- CTA for authenticated clients (non-owners) -->
      <div v-if="!isOwnProfile && authStore.isAuthenticated && authStore.hasRole('client')" class="ds-agent-profile__cta">
        <BButton
          variant="accent"
          size="lg"
          icon="bi-clipboard-plus"
          :to="`/app/missions/create?agentId=${agentProfileStore.publicProfile.user.id}`"
        >
          {{ t('agentProfile.view.startMission') }}
        </BButton>
      </div>

      <!-- CTA for unauthenticated visitors -->
      <div v-if="isUnauthenticated" class="ds-agent-profile__cta">
        <BCard variant="bordered" padding="md" class="ds-agent-profile__register-prompt">
          <p class="ds-agent-profile__register-text">{{ t('agentProfile.view.registerToContact') }}</p>
          <BButton variant="accent" to="/register">
            {{ t('agentProfile.view.register') }}
          </BButton>
        </BCard>
      </div>
    </template>
  </div>
</template>

<style scoped>
.ds-agent-profile {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 48rem;
  padding-bottom: 2rem;
}

.ds-agent-profile__hero {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background: var(--ds-surface, #131a2e);
  border: 1px solid var(--ds-border, rgba(255, 255, 255, 0.08));
  border-radius: var(--ds-radius-xl, 16px);
}

.ds-agent-profile__hero-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ds-agent-profile__name {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ds-text, #e8ecf4);
  margin: 0;
  line-height: 1.2;
}

.ds-agent-profile__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ds-agent-profile__section {
  margin-top: 0;
}

.ds-agent-profile__bio {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #9aa3b8);
  line-height: 1.6;
  margin: 0;
}

.ds-agent-profile__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ds-agent-profile__cta {
  display: flex;
  justify-content: flex-start;
  margin-top: 0.5rem;
}

.ds-agent-profile__register-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  padding: 1.5rem;
}

.ds-agent-profile__register-text {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #9aa3b8);
  margin: 0;
}

@media (max-width: 768px) {
  .ds-agent-profile {
    max-width: 100%;
    padding: 0 0.5rem;
  }

  .ds-agent-profile__hero {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.25rem;
  }

  .ds-agent-profile__name {
    font-size: 1.25rem;
  }
}
</style>
