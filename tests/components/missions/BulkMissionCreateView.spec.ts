import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import BulkMissionCreateView from '@/views/missions/BulkMissionCreateView.vue'

// Mock the store
const mockCreateBulkMissions = vi.fn().mockResolvedValue({ count: 2, missions: [] })
vi.mock('@/stores/missions', () => ({
  useMissionsStore: () => ({
    createBulkMissions: mockCreateBulkMissions,
  }),
}))

// Mock toast
const toastError = vi.fn()
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: toastError,
    info: vi.fn(),
    warning: vi.fn(),
  }),
}))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/app/missions', component: { template: '<div />' } },
    { path: '/app/missions/bulk', component: BulkMissionCreateView },
  ],
})

describe('BulkMissionCreateView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockCreateBulkMissions.mockClear()
    toastError.mockClear()
  })

  function createWrapper() {
    return mount(BulkMissionCreateView, {
      global: {
        plugins: [router],
        stubs: {
          BCard: { template: '<div class="ds-card"><slot /></div>' },
          BButton: { template: '<button class="ds-btn" :disabled="disabled"><slot /></button>', props: ['variant', 'size', 'icon', 'loading', 'disabled'] },
          BTable: { template: '<div class="ds-table"><slot /></div>', props: ['columns', 'rows', 'rowKey', 'striped', 'bordered', 'pagination', 'pageSize'] },
          FileUpload: { template: '<div class="ds-file-upload" :data-accept="accept"><slot /><input type="file" @change="$emit(\'upload:file\', $event.target.files[0])" /></div>', props: ['accept', 'loading'], emits: ['upload:file', 'error'] },
        },
      },
    })
  }

  it('renders the page title', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Bulk Create Missions')
  })

  it('renders the subtitle', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Upload a CSV file to create multiple missions at once.')
  })

  it('renders the CSV template download button only (no XLSX)', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Download CSV Template')
    expect(wrapper.text()).not.toContain('Download XLSX Template')
  })

  it('renders the upload area', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.ds-file-upload').exists()).toBe(true)
  })

  it('renders the confirm button as disabled initially', () => {
    const wrapper = createWrapper()
    const buttons = wrapper.findAll('button')
    const confirmBtn = buttons.find(b => b.text().includes('Create Missions'))
    expect(confirmBtn?.attributes('disabled')).toBeDefined()
  })

  it('renders the cancel button', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Cancel')
  })

  it('does not show preview table when no data', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.ds-table').exists()).toBe(false)
  })

  it('does not show success message initially', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).not.toContain('missions created successfully')
  })

  // ─── CSV-only regression tests ───────────────────────────────────────────
  // These guard against accidentally re-introducing XLSX support without a
  // browser-safe library (exceljs crashed the route in the browser with
  // "TypeError: import_util.default.inherits is not a function").

  it('restricts the file upload to .csv only', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.ds-file-upload').attributes('data-accept')).toBe('.csv')
  })

  it('rejects a .xlsx file with the file-format error toast', async () => {
    const wrapper = createWrapper()
    const file = new File(['fake'], 'missions.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    await (wrapper.vm as any).handleFile(file)
    expect(toastError).toHaveBeenCalled()
    // No preview table should be rendered for a rejected file
    expect(wrapper.find('.ds-table').exists()).toBe(false)
  })

  it('accepts a .csv file and parses rows into the preview table', async () => {
    const wrapper = createWrapper()
    const csv = 'title,clientId,pricingType,description,agreedAmount,currency,agreedChecklist,type\n'
      + '"Example Mission",1,fixed,"Sample mission description",100,USD,"Task 1|Task 2",one_time'
    const file = new File([csv], 'missions.csv', { type: 'text/csv' })
    await (wrapper.vm as any).handleFile(file)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.ds-table').exists()).toBe(true)
    expect(toastError).not.toHaveBeenCalled()
  })

  it('downloadCsvTemplate produces a CSV blob with the expected headers', async () => {
    // Capture the Blob passed to URL.createObjectURL without interfering with
    // Vue's DOM mounting (which needs the real document.createElement).
    const captured: Blob[] = []
    const createObjectURL = vi.fn((blob: Blob) => {
      captured.push(blob)
      return 'blob:mock'
    })
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: vi.fn() })

    const wrapper = createWrapper()
    await (wrapper.vm as any).downloadCsvTemplate()

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(captured).toHaveLength(1)
    const blob = captured[0]
    expect(blob.type).toBe('text/csv;charset=utf-8;')
    const text = await blob.text()
    expect(text).toContain('title,clientId,pricingType,description,agreedAmount,currency,agreedChecklist,type')

    vi.unstubAllGlobals()
  })
})
