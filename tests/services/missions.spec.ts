import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}))

import { get, post, put, del } from '@/services/api'
import * as missions from '@/services/missions'

const mockGet = vi.mocked(get)
const mockPost = vi.mocked(post)
const mockPut = vi.mocked(put)
const mockDel = vi.mocked(del)

describe('Missions Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMissions()', () => {
    it('calls GET /api/missions with query params', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: [] } as any)

      const result = await missions.getMissions({ status: 'active', page: 1 })

      expect(mockGet).toHaveBeenCalledWith('/missions', { params: { status: 'active', page: 1 } })
      expect(result).toEqual({ success: true, data: [] })
    })

    it('calls GET /api/missions without params', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: [] } as any)

      await missions.getMissions()

      expect(mockGet).toHaveBeenCalledWith('/missions', undefined)
    })
  })

  describe('createMission()', () => {
    it('calls POST /api/missions with data', async () => {
      const data = { title: 'Test Mission', description: 'Desc', pricingType: 'fixed', agreedAmount: 100 }
      mockPost.mockResolvedValueOnce({ success: true, data: { id: 1 } } as any)

      const result = await missions.createMission(data as any)

      expect(mockPost).toHaveBeenCalledWith('/missions', data)
      expect(result).toEqual({ success: true, data: { id: 1 } })
    })
  })

  describe('getMission()', () => {
    it('calls GET /api/missions/:id', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: { id: 1 } } as any)

      const result = await missions.getMission('1')

      expect(mockGet).toHaveBeenCalledWith('/missions/1')
      expect(result).toEqual({ success: true, data: { id: 1 } })
    })
  })

  describe('updateMission()', () => {
    it('calls PUT /api/missions/:id with data', async () => {
      mockPut.mockResolvedValueOnce({ success: true } as any)

      const result = await missions.updateMission('1', { title: 'Updated' })

      expect(mockPut).toHaveBeenCalledWith('/missions/1', { title: 'Updated' })
      expect(result).toEqual({ success: true })
    })
  })

  describe('deleteMission()', () => {
    it('calls DELETE /api/missions/:id', async () => {
      mockDel.mockResolvedValueOnce({ success: true } as any)

      const result = await missions.deleteMission('1')

      expect(mockDel).toHaveBeenCalledWith('/missions/1')
      expect(result).toEqual({ success: true })
    })
  })

  describe('agreeMission()', () => {
    it('calls POST /api/missions/:id/agree', async () => {
      mockPost.mockResolvedValueOnce({ success: true } as any)

      const result = await missions.agreeMission('1')

      expect(mockPost).toHaveBeenCalledWith('/missions/1/agree')
      expect(result).toEqual({ success: true })
    })
  })

  describe('updateMissionStatus()', () => {
    it('calls PUT /api/missions/:id/status with status', async () => {
      mockPut.mockResolvedValueOnce({ success: true } as any)

      const result = await missions.updateMissionStatus('1', 'in_progress')

      expect(mockPut).toHaveBeenCalledWith('/missions/1/status', { status: 'in_progress' })
      expect(result).toEqual({ success: true })
    })
  })

  describe('uploadAttachment()', () => {
    it('calls POST /api/missions/:id/attachments with FormData', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const formData = new FormData()
      formData.append('file', file)
      mockPost.mockResolvedValueOnce({ success: true, data: { id: 1 } } as any)

      const result = await missions.uploadAttachment('1', file)

      expect(mockPost).toHaveBeenCalledWith('/missions/1/attachments', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      expect(result).toEqual({ success: true, data: { id: 1 } })
    })
  })

  describe('getAttachments()', () => {
    it('calls GET /api/missions/:id/attachments', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: [] } as any)

      const result = await missions.getAttachments('1')

      expect(mockGet).toHaveBeenCalledWith('/missions/1/attachments')
      expect(result).toEqual({ success: true, data: [] })
    })
  })
})
