import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import InviteLinkShare from '@/components/agent/InviteLinkShare.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
  ],
})

vi.mock('@/stores/agentProfile', () => ({
  useAgentProfileStore: vi.fn(() => ({
    loading: false,
    error: null,
    regenerateInviteLink: vi.fn().mockResolvedValue({ slug: 'new-slug-123' }),
  })),
}))

vi.mock('@/composables/useCopyToClipboard', () => ({
  useCopyToClipboard: vi.fn(() => ({
    copied: ref(false),
    copy: vi.fn().mockResolvedValue(true),
  })),
}))

vi.mock('@/composables/useToast', () => ({
  useToast: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
  })),
}))

function mountInviteLinkShare(slug = 'test-slug-abc') {
  const pinia = createPinia()
  setActivePinia(pinia)

  return mount(InviteLinkShare, {
    props: { slug },
    global: {
      plugins: [pinia, router],
    },
  })
}

describe('InviteLinkShare', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the invite link share container', () => {
    const wrapper = mountInviteLinkShare()
    expect(wrapper.find('.ds-invite-link-share').exists()).toBe(true)
  })

  it('displays the full invite link URL', () => {
    const wrapper = mountInviteLinkShare('my-slug-xyz')
    const input = wrapper.find('.ds-invite-link-share__input')
    expect(input.exists()).toBe(true)
    const value = (input.element as HTMLInputElement).value
    expect(value).toContain('my-slug-xyz')
    expect(value).toContain('/agents/my-slug-xyz')
  })

  it('renders the copy link button', () => {
    const wrapper = mountInviteLinkShare()
    const btn = wrapper.findAll('button').find((b) => b.classes().includes('ds-btn--accent'))
    expect(btn).toBeDefined()
  })

  it('renders the WhatsApp share button', () => {
    const wrapper = mountInviteLinkShare()
    expect(wrapper.html()).toContain('Share via WhatsApp')
  })

  it('renders the email share button', () => {
    const wrapper = mountInviteLinkShare()
    expect(wrapper.html()).toContain('Share via Email')
  })

  it('renders the regenerate button', () => {
    const wrapper = mountInviteLinkShare()
    expect(wrapper.html()).toContain('Regenerate')
  })

  it('shows confirmation dialog when regenerate is clicked', async () => {
    const wrapper = mountInviteLinkShare()
    const buttons = wrapper.findAll('button')
    const regenerateBtn = buttons.find((b) => b.text().includes('Regenerate Link'))
    if (regenerateBtn) {
      await regenerateBtn.trigger('click')
      expect(wrapper.find('.ds-invite-link-share__confirm').exists()).toBe(true)
    }
  })

  it('renders the input as readonly', () => {
    const wrapper = mountInviteLinkShare()
    const input = wrapper.find('.ds-invite-link-share__input')
    expect((input.element as HTMLInputElement).readOnly).toBe(true)
  })
})
