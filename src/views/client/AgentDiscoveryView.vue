<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BCard from '@/components/base/BCard.vue'
import BBadge from '@/components/base/BBadge.vue'
import BButton from '@/components/base/BButton.vue'
import BAvatar from '@/components/base/BAvatar.vue'
import BInput from '@/components/base/BInput.vue'
import { discoverAgents } from '@/services/users'
import type { ApiResponse } from '@/server/utils/apiResponse'

const { t } = useI18n()

const searchQuery = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

interface DiscoveredAgent {
  id: number
  slug: string
  firstName: string
  lastName: string
  bio: string | null
  specialties: string[]
  acceptedClientTypes: 'B2B' | 'B2C' | 'Both'
  profilePhotoUrl: string | null
}

const agents = ref<DiscoveredAgent[]>([])

async function searchAgents() {
  loading.value = true
  error.value = null
  try {
    const response = await discoverAgents({ q: searchQuery.value }) as ApiResponse<DiscoveredAgent[]>
    agents.value = response.data ?? []
  } catch (err: any) {
    error.value = err.response?.data?.error || err.message || t('agentDiscovery.empty')
    agents.value = []
  } finally {
    loading.value = false
  }
}

function clientTypeLabel(type: 'B2B' | 'B2C' | 'Both') {
  if (type === 'B2B') return t('agentDiscovery.agent.b2b')
  if (type === 'B2C') return t('agentDiscovery.agent.b2c')
  return t('agentDiscovery.agent.both')
}

onMounted(searchAgents)
</script>

<template>
  <div class="ds-agent-discovery">
    <h1 class="ds-page-title">{{ t('agentDiscovery.title') }}</h1>
    <p class="ds-page-subtitle">{{ t('agentDiscovery.subtitle') }}</p>

    <!-- Search -->
    <div class="ds-agent-discovery__search">
      <BInput
        v-model="searchQuery"
        :label="t('agentDiscovery.search')"
        :placeholder="t('agentDiscovery.searchPlaceholder')"
        @keyup.enter="searchAgents"
      />
      <BButton variant="accent" :loading="loading" @click="searchAgents">
        {{ t('agentDiscovery.searchButton') }}
      </BButton>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="ds-loading">
      <i class="bi bi-arrow-repeat ds-loading__spinner" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="ds-empty-state">
      <i class="bi bi-exclamation-triangle ds-empty-state__icon" />
      <p>{{ error }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="agents.length === 0" class="ds-empty-state">
      <i class="bi bi-people ds-empty-state__icon" />
      <p>{{ t('agentDiscovery.empty') }}</p>
      <p class="ds-empty-state__hint">{{ t('agentDiscovery.emptyHint') }}</p>
    </div>

    <!-- Agent Grid -->
    <div v-else class="ds-agent-discovery__grid">
      <BCard
        v-for="agent in agents"
        :key="agent.id"
        variant="bordered"
        padding="md"
        class="ds-agent-discovery__card"
      >
        <div class="ds-agent-discovery__card-header">
          <BAvatar
            :src="agent.profilePhotoUrl || undefined"
            :name="`${agent.firstName} ${agent.lastName}`"
            size="md"
          />
          <div class="ds-agent-discovery__card-info">
            <h3 class="ds-agent-discovery__card-name">
              {{ agent.firstName }} {{ agent.lastName }}
            </h3>
            <BBadge variant="success" size="sm">
              <i class="bi bi-patch-check-fill" />
              {{ t('agentDiscovery.agent.verified') }}
            </BBadge>
          </div>
        </div>

        <p v-if="agent.bio" class="ds-agent-discovery__card-bio">
          {{ agent.bio }}
        </p>

        <div v-if="agent.specialties.length" class="ds-agent-discovery__card-tags">
          <BBadge
            v-for="s in agent.specialties"
            :key="s"
            variant="accent"
            size="sm"
          >
            {{ s }}
          </BBadge>
        </div>

        <div class="ds-agent-discovery__card-footer">
          <BBadge variant="info" size="sm">
            {{ clientTypeLabel(agent.acceptedClientTypes) }}
          </BBadge>
          <BButton
            variant="ghost"
            size="sm"
            :to="`/agents/${agent.slug}`"
          >
            {{ t('agentDiscovery.agent.viewProfile') }}
          </BButton>
        </div>
      </BCard>
    </div>
  </div>
</template>
