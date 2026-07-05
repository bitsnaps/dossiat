import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AdminUsersView from '@/views/admin/AdminUsersView.vue'

const fetchUsers = vi.fn()
const createUser = vi.fn()
const updateUser = vi.fn()
const resetUserPassword = vi.fn()
const deactivateUser = vi.fn()
const activateUser = vi.fn()
const deleteUser = vi.fn()

vi.mock('@/stores/admin', () => ({
  useAdminStore: vi.fn(() => ({
    users: [
      { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@test.com', role: 'agent', emailVerified: true },
      { id: 2, firstName: 'Jane', lastName: 'Roe', email: 'jane@test.com', role: 'client', emailVerified: false },
    ],
    loading: {},
    error: null,
    pagination: { users: { total: 2, page: 1, limit: 20, totalPages: 1 } },
    fetchUsers,
    createUser,
    updateUser,
    resetUserPassword,
    deactivateUser,
    activateUser,
    deleteUser,
  })),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'admin.users.title': 'User Management',
        'admin.users.createUser': 'Create User',
        'admin.users.search': 'Search...',
        'admin.users.allRoles': 'All Roles',
        'admin.users.name': 'Name',
        'admin.users.email': 'Email',
        'admin.users.role': 'Role',
        'admin.users.verified': 'Verified',
        'admin.users.actions': 'Actions',
        'admin.users.view': 'View',
        'admin.users.edit': 'Edit',
        'admin.users.resetPassword': 'Reset Password',
        'admin.users.deactivate': 'Deactivate',
        'admin.users.activate': 'Activate',
        'admin.users.delete': 'Delete',
        'admin.users.editUser': 'Edit User',
        'admin.users.resetPasswordTitle': 'Reset Password',
        'admin.users.firstName': 'First Name',
        'admin.users.lastName': 'Last Name',
        'admin.users.password': 'Password',
        'admin.users.newPassword': 'New Password',
        'admin.users.confirmPassword': 'Confirm Password',
        'admin.users.save': 'Save',
        'admin.users.cancel': 'Cancel',
        'admin.users.updating': 'Updating...',
        'admin.users.resetting': 'Resetting...',
        'admin.users.passwordPlaceholder': 'Min. 8 characters',
        'admin.users.firstNamePlaceholder': 'First name',
        'admin.users.lastNamePlaceholder': 'Last name',
        'admin.users.resetPasswordHint': 'Set a new password.',
        'admin.users.passwordMinLength': 'Password must be at least 8 characters.',
        'admin.users.passwordMismatch': 'Passwords do not match.',
        'admin.users.emailInvalid': 'Invalid email format.',
        'admin.users.updateError': 'Failed to update user.',
        'admin.users.passwordReset': 'Password reset successfully.',
        'admin.users.passwordResetError': 'Failed to reset password.',
        'admin.users.updated': 'User updated successfully.',
      }
      return map[key] ?? key
    },
  }),
}))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/app/admin/users', name: 'admin-users', component: { template: '<div />' } },
    { path: '/app/admin/users/:id', name: 'admin-user-detail', component: { template: '<div />' } },
  ],
})

function mountView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(AdminUsersView, {
    global: { plugins: [pinia, router] },
  })
}

describe('AdminUsersView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the container', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-admin-page').exists()).toBe(true)
  })

  it('calls fetchUsers on mount', () => {
    mountView()
    expect(fetchUsers).toHaveBeenCalled()
  })

  it('renders the BTable component', () => {
    const wrapper = mountView()
    expect(wrapper.findComponent({ name: 'BTable' }).exists()).toBe(true)
  })

  it('renders the create user button', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Create User')
  })

  it('opens the edit modal when edit button clicked', async () => {
    const wrapper = mountView()
    // Find the edit button (text "Edit")
    const editBtn = wrapper.findAll('button').find((b) => b.text().includes('Edit'))
    expect(editBtn).toBeDefined()
    await editBtn!.trigger('click')
    await wrapper.vm.$nextTick()
    // Edit modal should now be visible
    const modals = wrapper.findAllComponents({ name: 'BModal' })
    expect(modals.length).toBeGreaterThanOrEqual(1)
  })

  it('opens the reset password modal when reset button clicked', async () => {
    const wrapper = mountView()
    const resetBtn = wrapper.findAll('button').find((b) => b.text().includes('Reset Password'))
    expect(resetBtn).toBeDefined()
    await resetBtn!.trigger('click')
    await wrapper.vm.$nextTick()
    const modals = wrapper.findAllComponents({ name: 'BModal' })
    expect(modals.length).toBeGreaterThanOrEqual(1)
  })
})
