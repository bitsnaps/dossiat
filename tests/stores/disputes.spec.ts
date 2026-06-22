import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/disputes', () => ({
  getDisputes: vi.fn(),
  getDispute: vi.fn(),
  sendMessage: vi.fn(),
  resolveDispute: vi.fn(),
  escalateDispute: vi.fn(),
  createDispute: vi.fn(),
}))

import * as disputesService from '@/services/disputes'
import { useDisputesStore } from '@/stores/disputes'

const mockGetDisputes = vi.mocked(disputesService.getDisputes)
const mockGetDispute = vi.mocked(disputesService.getDispute)
const mockSendMessage = vi.mocked(disputesService.sendMessage)
const mockResolveDispute = vi.mocked(disputesService.resolveDispute)
const mockEscalateDispute = vi.mocked(disputesService.escalateDispute)
const mockCreateDispute = vi.mocked(disputesService.createDispute)

describe('Disputes Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('has empty disputes list and no current dispute', () => {
      const store = useDisputesStore()
      expect(store.disputes).toEqual([])
      expect(store.currentDispute).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('fetchDisputes()', () => {
    it('loads disputes from API', async () => {
      const disputes = [{ id: 1, missionId: 5, reason: 'Not delivered', status: 'open' }]
      mockGetDisputes.mockResolvedValueOnce({ success: true, data: disputes } as any)

      const store = useDisputesStore()
      await store.fetchDisputes()

      expect(store.disputes).toEqual(disputes)
    })

    it('sets error on failure', async () => {
      mockGetDisputes.mockRejectedValueOnce(new Error('Failed'))

      const store = useDisputesStore()
      await store.fetchDisputes()

      expect(store.error).toBe('Failed')
    })
  })

  describe('fetchDispute()', () => {
    it('loads a single dispute with messages', async () => {
      const dispute = {
        id: 1,
        missionId: 5,
        reason: 'Not delivered',
        status: 'open',
        messages: [{ id: 1, disputeId: 1, senderId: 1, content: 'Hello' }],
      }
      mockGetDispute.mockResolvedValueOnce({ success: true, data: dispute } as any)

      const store = useDisputesStore()
      await store.fetchDispute('1')

      expect(store.currentDispute).toEqual(dispute)
    })

    it('sets error on failure', async () => {
      mockGetDispute.mockRejectedValueOnce(new Error('Not found'))

      const store = useDisputesStore()
      await store.fetchDispute('999')

      expect(store.error).toBe('Not found')
    })
  })

  describe('sendMessage()', () => {
    it('appends new message to dispute messages', async () => {
      const newMessage = { id: 2, disputeId: 1, senderId: 1, content: 'I disagree' }
      mockSendMessage.mockResolvedValueOnce({ success: true, data: newMessage } as any)

      const store = useDisputesStore()
      store.currentDispute = {
        id: 1,
        missionId: 5,
        reason: 'Not delivered',
        status: 'open',
        messages: [{ id: 1, disputeId: 1, senderId: 2, content: 'Hello' }],
      }

      const result = await store.sendMessage('1', 'I disagree')

      expect(store.currentDispute!.messages).toContainEqual(newMessage)
      expect(result).toEqual(newMessage)
    })

    it('sets error on failure', async () => {
      mockSendMessage.mockRejectedValueOnce(new Error('Send failed'))

      const store = useDisputesStore()
      store.currentDispute = {
        id: 1,
        missionId: 5,
        reason: 'Not delivered',
        status: 'open',
        messages: [],
      }

      await expect(store.sendMessage('1', 'Hello')).rejects.toThrow()

      expect(store.error).toBe('Send failed')
    })
  })

  describe('resolveDispute()', () => {
    it('updates dispute status to resolved', async () => {
      mockResolveDispute.mockResolvedValueOnce({ success: true, data: { status: 'resolved' } } as any)

      const store = useDisputesStore()
      store.currentDispute = {
        id: 1,
        missionId: 5,
        reason: 'Not delivered',
        status: 'open',
        resolution: null,
        messages: [],
      }

      await store.resolveDispute('1', 'Resolved by agreement')

      expect(store.currentDispute!.status).toBe('resolved')
      expect(store.currentDispute!.resolution).toBe('Resolved by agreement')
    })

    it('sets error on failure', async () => {
      mockResolveDispute.mockRejectedValueOnce(new Error('Resolve failed'))

      const store = useDisputesStore()
      store.currentDispute = {
        id: 1,
        missionId: 5,
        reason: 'Not delivered',
        status: 'open',
        resolution: null,
        messages: [],
      }

      await expect(store.resolveDispute('1', 'Done')).rejects.toThrow()

      expect(store.error).toBe('Resolve failed')
    })
  })

  describe('escalateDispute()', () => {
    it('updates dispute status to escalated', async () => {
      mockEscalateDispute.mockResolvedValueOnce({ success: true, data: { status: 'escalated' } } as any)

      const store = useDisputesStore()
      store.currentDispute = {
        id: 1,
        missionId: 5,
        reason: 'Not delivered',
        status: 'open',
        messages: [],
      }

      await store.escalateDispute('1')

      expect(store.currentDispute!.status).toBe('escalated')
    })

    it('sets error on failure', async () => {
      mockEscalateDispute.mockRejectedValueOnce(new Error('Escalate failed'))

      const store = useDisputesStore()
      store.currentDispute = {
        id: 1,
        missionId: 5,
        reason: 'Not delivered',
        status: 'open',
        messages: [],
      }

      await expect(store.escalateDispute('1')).rejects.toThrow()

      expect(store.error).toBe('Escalate failed')
    })
  })

  describe('createDispute()', () => {
    it('creates dispute and returns new dispute', async () => {
      const newDispute = { id: 1, missionId: 5, reason: 'Not delivered', status: 'open' }
      mockCreateDispute.mockResolvedValueOnce({ success: true, data: newDispute } as any)

      const store = useDisputesStore()
      const result = await store.createDispute('5', 'Not delivered')

      expect(mockCreateDispute).toHaveBeenCalledWith('5', 'Not delivered')
      expect(result).toEqual(newDispute)
    })

    it('sets error on failure', async () => {
      mockCreateDispute.mockRejectedValueOnce(new Error('Create failed'))

      const store = useDisputesStore()
      await expect(store.createDispute('5', 'Issue')).rejects.toThrow()

      expect(store.error).toBe('Create failed')
    })
  })
})
