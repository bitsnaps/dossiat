<script lang="ts" setup>
import { ref, computed, watch, reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

/* ------------------------------------------------------------------
 * BTable — reusable data table component
 *
 * Slots:
 *   header-{colKey}    custom header cells
 *   cell-{colKey}      custom data cells (scoped: { row, value, index })
 *   expanded-row       content for expandable rows (scoped: { row, index })
 *   empty              empty state
 *   loading            loading overlay
 *   toolbar-left       top-left toolbar
 *   toolbar-right      top-right toolbar (default: search)
 *   footer-left        bottom-left (default: row count)
 *   footer-right       bottom-right (default: pagination)
 * ------------------------------------------------------------------ */

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  filterType?: 'text' | 'number' | 'select'
  filterOptions?: (string | number)[]
  width?: string
  align?: 'left' | 'center' | 'right'
  class?: string
  headerClass?: string
  formatter?: (value: any, row: any) => string
  visible?: boolean
}

interface Props {
  columns: TableColumn[]
  rows?: any[]
  rowKey?: string | ((row: any) => any)
  loading?: boolean
  selectable?: boolean
  singleSelect?: boolean
  expandable?: boolean
  pagination?: boolean
  page?: number
  pageSize?: number
  pageSizeOptions?: number[]
  serverSide?: boolean
  totalRows?: number
  sortKey?: string
  sortDirection?: string
  searchQuery?: string
  searchPlaceholder?: string
  searchableKeys?: string[] | null
  striped?: boolean
  hover?: boolean
  bordered?: boolean
  compact?: boolean
  sticky?: boolean
  emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
  rows: () => [],
  rowKey: 'id',
  loading: false,
  selectable: false,
  singleSelect: false,
  expandable: false,
  pagination: false,
  page: 1,
  pageSize: 10,
  pageSizeOptions: () => [10, 25, 50, 100],
  serverSide: false,
  totalRows: 0,
  sortKey: '',
  sortDirection: '',
  searchQuery: '',
  searchPlaceholder: '',
  searchableKeys: null,
  striped: false,
  hover: true,
  bordered: false,
  compact: false,
  sticky: false,
  emptyText: '',
})

const resolvedSearchPlaceholder = computed(() => props.searchPlaceholder || t('components.table.search'))
const resolvedEmptyText = computed(() => props.emptyText || t('components.table.noData'))

const emit = defineEmits<{
  'sort-change': [payload: { key: string; direction: string }]
  'filter-change': [payload: { key: string; value: string; filters: Record<string, string> }]
  'page-change': [payload: { page: number; pageSize: number }]
  'page-size-change': [pageSize: number]
  'selection-change': [rows: any[]]
  'row-click': [payload: { row: any; index: number }]
  'row-expand': [payload: { row: any; expanded: boolean }]
  'update:search-query': [value: string]
}>()

// ---- internal state ----
const internalPage = ref(props.page || 1)
const internalPageSize = ref(props.pageSize)
const internalSortKey = ref(props.sortKey)
const internalSortDir = ref(props.sortDirection)
const localSearch = ref(props.searchQuery)
const selectedKeys = ref(new Set<any>())
const expandedKeys = ref(new Set<any>())
const columnFilters = reactive<Record<string, string>>({})

// Sync external prop changes
watch(() => props.page, v => (internalPage.value = v))
watch(() => props.pageSize, v => (internalPageSize.value = v))
watch(() => props.sortKey, v => (internalSortKey.value = v))
watch(() => props.sortDirection, v => (internalSortDir.value = v))
watch(() => props.searchQuery, v => (localSearch.value = v))

// Reset filters when columns change
watch(() => props.columns, cols => {
  cols.forEach(c => {
    if (columnFilters[c.key] === undefined) columnFilters[c.key] = ''
  })
}, { immediate: true })

const getRowKey = (row: any) =>
  typeof props.rowKey === 'function' ? props.rowKey(row) : row[props.rowKey]

// ---- column helpers ----
const visibleColumns = computed(() =>
  props.columns.filter(c => c.visible !== false),
)
const totalColumns = computed(() =>
  visibleColumns.value.length
  + (props.selectable ? 1 : 0)
  + (props.expandable ? 1 : 0),
)
const hasColumnFilters = computed(() =>
  visibleColumns.value.some(c => c.filterable),
)

// ---- filtering ----
const filteredRows = computed(() => {
  if (props.serverSide) return props.rows
  let data = props.rows.slice()

  // global search
  if (localSearch.value) {
    const q = localSearch.value.toLowerCase()
    const keys = props.searchableKeys || visibleColumns.value.map(c => c.key)
    data = data.filter(row =>
      keys.some(k => {
        const v = row[k]
        return v != null && String(v).toLowerCase().includes(q)
      }),
    )
  }

  // per-column filters
  for (const col of visibleColumns.value) {
    const fv = columnFilters[col.key]
    if (!fv) continue
    data = data.filter(row => {
      const v = row[col.key]
      if (v == null) return false
      if (col.filterType === 'number') return Number(v) === Number(fv)
      return String(v).toLowerCase().includes(String(fv).toLowerCase())
    })
  }
  return data
})

// ---- sorting ----
const sortedRows = computed(() => {
  if (props.serverSide) return filteredRows.value
  const key = internalSortKey.value
  const dir = internalSortDir.value
  if (!key || !dir) return filteredRows.value
  const arr = filteredRows.value.slice()
  const mult = dir === 'asc' ? 1 : -1
  arr.sort((a, b) => {
    const av = a[key]; const bv = b[key]
    if (av == null) return 1
    if (bv == null) return -1
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * mult
    return String(av).localeCompare(String(bv)) * mult
  })
  return arr
})

// ---- pagination ----
const totalItems = computed(() =>
  props.serverSide ? (props.totalRows || 0) : sortedRows.value.length,
)
const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalItems.value / internalPageSize.value)),
)
const pagedRows = computed(() => {
  if (props.serverSide || !props.pagination) return sortedRows.value
  const start = (internalPage.value - 1) * internalPageSize.value
  return sortedRows.value.slice(start, start + internalPageSize.value)
})

// reset to page 1 when filters/search change
watch([localSearch, columnFilters], () => {
  if (!props.serverSide) internalPage.value = 1
})

// ---- actions ----
function toggleSort(col: TableColumn) {
  if (!col.sortable) return
  if (internalSortKey.value !== col.key) {
    internalSortKey.value = col.key
    internalSortDir.value = 'asc'
  }
  else {
    internalSortDir.value =
      internalSortDir.value === 'asc' ? 'desc'
        : internalSortDir.value === 'desc' ? '' : 'asc'
    if (!internalSortDir.value) internalSortKey.value = ''
  }
  emit('sort-change', { key: internalSortKey.value, direction: internalSortDir.value })
}

function goToPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  internalPage.value = p
  emit('page-change', { page: p, pageSize: internalPageSize.value })
}

function changePageSize(e: Event) {
  internalPageSize.value = Number((e.target as HTMLSelectElement).value)
  internalPage.value = 1
  emit('page-size-change', internalPageSize.value)
  emit('page-change', { page: 1, pageSize: internalPageSize.value })
}

function onSearchInput(e: Event) {
  localSearch.value = (e.target as HTMLInputElement).value
  emit('update:search-query', localSearch.value)
}

function onColumnFilter(colKey: string, value: string) {
  columnFilters[colKey] = value
  emit('filter-change', { key: colKey, value, filters: { ...columnFilters } })
}

function clearSearch() {
  localSearch.value = ''
  emit('update:search-query', '')
}

// ---- selection ----
function isAllSelected() {
  return pagedRows.value.length > 0
    && pagedRows.value.every(r => selectedKeys.value.has(getRowKey(r)))
}

function toggleSelectAll() {
  const set = new Set(selectedKeys.value)
  if (isAllSelected()) {
    pagedRows.value.forEach(r => set.delete(getRowKey(r)))
  }
  else {
    pagedRows.value.forEach(r => set.add(getRowKey(r)))
  }
  selectedKeys.value = set
  emitSelection()
}

function toggleSelectRow(row: any) {
  const key = getRowKey(row)
  const set = new Set(selectedKeys.value)
  if (props.singleSelect) {
    set.clear()
    if (!selectedKeys.value.has(key)) set.add(key)
  }
  else {
    set.has(key) ? set.delete(key) : set.add(key)
  }
  selectedKeys.value = set
  emitSelection()
}

function emitSelection() {
  const sel = props.rows.filter(r => selectedKeys.value.has(getRowKey(r)))
  emit('selection-change', sel)
}

// ---- expand ----
function toggleExpand(row: any) {
  const key = getRowKey(row)
  const set = new Set(expandedKeys.value)
  set.has(key) ? set.delete(key) : set.add(key)
  expandedKeys.value = set
  emit('row-expand', { row, expanded: set.has(key) })
}

function formatCell(col: TableColumn, row: any) {
  const raw = row[col.key]
  return col.formatter ? col.formatter(raw, row) : raw
}

// ---- pagination window (max 5 page buttons) ----
const pageWindow = computed(() => {
  const total = totalPages.value
  const cur = internalPage.value
  const size = Math.min(5, total)
  let start = Math.max(1, cur - Math.floor(size / 2))
  let end = start + size - 1
  if (end > total) { end = total; start = Math.max(1, end - size + 1) }
  const arr: number[] = []
  for (let i = start; i <= end; i++) arr.push(i)
  return arr
})
</script>

<template>
  <div class="ds-table" :class="{ 'ds-table--sticky': sticky }">
    <!-- Toolbar -->
    <div class="ds-table-toolbar">
      <div>
        <slot name="toolbar-left">
          <span v-if="selectable && selectedKeys.size" class="ds-table-toolbar__info">
            {{ selectedKeys.size }} {{ t('components.table.selected') }}
          </span>
        </slot>
      </div>
      <div>
        <slot name="toolbar-right">
          <div class="ds-table-search">
            <i class="bi bi-search ds-table-search__icon" />
            <input
              type="text"
              class="ds-table-search__input"
              :placeholder="resolvedSearchPlaceholder"
              :value="localSearch"
              @input="onSearchInput"
            />
            <button v-if="localSearch" class="ds-table-search__clear" @click="clearSearch">
              <i class="bi bi-x" />
            </button>
          </div>
        </slot>
      </div>
    </div>

    <!-- Table -->
    <div class="ds-table-wrap">
      <div v-if="loading" class="ds-table-overlay">
        <slot name="loading">
          <div class="ds-table-spinner" />
        </slot>
      </div>

      <div class="ds-table-responsive">
        <table
          class="ds-table__table"
          :class="{
            'ds-table__table--striped': striped,
            'ds-table__table--bordered': bordered,
            'ds-table__table--hover': hover,
            'ds-table__table--compact': compact,
          }"
        >
          <thead>
            <tr>
              <th v-if="expandable" class="ds-table__th--expand" />
              <th v-if="selectable" class="ds-table__th--select">
                <input
                  v-if="!singleSelect"
                  type="checkbox"
                  class="ds-table-checkbox"
                  :checked="isAllSelected()"
                  @change="toggleSelectAll"
                />
              </th>
              <th
                v-for="col in visibleColumns"
                :key="'th-' + col.key"
                :style="col.width ? { width: col.width } : {}"
                :class="[
                  col.headerClass || '',
                  col.sortable ? 'ds-table__th--sortable' : '',
                  internalSortKey === col.key
                    ? internalSortDir === 'asc'
                      ? 'ds-table__th--sort-asc'
                      : 'ds-table__th--sort-desc'
                    : '',
                ]"
                @click="toggleSort(col)"
              >
                <slot :name="'header-' + col.key" :column="col">
                  <div
                    class="ds-table__th-content"
                    :style="
                      col.align
                        ? { justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start' }
                        : {}
                    "
                  >
                    <span>{{ col.label }}</span>
                    <span v-if="col.sortable" class="ds-table__sort-indicator">
                      <i v-if="internalSortKey !== col.key" class="bi bi-arrow-down-up" />
                      <i v-else-if="internalSortDir === 'asc'" class="bi bi-arrow-up" />
                      <i v-else-if="internalSortDir === 'desc'" class="bi bi-arrow-down" />
                    </span>
                  </div>
                </slot>
              </th>
            </tr>
            <tr v-if="hasColumnFilters">
              <th v-if="expandable" />
              <th v-if="selectable" />
              <th v-for="col in visibleColumns" :key="'tf-' + col.key">
                <template v-if="col.filterable">
                  <select
                    v-if="col.filterType === 'select'"
                    class="ds-table-filter"
                    :value="columnFilters[col.key]"
                    @input="onColumnFilter(col.key, ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="">{{ t('components.table.all') }}</option>
                    <option v-for="opt in (col.filterOptions || [])" :key="opt" :value="opt">
                      {{ opt }}
                    </option>
                  </select>
                  <input
                    v-else
                    :type="col.filterType === 'number' ? 'number' : 'text'"
                    class="ds-table-filter"
                    :placeholder="t('components.table.filter')"
                    :value="columnFilters[col.key]"
                    @input="onColumnFilter(col.key, ($event.target as HTMLInputElement).value)"
                  />
                </template>
              </th>
            </tr>
          </thead>

          <tbody>
            <template v-if="pagedRows.length">
              <template v-for="(row, i) in pagedRows" :key="getRowKey(row)">
                <tr
                  :class="{
                    'ds-table__row--selected': selectedKeys.has(getRowKey(row)),
                    'ds-table__row--expanded': expandedKeys.has(getRowKey(row)),
                  }"
                  @click="emit('row-click', { row, index: i })"
                >
                  <td v-if="expandable" class="ds-table__td--expand">
                    <button class="ds-table-expand-btn" @click.stop="toggleExpand(row)">
                      <i
                        class="bi"
                        :class="
                          expandedKeys.has(getRowKey(row))
                            ? 'bi-chevron-down'
                            : 'bi-chevron-right'
                        "
                      />
                    </button>
                  </td>
                  <td v-if="selectable" class="ds-table__td--select" @click.stop="toggleSelectRow(row)">
                    <input
                      type="checkbox"
                      class="ds-table-checkbox"
                      :checked="selectedKeys.has(getRowKey(row))"
                    />
                  </td>
                  <td
                    v-for="col in visibleColumns"
                    :key="col.key"
                    :class="col.class || ''"
                    :style="col.align ? { textAlign: col.align } : {}"
                  >
                    <slot :name="'cell-' + col.key" :row="row" :value="row[col.key]" :index="i">
                      {{ formatCell(col, row) }}
                    </slot>
                  </td>
                </tr>
                <tr v-if="expandable && expandedKeys.has(getRowKey(row))" class="ds-table__row--expanded">
                  <td :colspan="totalColumns" class="ds-table__td--expand-content">
                    <slot name="expanded-row" :row="row" :index="i" />
                  </td>
                </tr>
              </template>
            </template>

            <tr v-else>
              <td :colspan="totalColumns" class="ds-table__empty">
                <slot name="empty">
                  <div class="ds-table-empty">
                    <i class="bi bi-inbox" />
                    <span>{{ resolvedEmptyText }}</span>
                  </div>
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Footer -->
    <div v-if="pagination" class="ds-table-footer">
      <div>
        <slot name="footer-left">
          <span class="ds-table-footer__info">
            {{ t('components.table.showing') }}
            <strong>{{ pagedRows.length === 0 ? 0 : (internalPage - 1) * internalPageSize + 1 }}</strong>
            – <strong>{{ Math.min(internalPage * internalPageSize, totalItems) }}</strong>
            {{ t('components.table.of') }} <strong>{{ totalItems }}</strong>
          </span>
        </slot>
      </div>
      <div class="ds-table-footer__pagination">
        <slot name="footer-right">
          <select
            class="ds-table-pagesize"
            :value="internalPageSize"
            @change="changePageSize"
          >
            <option v-for="n in pageSizeOptions" :key="n" :value="n">{{ n }} {{ t('components.table.perPage') }}</option>
          </select>

          <nav>
            <ul class="ds-table-pager">
              <li class="ds-table-pager__item" :class="{ 'ds-table-pager__item--disabled': internalPage === 1 }">
                <button class="ds-table-pager__link" @click="goToPage(1)">
                  <i class="bi bi-chevron-double-left" />
                </button>
              </li>
              <li class="ds-table-pager__item" :class="{ 'ds-table-pager__item--disabled': internalPage === 1 }">
                <button class="ds-table-pager__link" @click="goToPage(internalPage - 1)">
                  <i class="bi bi-chevron-left" />
                </button>
              </li>
              <li
                v-for="p in pageWindow"
                :key="p"
                class="ds-table-pager__item"
                :class="{ 'ds-table-pager__item--active': p === internalPage }"
              >
                <button class="ds-table-pager__link" @click="goToPage(p)">{{ p }}</button>
              </li>
              <li
                class="ds-table-pager__item"
                :class="{ 'ds-table-pager__item--disabled': internalPage === totalPages }"
              >
                <button class="ds-table-pager__link" @click="goToPage(internalPage + 1)">
                  <i class="bi bi-chevron-right" />
                </button>
              </li>
              <li
                class="ds-table-pager__item"
                :class="{ 'ds-table-pager__item--disabled': internalPage === totalPages }"
              >
                <button class="ds-table-pager__link" @click="goToPage(totalPages)">
                  <i class="bi bi-chevron-double-right" />
                </button>
              </li>
            </ul>
          </nav>
        </slot>
      </div>
    </div>
  </div>
</template>
