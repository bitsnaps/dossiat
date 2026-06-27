import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BTable from '@/components/base/BTable.vue'
import type { TableColumn } from '@/components/base/BTable.vue'

const columns: TableColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'role', label: 'Role', sortable: true, filterable: true, filterType: 'select', filterOptions: ['Engineer', 'Designer', 'Manager'] },
  { key: 'salary', label: 'Salary', sortable: true, align: 'right' },
  { key: 'status', label: 'Status' },
]

const rows = [
  { id: 1, name: 'Alice', role: 'Engineer', salary: 90000, status: 'Active' },
  { id: 2, name: 'Bob', role: 'Designer', salary: 80000, status: 'Active' },
  { id: 3, name: 'Charlie', role: 'Manager', salary: 120000, status: 'Inactive' },
]

describe('BTable', () => {
  it('renders table with columns and rows', () => {
    const wrapper = mount(BTable, { props: { columns, rows } })
    expect(wrapper.find('.ds-table').exists()).toBe(true)
    expect(wrapper.findAll('thead tr').length).toBe(2) // header row + filter row
    expect(wrapper.findAll('tbody tr').length).toBe(3)
  })

  it('renders column labels in thead', () => {
    const wrapper = mount(BTable, { props: { columns, rows } })
    const ths = wrapper.findAll('th')
    expect(ths[0].text()).toContain('Name')
    expect(ths[1].text()).toContain('Role')
    expect(ths[2].text()).toContain('Salary')
    expect(ths[3].text()).toContain('Status')
  })

  it('renders cell values', () => {
    const wrapper = mount(BTable, { props: { columns, rows } })
    const cells = wrapper.findAll('tbody tr:first-child td')
    expect(cells[0].text()).toContain('Alice')
    expect(cells[1].text()).toContain('Engineer')
  })

  it('applies align style to columns', () => {
    const wrapper = mount(BTable, { props: { columns, rows } })
    // Find th in the first thead row (header row), skip the filter row
    const headerRow = wrapper.find('thead tr')
    const salaryHeader = headerRow.findAll('th')[2]
    const thContent = salaryHeader.find('.ds-table__th-content')
    expect(thContent.attributes('style')).toContain('flex-end')
  })

  it('shows empty state when no rows', () => {
    const wrapper = mount(BTable, { props: { columns, rows: [] } })
    expect(wrapper.find('.ds-table-empty').exists()).toBe(true)
  })

  it('shows custom empty slot', () => {
    const wrapper = mount(BTable, {
      props: { columns, rows: [] },
      slots: { empty: '<div class="custom-empty">Nothing here</div>' },
    })
    expect(wrapper.find('.custom-empty').exists()).toBe(true)
  })

  it('applies striped class', () => {
    const wrapper = mount(BTable, { props: { columns, rows, striped: true } })
    expect(wrapper.find('table').classes()).toContain('ds-table__table--striped')
  })

  it('applies hover class by default', () => {
    const wrapper = mount(BTable, { props: { columns, rows } })
    expect(wrapper.find('table').classes()).toContain('ds-table__table--hover')
  })

  it('applies compact class', () => {
    const wrapper = mount(BTable, { props: { columns, rows, compact: true } })
    expect(wrapper.find('table').classes()).toContain('ds-table__table--compact')
  })

  it('applies bordered class', () => {
    const wrapper = mount(BTable, { props: { columns, rows, bordered: true } })
    expect(wrapper.find('table').classes()).toContain('ds-table__table--bordered')
  })

  it('shows loading overlay', () => {
    const wrapper = mount(BTable, { props: { columns, rows, loading: true } })
    expect(wrapper.find('.ds-table-overlay').exists()).toBe(true)
  })

  it('shows default loading spinner', () => {
    const wrapper = mount(BTable, { props: { columns, rows, loading: true } })
    expect(wrapper.find('.ds-table-spinner').exists()).toBe(true)
  })

  it('emits row-click when row is clicked', async () => {
    const wrapper = mount(BTable, { props: { columns, rows } })
    await wrapper.find('tbody tr').trigger('click')
    expect(wrapper.emitted('row-click')).toHaveLength(1)
    expect(wrapper.emitted('row-click')![0][0]).toEqual({ row: rows[0], index: 0 })
  })

  // ---- Sorting ----
  it('shows sort indicator for sortable columns', () => {
    const wrapper = mount(BTable, { props: { columns, rows } })
    const sortableHeaders = wrapper.findAll('.ds-table__th--sortable')
    expect(sortableHeaders.length).toBe(3) // name, role, salary
  })

  it('sorts ascending on first click', async () => {
    const wrapper = mount(BTable, { props: { columns, rows } })
    const nameHeader = wrapper.findAll('th')[0]
    await nameHeader.trigger('click')
    expect(nameHeader.classes()).toContain('ds-table__th--sort-asc')
    expect(wrapper.emitted('sort-change')).toHaveLength(1)
    expect(wrapper.emitted('sort-change')![0][0]).toEqual({ key: 'name', direction: 'asc' })
  })

  it('sorts descending on second click', async () => {
    const wrapper = mount(BTable, { props: { columns, rows } })
    const nameHeader = wrapper.findAll('th')[0]
    await nameHeader.trigger('click') // asc
    await nameHeader.trigger('click') // desc
    expect(nameHeader.classes()).toContain('ds-table__th--sort-desc')
  })

  it('clears sort on third click', async () => {
    const wrapper = mount(BTable, { props: { columns, rows } })
    const nameHeader = wrapper.findAll('th')[0]
    await nameHeader.trigger('click') // asc
    await nameHeader.trigger('click') // desc
    await nameHeader.trigger('click') // cleared
    expect(nameHeader.classes()).not.toContain('ds-table__th--sort-asc')
    expect(nameHeader.classes()).not.toContain('ds-table__th--sort-desc')
  })

  it('renders rows in sorted order (asc)', async () => {
    const wrapper = mount(BTable, { props: { columns, rows } })
    const nameHeader = wrapper.findAll('th')[0]
    await nameHeader.trigger('click')
    const firstCell = wrapper.find('tbody tr td')
    expect(firstCell.text()).toContain('Alice')
  })

  it('renders rows in sorted order (desc)', async () => {
    const wrapper = mount(BTable, { props: { columns, rows } })
    const nameHeader = wrapper.findAll('th')[0]
    await nameHeader.trigger('click') // asc
    await nameHeader.trigger('click') // desc
    const firstCell = wrapper.find('tbody tr td')
    expect(firstCell.text()).toContain('Charlie')
  })

  it('sorts by numeric column', async () => {
    const wrapper = mount(BTable, { props: { columns, rows } })
    const headerRow = wrapper.find('thead tr')
    const salaryHeader = headerRow.findAll('th')[2]
    await salaryHeader.trigger('click') // asc
    const firstCell = wrapper.find('tbody tr td:nth-child(3)')
    expect(firstCell.text()).toContain('80000')
  })

  // ---- Search ----
  it('renders search input in toolbar', () => {
    const wrapper = mount(BTable, { props: { columns, rows } })
    expect(wrapper.find('.ds-table-search__input').exists()).toBe(true)
  })

  it('filters rows by search query', async () => {
    const wrapper = mount(BTable, { props: { columns, rows, searchQuery: 'Alice' } })
    expect(wrapper.findAll('tbody tr').length).toBe(1)
    expect(wrapper.find('tbody tr').text()).toContain('Alice')
  })

  it('emits update:search-query on input', async () => {
    const wrapper = mount(BTable, { props: { columns, rows } })
    const input = wrapper.find('.ds-table-search__input')
    await input.setValue('Bob')
    expect(wrapper.emitted('update:search-query')).toHaveLength(1)
    expect(wrapper.emitted('update:search-query')![0][0]).toBe('Bob')
  })

  it('shows clear button when search has value', () => {
    const wrapper = mount(BTable, { props: { columns, rows, searchQuery: 'test' } })
    expect(wrapper.find('.ds-table-search__clear').exists()).toBe(true)
  })

  it('hides clear button when search is empty', () => {
    const wrapper = mount(BTable, { props: { columns, rows, searchQuery: '' } })
    expect(wrapper.find('.ds-table-search__clear').exists()).toBe(false)
  })

  it('clears search when clear button clicked', async () => {
    const wrapper = mount(BTable, { props: { columns, rows, searchQuery: 'test' } })
    await wrapper.find('.ds-table-search__clear').trigger('click')
    expect(wrapper.emitted('update:search-query')![0][0]).toBe('')
  })

  it('uses custom search placeholder', () => {
    const wrapper = mount(BTable, { props: { columns, rows, searchPlaceholder: 'Find...' } })
    expect(wrapper.find('.ds-table-search__input').attributes('placeholder')).toBe('Find...')
  })

  // ---- Column filters ----
  it('renders filter row when columns have filterable', () => {
    const wrapper = mount(BTable, { props: { columns, rows } })
    expect(wrapper.findAll('thead tr').length).toBe(2)
  })

  it('renders select filter for select type', () => {
    const wrapper = mount(BTable, { props: { columns, rows } })
    const selects = wrapper.findAll('.ds-table-filter')
    expect(selects.length).toBeGreaterThanOrEqual(1)
    expect(selects[0].element.tagName).toBe('SELECT')
  })

  it('filters rows by column select filter', async () => {
    const wrapper = mount(BTable, { props: { columns, rows } })
    const select = wrapper.find('.ds-table-filter')
    await select.setValue('Engineer')
    expect(wrapper.findAll('tbody tr').length).toBe(1)
    expect(wrapper.find('tbody tr').text()).toContain('Alice')
  })

  it('emits filter-change when column filter changes', async () => {
    const wrapper = mount(BTable, { props: { columns, rows } })
    const select = wrapper.find('.ds-table-filter')
    await select.setValue('Designer')
    expect(wrapper.emitted('filter-change')).toHaveLength(1)
  })

  // ---- Pagination ----
  it('does not show footer when pagination is false', () => {
    const wrapper = mount(BTable, { props: { columns, rows } })
    expect(wrapper.find('.ds-table-footer').exists()).toBe(false)
  })

  it('shows footer when pagination is true', () => {
    const wrapper = mount(BTable, { props: { columns, rows, pagination: true, pageSize: 2 } })
    expect(wrapper.find('.ds-table-footer').exists()).toBe(true)
  })

  it('paginates rows correctly', () => {
    const wrapper = mount(BTable, { props: { columns, rows, pagination: true, pageSize: 2 } })
    expect(wrapper.findAll('tbody tr').length).toBe(2)
  })

  it('shows page count info', () => {
    const wrapper = mount(BTable, { props: { columns, rows, pagination: true, pageSize: 2 } })
    expect(wrapper.find('.ds-table-footer__info').text()).toContain('2')
    expect(wrapper.find('.ds-table-footer__info').text()).toContain('3')
  })

  it('renders pager buttons', () => {
    const wrapper = mount(BTable, { props: { columns, rows, pagination: true, pageSize: 2 } })
    expect(wrapper.find('.ds-table-pager').exists()).toBe(true)
    expect(wrapper.findAll('.ds-table-pager__link').length).toBeGreaterThanOrEqual(5) // first, prev, 1, 2, next, last
  })

  it('navigates to next page', async () => {
    const wrapper = mount(BTable, { props: { columns, rows, pagination: true, pageSize: 2, page: 1 } })
    // Click next page button (5th link = next)
    const links = wrapper.findAll('.ds-table-pager__link')
    await links[4].trigger('click') // next
    expect(wrapper.emitted('page-change')).toHaveLength(1)
    expect(wrapper.emitted('page-change')![0][0]).toEqual({ page: 2, pageSize: 2 })
  })

  it('shows page size selector', () => {
    const wrapper = mount(BTable, {
      props: { columns, rows, pagination: true, pageSizeOptions: [5, 10, 25] },
    })
    const select = wrapper.find('.ds-table-pagesize')
    expect(select.exists()).toBe(true)
    expect(select.findAll('option').length).toBe(3)
  })

  it('emits page-size-change when page size selector changes', async () => {
    const wrapper = mount(BTable, {
      props: { columns, rows, pagination: true, pageSize: 10 },
    })
    await wrapper.find('.ds-table-pagesize').setValue(25)
    expect(wrapper.emitted('page-size-change')).toHaveLength(1)
    expect(wrapper.emitted('page-size-change')![0][0]).toBe(25)
  })

  // ---- Selection ----
  it('shows select-all checkbox when selectable', () => {
    const wrapper = mount(BTable, { props: { columns, rows, selectable: true } })
    expect(wrapper.find('.ds-table__th--select').exists()).toBe(true)
    expect(wrapper.find('.ds-table-checkbox').exists()).toBe(true)
  })

  it('shows selection count in toolbar', async () => {
    const wrapper = mount(BTable, {
      props: { columns, rows, selectable: true },
      global: { stubs: { BTable: false } },
    })
    // Select all
    const selectAll = wrapper.find('.ds-table__th--select .ds-table-checkbox')
    await selectAll.setValue(true)
    // After selection, toolbar should show count
    const info = wrapper.find('.ds-table-toolbar__info')
    expect(info.exists()).toBe(true)
  })

  it('emits selection-change when row checkbox clicked', async () => {
    const wrapper = mount(BTable, { props: { columns, rows, selectable: true } })
    const rowCheckbox = wrapper.find('tbody .ds-table__td--select')
    await rowCheckbox.trigger('click')
    expect(wrapper.emitted('selection-change')).toHaveLength(1)
  })

  it('does not show select-all when singleSelect', () => {
    const wrapper = mount(BTable, { props: { columns, rows, selectable: true, singleSelect: true } })
    expect(wrapper.find('.ds-table__th--select .ds-table-checkbox').exists()).toBe(false)
  })

  // ---- Expandable ----
  it('shows expand column when expandable', () => {
    const wrapper = mount(BTable, { props: { columns, rows, expandable: true } })
    expect(wrapper.find('.ds-table__th--expand').exists()).toBe(true)
    expect(wrapper.find('.ds-table-expand-btn').exists()).toBe(true)
  })

  it('emits row-expand when expand button clicked', async () => {
    const wrapper = mount(BTable, { props: { columns, rows, expandable: true } })
    await wrapper.find('.ds-table-expand-btn').trigger('click')
    expect(wrapper.emitted('row-expand')).toHaveLength(1)
    expect(wrapper.emitted('row-expand')![0][0]).toEqual({ row: rows[0], expanded: true })
  })

  it('renders expanded-row slot', async () => {
    const wrapper = mount(BTable, {
      props: { columns, rows, expandable: true },
      slots: {
        'expanded-row': '<div class="expanded-content">Details</div>',
      },
    })
    await wrapper.find('.ds-table-expand-btn').trigger('click')
    expect(wrapper.find('.expanded-content').exists()).toBe(true)
  })

  // ---- Custom cell slots ----
  it('renders custom cell slot', () => {
    const wrapper = mount(BTable, {
      props: { columns, rows },
      slots: {
        'cell-name': '<span class="custom-name">Custom Name</span>',
      },
    })
    expect(wrapper.find('.custom-name').exists()).toBe(true)
  })

  it('provides row and value to cell slot', () => {
    const wrapper = mount(BTable, {
      props: { columns: [columns[0]], rows },
      slots: {
        'cell-name': '<span class="slot-value">{{ value }}</span>',
      },
    })
    // The slot receives { row, value, index } — value is row['name']
    expect(wrapper.find('.slot-value').text()).toBe('Alice')
  })

  // ---- Custom header slot ----
  it('renders custom header slot', () => {
    const wrapper = mount(BTable, {
      props: { columns, rows },
      slots: {
        'header-name': '<span class="custom-header">Custom Header</span>',
      },
    })
    expect(wrapper.find('.custom-header').exists()).toBe(true)
  })

  // ---- Toolbar slots ----
  it('renders toolbar-left slot', () => {
    const wrapper = mount(BTable, {
      props: { columns, rows },
      slots: { 'toolbar-left': '<span class="toolbar-left-slot">Left</span>' },
    })
    expect(wrapper.find('.toolbar-left-slot').exists()).toBe(true)
  })

  it('renders toolbar-right slot', () => {
    const wrapper = mount(BTable, {
      props: { columns, rows },
      slots: { 'toolbar-right': '<div class="toolbar-right-slot">Right</div>' },
    })
    expect(wrapper.find('.toolbar-right-slot').exists()).toBe(true)
  })

  // ---- Footer slots ----
  it('renders footer-left slot', () => {
    const wrapper = mount(BTable, {
      props: { columns, rows, pagination: true },
      slots: { 'footer-left': '<span class="footer-left-slot">Left</span>' },
    })
    expect(wrapper.find('.footer-left-slot').exists()).toBe(true)
  })

  it('renders footer-right slot', () => {
    const wrapper = mount(BTable, {
      props: { columns, rows, pagination: true },
      slots: { 'footer-right': '<span class="footer-right-slot">Right</span>' },
    })
    expect(wrapper.find('.footer-right-slot').exists()).toBe(true)
  })

  // ---- Hidden columns ----
  it('hides columns with visible: false', () => {
    const cols: TableColumn[] = [
      { key: 'name', label: 'Name', visible: true },
      { key: 'hidden', label: 'Hidden', visible: false },
    ]
    const wrapper = mount(BTable, { props: { columns: cols, rows } })
    expect(wrapper.findAll('th').length).toBe(1)
  })

  // ---- Column formatter ----
  it('applies column formatter', () => {
    const cols: TableColumn[] = [
      { key: 'salary', label: 'Salary', formatter: (v: number) => `$${v.toLocaleString()}` },
    ]
    const wrapper = mount(BTable, { props: { columns: cols, rows } })
    expect(wrapper.find('td').text()).toContain('$90,000')
  })

  it('calls formatter with (value, row) — not (row)', () => {
    const spy = vi.fn(() => 'formatted')
    const cols: TableColumn[] = [
      { key: 'name', label: 'Name', formatter: spy },
    ]
    mount(BTable, { props: { columns: cols, rows } })
    expect(spy).toHaveBeenCalledTimes(rows.length)
    // First call: value is 'Alice', row is the full row object
    expect(spy.mock.calls[0][0]).toBe('Alice')
    expect(spy.mock.calls[0][1]).toEqual(rows[0])
    expect(spy.mock.calls[0][1].firstName).toBeUndefined() // rows don't have firstName
    expect(spy.mock.calls[0][1].name).toBe('Alice')
  })

  it('formatter can access full row to compute derived values', () => {
    const cols: TableColumn[] = [
      {
        key: 'name',
        label: 'Full Name',
        // Simulates pattern: key doesn't match data, formatter needs row
        formatter: (_v: any, row: any) => `${row.name} (${row.role})`,
      },
    ]
    const wrapper = mount(BTable, { props: { columns: cols, rows } })
    expect(wrapper.find('tbody tr td').text()).toBe('Alice (Engineer)')
  })

  // ---- Sticky ----
  it('applies sticky class', () => {
    const wrapper = mount(BTable, { props: { columns, rows, sticky: true } })
    expect(wrapper.find('.ds-table--sticky').exists()).toBe(true)
  })

  // ---- Custom empty text ----
  it('uses custom empty text', () => {
    const wrapper = mount(BTable, { props: { columns, rows: [], emptyText: 'No records found.' } })
    expect(wrapper.find('.ds-table-empty').text()).toContain('No records found.')
  })

  // ---- Server-side mode ----
  it('does not filter rows in server-side mode', () => {
    const wrapper = mount(BTable, {
      props: {
        columns,
        rows: [{ id: 1, name: 'Alice', role: 'Engineer', salary: 90000, status: 'Active' }],
        serverSide: true,
        searchQuery: 'Bob',
      },
    })
    // Server-side: rows are passed as-is, no client filtering
    expect(wrapper.findAll('tbody tr').length).toBe(1)
  })

  it('does not sort rows in server-side mode', async () => {
    const wrapper = mount(BTable, {
      props: { columns, rows, serverSide: true },
    })
    const nameHeader = wrapper.findAll('th')[0]
    await nameHeader.trigger('click')
    // Rows should remain in original order
    const firstCell = wrapper.find('tbody tr td')
    expect(firstCell.text()).toContain('Alice')
  })
})
