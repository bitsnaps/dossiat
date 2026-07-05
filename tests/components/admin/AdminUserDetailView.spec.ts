import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AdminUserDetailView from '@/views/admin/AdminUserDetailView.vue'

const fetchUser = vi.fn()
const updateUser = vi.fn()
const resetUserPassword = vi.fn()
const deactivateUser = vi.fn()
const activateUser = vi.fn()
const deleteUser = vi.fn()

const selectedUser = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@test.com',
  role: 'agent' as const,
  emailVerified: true,
}

vi.mock('@/stores/admin', () => ({
  useAdminStore: vi.fn(() => ({
    selectedUser,
    loading: {},
    error: null,
    fetchUser,
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
        'admin.users.userDetail': 'User Detail',
        'admin.users.back': '← Back to Users',
        'admin.users.verified': 'Verified',
        'admin.users.notVerified': 'Not Verified',
        'admin.users.editProfile': 'Edit Profile',
        'admin.users.editProfileHint': 'Update info.',
        'admin.users.edit': 'Edit',
        'admin.users.editUser': 'Edit User',
        'admin.users.manageRole': 'Manage Role',
        'admin.users.currentRole': 'Current Role',
        'admin.users.changeRole': 'Change Role',
        'admin.users.accountActions': 'Account Actions',
        'admin.users.resetPassword': 'Reset Password',
        'admin.users.resetPasswordTitle': 'Reset Password',
        'admin.users.resetPasswordHint': 'Set a new password.',
        'admin.users.deactivate': 'Deactivate',
        'admin.users.activate': 'Activate',
        'admin.users.delete': 'Delete',
        'admin.users.save': 'Save',
        'admin.users.cancel': 'Cancel',
        'admin.users.updating': 'Updating...',
        'admin.users.resetting': 'Resetting...',
        'admin.users.firstName': 'First Name',
        'admin.users.lastName': 'Last Name',
        'admin.users.email': 'Email',
        'admin.users.role': 'Role',
        'admin.users.newPassword': 'New Password',
        'admin.users.confirmPassword': 'Confirm Password',
        'admin.users.passwordPlaceholder': 'Min. 8 characters',
        'admin.users.firstNamePlaceholder': 'First name',
        'admin.users.lastNamePlaceholder': 'Last name',
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
  return mount(AdminUserDetailView, {
    global: { plugins: [pinia, router] },
  })
}

describe('AdminUserDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the container', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-admin-page').exists()).toBe(true)
  })

  it('calls fetchUser on mount', () => {
    mountView()
    expect(fetchUser).toHaveBeenCalled()
  })

  it('renders the back link', () => {
    const wrapper = mountView()
    expect(wrapper.find('a[href="/app/admin/users"]').exists()).toBe(true)
  })

  it('renders the edit profile section', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Edit Profile')
  })

  it('renders the reset password button in account actions', () => {
    const wrapper = mountView()
    const resetBtn = wrapper.findAll('button').find((b) => b.text().includes('Reset Password'))
    expect(resetBtn).toBeDefined()
  })

  it('opens the edit modal when edit button clicked', async () => {
    const wrapper = mountView()
    const editBtn = wrapper.findAll('button').find((b) => b.text().includes('Edit'))
    expect(editBtn).toBeDefined()
    await editBtn!.trigger('click')
    await wrapper.vm.$nextTick()
    const modals = wrapper.findAllComponents({ name: 'BModal' })
    expect(modals.length).toBeGreaterThanOrEqual(1)
  })

  it('opens the reset password modal when reset button clicked', async () => {
    const wrapper = mountView()
    const resetBtn = wrapper.findAll('button').find((b) => b.text().includes('Reset Password'))
    await resetBtn!.trigger('click')
    await wrapper.vm.$nextTick()
    const modals = wrapper.findAllComponents({ name: 'BModal' })
    expect(modals.length).toBeGreaterThanOrEqual(1)
  })
})
