import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import BulkMissionCreateView from '@/views/missions/BulkMissionCreateView.vue'

// Mock csv/sync
vi.mock('csv/sync', () => ({
  parse: vi.fn((text: string) => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map((h: string) => h.trim())
    return lines.slice(1).map((line: string) => {
      const values = line.split(',').map((v: string) => v.replace(/^"|"$/g, '').trim())
      const obj: Record<string, string> = {}
      headers.forEach((h: string, i: number) => { obj[h] = values[i] || '' })
      return obj
    })
  }),
}))

// Mock exceljs
vi.mock('exceljs', () => {
  class MockWorkbook {
    worksheets: any[] = []
    addWorksheet(name: string) {
      const sheet = {
        name,
        columns: [] as any[],
        rowCount: 0,
        getRow: (n: number) => ({
          eachCell: (cb: any) => {},
          values: [],
        }),
        eachRow: (cb: any) => {},
        addRow: (data: any) => ({
          eachCell: (cb: any) => {},
        }),
      }
      this.worksheets.push(sheet)
      return sheet
    }
  }
  return { default: { Workbook: MockWorkbook } }
})

// Mock the store
const mockCreateBulkMissions = vi.fn().mockResolvedValue({ count: 2, missions: [] })
vi.mock('@/stores/missions', () => ({
  useMissionsStore: () => ({
    createBulkMissions: mockCreateBulkMissions,
  }),
}))

// Mock toast
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
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
  })

  function createWrapper() {
    return mount(BulkMissionCreateView, {
      global: {
        plugins: [router],
        stubs: {
          BCard: { template: '<div class="ds-card"><slot /></div>' },
          BButton: { template: '<button class="ds-btn" :disabled="disabled"><slot /></button>', props: ['variant', 'size', 'icon', 'loading', 'disabled'] },
          BTable: { template: '<div class="ds-table"><slot /></div>', props: ['columns', 'rows', 'rowKey', 'striped', 'bordered', 'pagination', 'pageSize'] },
          FileUpload: { template: '<div class="ds-file-upload"><slot /><input type="file" @change="$emit(\'upload:file\', $event.target.files[0])" /></div>', props: ['accept', 'loading'], emits: ['upload:file', 'error'] },
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
    expect(wrapper.text()).toContain('Upload a CSV or XLSX file')
  })

  it('renders download template buttons', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Download CSV Template')
    expect(wrapper.text()).toContain('Download XLSX Template')
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
})
