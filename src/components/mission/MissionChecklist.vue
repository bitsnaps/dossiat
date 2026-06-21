<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  agreedChecklist: string[]
  completedChecklist: string[]
  status: string
  missionId: number
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editable: false,
})

const emit = defineEmits<{
  'update:completedChecklist': [items: string[]]
}>()

const isAgreementMode = computed(() => props.status === 'pending_agreement')
const isCompletionMode = computed(() => props.status === 'in_progress')
const isReviewMode = computed(() => ['completed', 'agreed'].includes(props.status))

const checkedItems = computed(() => new Set(props.completedChecklist))

function toggleItem(item: string) {
  if (!props.editable && !isCompletionMode.value && !isAgreementMode.value) return
  const newSet = new Set(props.completedChecklist)
  if (newSet.has(item)) {
    newSet.delete(item)
  } else {
    newSet.add(item)
  }
  emit('update:completedChecklist', Array.from(newSet))
}

const allChecked = computed(() => {
  return props.agreedChecklist.length > 0 && props.agreedChecklist.every((item) => checkedItems.value.has(item))
})

function toggleAll() {
  if (!props.editable && !isCompletionMode.value && !isAgreementMode.value) return
  if (allChecked.value) {
    emit('update:completedChecklist', [])
  } else {
    emit('update:completedChecklist', [...props.agreedChecklist])
  }
}

const completedCount = computed(() =>
  props.agreedChecklist.filter((item) => checkedItems.value.has(item)).length,
)
</script>

<template>
  <div class="ds-mission-checklist">
    <div v-if="agreedChecklist.length === 0" class="ds-mission-checklist__empty">
      <i class="bi bi-clipboard-check" />
      <p>{{ t('missions.checklist.empty') }}</p>
    </div>

    <template v-else>
      <div v-if="isCompletionMode" class="ds-mission-checklist__progress">
        <span class="ds-mission-checklist__progress-text font-mono">
          {{ t('missions.checklist.completed', { count: completedCount, total: agreedChecklist.length }) }}
        </span>
        <div class="ds-mission-checklist__progress-bar">
          <div
            class="ds-mission-checklist__progress-fill"
            :style="{ width: `${(completedCount / agreedChecklist.length) * 100}%` }"
          />
        </div>
      </div>

      <label
        v-if="isAgreementMode || isCompletionMode"
        class="ds-mission-checklist__check-all"
      >
        <input
          type="checkbox"
          :checked="allChecked"
          @change="toggleAll"
          class="ds-mission-checklist__checkbox"
        />
        <span v-if="isAgreementMode">{{ t('missions.agreement.checkAll') }}</span>
        <span v-else>{{ t('missions.agreement.checkAll') }}</span>
      </label>

      <div class="ds-mission-checklist__items">
        <div
          v-for="(item, idx) in agreedChecklist"
          :key="idx"
          class="ds-mission-checklist__item"
          :class="{
            'ds-mission-checklist__item--checked': checkedItems.has(item),
            'ds-mission-checklist__item--readonly': isReviewMode,
          }"
          @click="(isAgreementMode || isCompletionMode) ? toggleItem(item) : undefined"
        >
          <div class="ds-mission-checklist__item-check">
            <input
              type="checkbox"
              :checked="checkedItems.has(item)"
              :disabled="isReviewMode"
              @change="toggleItem(item)"
              @click.stop
              class="ds-mission-checklist__checkbox"
            />
          </div>
          <span class="ds-mission-checklist__item-text">{{ item }}</span>
          <i
            v-if="checkedItems.has(item)"
            class="bi bi-check-circle-fill ds-mission-checklist__item-icon"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.ds-mission-checklist {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ds-mission-checklist__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-mission-checklist__empty i {
  font-size: 2rem;
}

.ds-mission-checklist__progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ds-mission-checklist__progress-text {
  font-size: 0.8125rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-mission-checklist__progress-bar {
  height: 4px;
  border-radius: 2px;
  background: var(--ds-border, #334155);
  overflow: hidden;
}

.ds-mission-checklist__progress-fill {
  height: 100%;
  border-radius: 2px;
  background: var(--ds-accent, #6366f1);
  transition: width 0.3s ease;
}

.ds-mission-checklist__check-all {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  font-size: 0.8125rem;
  color: var(--ds-text-muted, #64748b);
  cursor: pointer;
  user-select: none;
}

.ds-mission-checklist__items {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.ds-mission-checklist__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid var(--ds-border, #334155);
  cursor: pointer;
  transition: background 0.15s ease;
}

.ds-mission-checklist__item:last-child {
  border-bottom: none;
}

.ds-mission-checklist__item:hover:not(.ds-mission-checklist__item--readonly) {
  background: var(--ds-bg-hover, rgba(99, 102, 241, 0.05));
}

.ds-mission-checklist__item--readonly {
  cursor: default;
}

.ds-mission-checklist__item-check {
  flex-shrink: 0;
}

.ds-mission-checklist__checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: var(--ds-accent, #6366f1);
  cursor: pointer;
}

.ds-mission-checklist__item--readonly .ds-mission-checklist__checkbox {
  cursor: default;
}

.ds-mission-checklist__item-text {
  flex: 1;
  font-size: 0.875rem;
  color: var(--ds-text, #f1f5f9);
}

.ds-mission-checklist__item--checked .ds-mission-checklist__item-text {
  color: var(--ds-text-muted, #64748b);
  text-decoration: line-through;
}

.ds-mission-checklist__item-icon {
  color: var(--ds-accent, #6366f1);
  font-size: 1rem;
  flex-shrink: 0;
}
</style>
