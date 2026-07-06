<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { parseCsv } from '@/utils/csv'
import { useMissionsStore } from '@/stores/missions'
import { useToast } from '@/composables/useToast'
import type { CreateMissionData } from '@/services/missions'
import BCard from '@/components/base/BCard.vue'
import BButton from '@/components/base/BButton.vue'
import BTable from '@/components/base/BTable.vue'
import type { TableColumn } from '@/components/base/BTable.vue'
import FileUpload from '@/components/common/FileUpload.vue'

const { t } = useI18n()
const router = useRouter()
const missionsStore = useMissionsStore()
const toast = useToast()

interface ParsedRow {
  rowNumber: number
  title: string
  clientId: string
  pricingType: string
  description: string
  agreedAmount: string
  currency: string
  agreedChecklist: string
  type: string
  errors: string[]
}

const parsedRows = ref<ParsedRow[]>([])
const parsing = ref(false)
const submitting = ref(false)
const successCount = ref<number | null>(null)

const MAX_ROWS = 100
const VALID_PRICING_TYPES = ['fixed', 'hourly', 'task_based']
const VALID_MISSION_TYPES = ['one_time', 'recurrent']

const columns = computed<TableColumn[]>(() => [
  { key: 'rowNumber', label: t('missions.bulk.columnRow'), width: '60px' },
  { key: 'title', label: t('missions.bulk.columnTitle') },
  { key: 'clientId', label: t('missions.bulk.columnClientId'), width: '100px' },
  { key: 'pricingType', label: t('missions.bulk.columnPricingType'), width: '120px' },
  { key: 'agreedAmount', label: t('missions.bulk.columnAmount'), width: '100px' },
  { key: 'status', label: t('missions.bulk.columnStatus'), width: '100px' },
])

const validRows = computed(() => parsedRows.value.filter(r => r.errors.length === 0))
const errorRows = computed(() => parsedRows.value.filter(r => r.errors.length > 0))
const canSubmit = computed(() => validRows.value.length > 0 && errorRows.value.length === 0 && !submitting.value)

function validateRow(row: ParsedRow): string[] {
  const errs: string[] = []
  if (!row.title || !row.title.trim()) {
    errs.push(t('missions.bulk.requiredField') + ': title')
  }
  if (!row.clientId || isNaN(Number(row.clientId)) || Number(row.clientId) <= 0) {
    errs.push(t('missions.bulk.requiredField') + ': clientId')
  }
  if (!row.pricingType || !VALID_PRICING_TYPES.includes(row.pricingType)) {
    errs.push(t('missions.bulk.invalidPricingType'))
  }
  if (row.agreedAmount && (isNaN(Number(row.agreedAmount)) || Number(row.agreedAmount) < 0)) {
    errs.push(t('missions.bulk.requiredField') + ': agreedAmount')
  }
  if (row.type && !VALID_MISSION_TYPES.includes(row.type)) {
    errs.push(t('missions.bulk.requiredField') + ': type')
  }
  return errs
}

function mapToParsedRow(raw: Record<string, any>, index: number): ParsedRow {
  const row: ParsedRow = {
    rowNumber: index + 1,
    title: String(raw.title ?? raw.Title ?? '').trim(),
    clientId: String(raw.clientId ?? raw.ClientId ?? raw['client_id'] ?? '').trim(),
    pricingType: String(raw.pricingType ?? raw.PricingType ?? raw['pricing_type'] ?? '').trim(),
    description: String(raw.description ?? raw.Description ?? '').trim(),
    agreedAmount: String(raw.agreedAmount ?? raw.AgreedAmount ?? raw['agreed_amount'] ?? '').trim(),
    currency: String(raw.currency ?? raw.Currency ?? '').trim() || 'USD',
    agreedChecklist: String(raw.agreedChecklist ?? raw.AgreedChecklist ?? raw['agreed_checklist'] ?? '').trim(),
    type: String(raw.type ?? raw.Type ?? '').trim() || 'one_time',
    errors: [],
  }
  row.errors = validateRow(row)
  return row
}

async function handleFile(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || ext !== 'csv') {
    toast.error(t('missions.bulk.errorFileFormat'))
    return
  }

  parsing.value = true
  successCount.value = null
  parsedRows.value = []

  try {
    let rawRows: Record<string, string>[] = []

    const text = await file.text()
    rawRows = parseCsv(text, {
      columns: true,
      skipEmptyLines: true,
      trim: true,
    })

    if (rawRows.length > MAX_ROWS) {
      toast.error(t('missions.bulk.errorMax'))
      parsedRows.value = []
      parsing.value = false
      return
    }

    parsedRows.value = rawRows.map((raw, idx) => mapToParsedRow(raw, idx))

    if (parsedRows.value.length === 0) {
      toast.error(t('missions.bulk.errorEmpty'))
    }
  } catch (err) {
    toast.error(t('missions.bulk.errorFileFormat'))
    parsedRows.value = []
  } finally {
    parsing.value = false
  }
}

function downloadCsvTemplate() {
  const headers = ['title', 'clientId', 'pricingType', 'description', 'agreedAmount', 'currency', 'agreedChecklist', 'type']
  const example = ['Example Mission', '1', 'fixed', 'Sample mission description', '100', 'USD', 'Task 1|Task 2', 'one_time']
  const csvContent = [headers.join(','), example.map(v => `"${v}"`).join(',')].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'missions-template.csv'
  link.click()
  URL.revokeObjectURL(url)
}

async function handleConfirm() {
  if (!canSubmit.value) return
  submitting.value = true
  successCount.value = null

  try {
    const data: CreateMissionData[] = validRows.value.map(row => ({
      title: row.title,
      clientId: row.clientId,
      pricingType: row.pricingType as 'fixed' | 'hourly' | 'task_based',
      description: row.description || undefined,
      agreedAmount: row.agreedAmount ? Number(row.agreedAmount) : undefined,
      currency: row.currency || undefined,
      agreedChecklist: row.agreedChecklist ? row.agreedChecklist.split('|').map(s => s.trim()).filter(Boolean) : undefined,
    }))

    const result = await missionsStore.createBulkMissions(data)
    successCount.value = result?.count ?? 0
    toast.success(t('missions.bulk.successMessage', { count: successCount.value }))
    parsedRows.value = []
    router.push('/app/missions')
  } catch {
    // Error handled by store
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="ds-bulk-create">
    <div class="ds-bulk-create__header">
      <h1 class="ds-bulk-create__title">{{ t('missions.bulk.title') }}</h1>
      <p class="ds-bulk-create__subtitle">{{ t('missions.bulk.subtitle') }}</p>
    </div>

    <BCard variant="bordered" padding="lg" class="ds-bulk-create__card">
      <div class="ds-bulk-create__actions-top">
        <BButton variant="outline" size="sm" icon="bi-file-earmark-spreadsheet" @click="downloadCsvTemplate">
          {{ t('missions.bulk.downloadTemplateCsv') }}
        </BButton>
      </div>

      <FileUpload
        accept=".csv"
        :loading="parsing"
        @upload:file="handleFile"
        @error="toast.error"
      >
        <i class="bi bi-cloud-arrow-up ds-file-upload__icon" />
        <span class="ds-file-upload__text">{{ t('missions.bulk.upload') }}</span>
        <span class="ds-file-upload__hint">CSV</span>
      </FileUpload>

      <div v-if="parsedRows.length > 0" class="ds-bulk-create__preview">
        <div class="ds-bulk-create__summary">
          <span class="ds-bulk-create__summary-valid">
            <i class="bi bi-check-circle" />
            {{ t('missions.bulk.validCount', { count: validRows.length }) }}
          </span>
          <span v-if="errorRows.length > 0" class="ds-bulk-create__summary-error">
            <i class="bi bi-exclamation-circle" />
            {{ t('missions.bulk.errorCount', { count: errorRows.length }) }}
          </span>
        </div>

        <BTable
          :columns="columns"
          :rows="parsedRows"
          row-key="rowNumber"
          :striped="true"
          :bordered="true"
          :pagination="true"
          :page-size="10"
        >
          <template #cell-status="{ row }">
            <span v-if="row.errors.length === 0" class="ds-bulk-create__status ds-bulk-create__status--valid">
              <i class="bi bi-check-circle" />
              {{ t('missions.bulk.statusValid') }}
            </span>
            <span v-else class="ds-bulk-create__status ds-bulk-create__status--error" :title="row.errors.join(', ')">
              <i class="bi bi-x-circle" />
              {{ t('missions.bulk.statusError') }}
            </span>
          </template>
        </BTable>
      </div>

      <div v-if="successCount !== null" class="ds-bulk-create__success">
        <i class="bi bi-check-circle" />
        {{ t('missions.bulk.successMessage', { count: successCount }) }}
      </div>

      <div class="ds-bulk-create__actions-bottom">
        <BButton variant="ghost" @click="router.back()">
          {{ t('missions.create.cancel') }}
        </BButton>
        <BButton
          variant="accent"
          :loading="submitting"
          :disabled="!canSubmit"
          icon="bi-plus-circle"
          @click="handleConfirm"
        >
          {{ t('missions.bulk.confirm') }}
        </BButton>
      </div>
    </BCard>
  </div>
</template>

<style scoped>
.ds-bulk-create {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 64rem;
}

.ds-bulk-create__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-bulk-create__subtitle {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0.25rem 0 0;
}

.ds-bulk-create__card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.ds-bulk-create__actions-top {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.ds-bulk-create__preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ds-bulk-create__summary {
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
}

.ds-bulk-create__summary-valid {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--ds-success, #22c55e);
}

.ds-bulk-create__summary-error {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--ds-danger, #ef4444);
}

.ds-bulk-create__status {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8125rem;
  font-weight: 500;
}

.ds-bulk-create__status--valid {
  color: var(--ds-success, #22c55e);
}

.ds-bulk-create__status--error {
  color: var(--ds-danger, #ef4444);
  cursor: help;
}

.ds-bulk-create__success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  background: rgba(34, 197, 94, 0.1);
  color: var(--ds-success, #22c55e);
  font-size: 0.875rem;
}

.ds-bulk-create__actions-bottom {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--ds-border, #334155);
}

@media (max-width: 768px) {
  .ds-bulk-create {
    max-width: 100%;
  }
  .ds-bulk-create__actions-bottom {
    flex-direction: column-reverse;
  }
}
</style>
