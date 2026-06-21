import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}))

import { get, put, post } from '@/services/api'
import {
  getMe,
  updateMe,
  changePassword,
  uploadAvatar,
  getAgentProfile,
  updateAgentProfile,
  getClientProfile,
  updateClientProfile,
} from '@/services/users'

const mockGet = vi.mocked(get)
const mockPut = vi.mocked(put)
const mockPost = vi.mocked(post)

describe('Users Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMe()', () => {
    it('calls GET /api/users/me', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: { id: 1 } } as any)

      const result = await getMe()

      expect(mockGet).toHaveBeenCalledWith('/users/me')
      expect(result).toEqual({ success: true, data: { id: 1 } })
    })
  })

  describe('updateMe()', () => {
    it('calls PUT /api/users/me with data', async () => {
      mockPut.mockResolvedValueOnce({ success: true } as any)

      const result = await updateMe({ firstName: 'John' })

      expect(mockPut).toHaveBeenCalledWith('/users/me', { firstName: 'John' })
      expect(result).toEqual({ success: true })
    })
  })

  describe('changePassword()', () => {
    it('calls PUT /api/users/me/password', async () => {
      mockPut.mockResolvedValueOnce({ success: true } as any)

      const result = await changePassword({
        currentPassword: 'old',
        newPassword: 'new123',
      })

      expect(mockPut).toHaveBeenCalledWith('/users/me/password', {
        currentPassword: 'old',
        newPassword: 'new123',
      })
      expect(result).toEqual({ success: true })
    })
  })

  describe('uploadAvatar()', () => {
    it('calls POST /api/users/me/avatar with FormData', async () => {
      const file = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' })
      mockPost.mockResolvedValueOnce({ success: true, data: { url: '/avatars/test.jpg' } } as any)

      const result = await uploadAvatar(file)

      expect(mockPost).toHaveBeenCalledWith('/users/me/avatar', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      expect(result).toEqual({ success: true, data: { url: '/avatars/test.jpg' } })
    })
  })

  describe('getAgentProfile()', () => {
    it('calls GET /api/users/agents/:slug', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: { id: 1 } } as any)

      const result = await getAgentProfile('john-doe')

      expect(mockGet).toHaveBeenCalledWith('/users/agents/john-doe')
      expect(result).toEqual({ success: true, data: { id: 1 } })
    })
  })

  describe('updateAgentProfile()', () => {
    it('calls PUT /api/users/agents/me with data', async () => {
      mockPut.mockResolvedValueOnce({ success: true } as any)

      const result = await updateAgentProfile({ bio: 'Professional agent' })

      expect(mockPut).toHaveBeenCalledWith('/users/agents/me', { bio: 'Professional agent' })
      expect(result).toEqual({ success: true })
    })
  })

  describe('getClientProfile()', () => {
    it('calls GET /api/clients/me', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: { id: 1 } } as any)

      const result = await getClientProfile()

      expect(mockGet).toHaveBeenCalledWith('/clients/me')
      expect(result).toEqual({ success: true, data: { id: 1 } })
    })
  })

  describe('updateClientProfile()', () => {
    it('calls PUT /api/clients/me with data', async () => {
      mockPut.mockResolvedValueOnce({ success: true } as any)

      const result = await updateClientProfile({ companyName: 'Acme Corp' })

      expect(mockPut).toHaveBeenCalledWith('/clients/me', { companyName: 'Acme Corp' })
      expect(result).toEqual({ success: true })
    })
  })
})
