import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import MissionCreateView from '@/views/missions/MissionCreateView.vue'

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockCreateMission = vi.fn()
const mockGetNetworkUsers = vi.fn()
const mockGetUserById = vi.fn()

let mockRole: 'agent' | 'client' = 'agent'

vi.mock('@/stores/missions', () => ({
  useMissionsStore: () => ({
    createMission: mockCreateMission,
  }),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    hasRole: (role: string) => mockRole === role,
    user: { id: 1, role: mockRole },
    isAuthenticated: true,
  }),
}))

vi.mock('@/services/users', () => ({
  getNetworkUsers: (...args: unknown[]) => mockGetNetworkUsers(...args),
  getUserById: (...args: unknown[]) => mockGetUserById(...args),
}))

vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
}))

function setAuthRole(role: 'agent' | 'client') {
  mockRole = role
}

// ─── Wrapper factory ─────────────────────────────────────────────────────────

async function createWrapper(query: Record<string, string> = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const queryString = Object.entries(query)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
  const path = queryString ? `/app/missions/create?${queryString}` : '/app/missions/create'

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/app/missions/create', name: 'mission-create', component: MissionCreateView },
      { path: '/app/missions/:id', name: 'mission-detail', component: { template: '<div />' } },
      { path: '/app/discover', name: 'discover-agents', component: { template: '<div />' } },
    ],
  })

  await router.push(path)
  await router.isReady()

  const wrapper = mount(MissionCreateView, {
    global: {
      plugins: [pinia, router],
      stubs: {
        BCard: { template: '<div class="ds-card"><slot /></div>' },
        BButton: {
          template: '<button class="ds-btn" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
          props: ['variant', 'size', 'icon', 'loading', 'disabled', 'to', 'type'],
        },
        BInput: { template: '<div class="ds-input"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>', props: ['modelValue', 'label', 'placeholder', 'error', 'type'] },
        BSelect: { template: '<div class="ds-select"><select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option></select></div>', props: ['modelValue', 'options', 'label'] },
        BRadioGroup: { template: '<div class="ds-radio"><div v-for="o in options" :key="o.value"><input type="radio" :value="o.value" :checked="modelValue === o.value" @change="$emit(\'update:modelValue\', o.value)" /><label>{{ o.label }}</label></div></div>', props: ['modelValue', 'options', 'label'] },
        UserSelect: { template: '<div class="ds-user-select"><select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option value="">Select</option><option v-for="u in users" :key="u.id" :value="String(u.id)">{{ u.firstName }} {{ u.lastName }}</option></select></div>', props: ['modelValue', 'role', 'label', 'placeholder', 'error'], data() { return { users: [] } } },
      },
    },
  })

  return { router, wrapper }
}

describe('MissionCreateView', () => {
  beforeEach(() => {
    localStorage.clear()
    mockRole = 'agent'
    mockCreateMission.mockReset()
    mockGetNetworkUsers.mockReset()
    mockGetUserById.mockReset()
    mockCreateMission.mockResolvedValue({ id: 42 })
    mockGetNetworkUsers.mockResolvedValue({ success: true, data: [] })
    mockGetUserById.mockResolvedValue({ success: true, data: { id: 5, firstName: 'Diana', lastName: 'Prince', role: 'agent' } })
  })

  // ─── Agent role ────────────────────────────────────────────────────────────

  describe('Agent role', () => {
    it('renders the client UserSelect (network-based)', async () => {
      setAuthRole('agent')
      mockGetNetworkUsers.mockResolvedValue({
        success: true,
        data: [{ id: 10, firstName: 'John', lastName: 'Doe', email: 'john@test.com' }],
      })
      const { wrapper } = await createWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper.findComponent({ name: 'UserSelect' }).exists() || wrapper.find('.ds-user-select').exists()).toBe(true)
    })

    it('does not render the assignment-mode radio for agents', async () => {
      setAuthRole('agent')
      const { wrapper } = await createWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).not.toContain('Post as open mission')
    })

    it('submits with clientId when agent creates a mission', async () => {
      setAuthRole('agent')
      const { wrapper } = await createWrapper()
      await wrapper.vm.$nextTick()

      ;(wrapper.vm as any).title = 'Agent Mission'
      ;(wrapper.vm as any).clientId = '10'
      await wrapper.vm.$nextTick()

      await (wrapper.vm as any).handleSubmit()
      await wrapper.vm.$nextTick()

      expect(mockCreateMission).toHaveBeenCalled()
      const arg = mockCreateMission.mock.calls[0][0]
      expect(arg.clientId).toBe('10')
      expect(arg.agentId).toBeUndefined()
    })
  })

  // ─── Client role with pre-assigned agent (?agentId=) ───────────────────────

  describe('Client role with pre-assigned agent', () => {
    it('fetches and displays the agent name in read-only field', async () => {
      setAuthRole('client')
      const { wrapper } = await createWrapper({ agentId: '5' })
      await wrapper.vm.$nextTick()
      await new Promise((r) => setTimeout(r, 0))
      await wrapper.vm.$nextTick()

      expect(mockGetUserById).toHaveBeenCalledWith('5')
      expect(wrapper.text()).toContain('Diana Prince')
    })

    it('does not render the agent UserSelect dropdown', async () => {
      setAuthRole('client')
      const { wrapper } = await createWrapper({ agentId: '5' })
      await wrapper.vm.$nextTick()
      await new Promise((r) => setTimeout(r, 0))
      await wrapper.vm.$nextTick()

      expect(wrapper.findComponent({ name: 'UserSelect' }).exists()).toBe(false)
    })

    it('does not render the assignment-mode radio when agentId is present', async () => {
      setAuthRole('client')
      const { wrapper } = await createWrapper({ agentId: '5' })
      await wrapper.vm.$nextTick()
      await new Promise((r) => setTimeout(r, 0))
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).not.toContain('Post as open mission')
    })

    it('submits with agentId when client pre-assigns an agent', async () => {
      setAuthRole('client')
      const { wrapper } = await createWrapper({ agentId: '5' })
      await wrapper.vm.$nextTick()
      await new Promise((r) => setTimeout(r, 0))
      await wrapper.vm.$nextTick()

      ;(wrapper.vm as any).title = 'Pre-assigned Mission'
      await (wrapper.vm as any).handleSubmit()
      await wrapper.vm.$nextTick()

      expect(mockCreateMission).toHaveBeenCalled()
      const arg = mockCreateMission.mock.calls[0][0]
      expect(arg.agentId).toBe('5')
      expect(arg.clientId).toBeUndefined()
    })
  })

  // ─── Client role without agentId (assignment mode) ─────────────────────────

  describe('Client role without agentId', () => {
    it('renders the assignment-mode radio choice', async () => {
      setAuthRole('client')
      const { wrapper } = await createWrapper()
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Post as open mission')
      expect(wrapper.text()).toContain('Browse agents to assign')
    })

    it('does not render the agent UserSelect dropdown', async () => {
      setAuthRole('client')
      const { wrapper } = await createWrapper()
      await wrapper.vm.$nextTick()

      expect(wrapper.findComponent({ name: 'UserSelect' }).exists()).toBe(false)
    })

    it('submits without agentId (open mission) when assignment mode is open', async () => {
      setAuthRole('client')
      const { wrapper } = await createWrapper()
      await wrapper.vm.$nextTick()

      ;(wrapper.vm as any).title = 'Open Mission'
      ;(wrapper.vm as any).assignmentMode = 'open'
      await (wrapper.vm as any).handleSubmit()
      await wrapper.vm.$nextTick()

      expect(mockCreateMission).toHaveBeenCalled()
      const arg = mockCreateMission.mock.calls[0][0]
      expect(arg.agentId).toBeUndefined()
      expect(arg.clientId).toBeUndefined()
    })

    it('navigates to /app/discover when assignment mode is browse', async () => {
      setAuthRole('client')
      const { wrapper, router } = await createWrapper()
      await wrapper.vm.$nextTick()

      ;(wrapper.vm as any).title = 'Browse Mission'
      ;(wrapper.vm as any).assignmentMode = 'browse'
      const pushSpy = vi.spyOn(router, 'push')
      await (wrapper.vm as any).handleSubmit()
      await wrapper.vm.$nextTick()

      expect(pushSpy).toHaveBeenCalledWith('/app/discover')
      expect(mockCreateMission).not.toHaveBeenCalled()
    })
  })
})
