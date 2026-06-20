import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}))

import { get, post } from '@/services/api'
import {
  login,
  register,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
} from '@/services/auth'

const mockGet = vi.mocked(get)
const mockPost = vi.mocked(post)

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login()', () => {
    it('calls POST /api/auth/login with credentials', async () => {
      const response = { success: true, data: { user: { id: 1 }, accessToken: 'at', refreshToken: 'rt' } }
      mockPost.mockResolvedValueOnce(response as any)

      const result = await login({ email: 'test@example.com', password: 'password123' })

      expect(mockPost).toHaveBeenCalledWith('/auth/login', { email: 'test@example.com', password: 'password123' })
      expect(result).toEqual(response)
    })
  })

  describe('register()', () => {
    it('calls POST /api/auth/register with form data', async () => {
      const response = { success: true, data: { id: 1, email: 'test@example.com' } }
      mockPost.mockResolvedValueOnce(response as any)

      const result = await register({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'agent',
      })

      expect(mockPost).toHaveBeenCalledWith('/auth/register', {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'agent',
      })
      expect(result).toEqual(response)
    })
  })

  describe('logout()', () => {
    it('calls POST /api/auth/logout with refresh token', async () => {
      mockPost.mockResolvedValueOnce({ success: true, data: { loggedOut: true } } as any)

      const result = await logout('refresh-token-123')

      expect(mockPost).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'refresh-token-123' })
      expect(result).toEqual({ success: true, data: { loggedOut: true } })
    })
  })

  describe('refreshToken()', () => {
    it('calls POST /api/auth/refresh with refresh token', async () => {
      const response = { success: true, data: { accessToken: 'new-at', refreshToken: 'new-rt' } }
      mockPost.mockResolvedValueOnce(response as any)

      const result = await refreshToken('old-refresh-token')

      expect(mockPost).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'old-refresh-token' })
      expect(result).toEqual(response)
    })
  })

  describe('forgotPassword()', () => {
    it('calls POST /api/auth/forgot-password with email', async () => {
      mockPost.mockResolvedValueOnce({ success: true, message: 'sent' } as any)

      const result = await forgotPassword('test@example.com')

      expect(mockPost).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@example.com' })
      expect(result).toEqual({ success: true, message: 'sent' })
    })
  })

  describe('resetPassword()', () => {
    it('calls POST /api/auth/reset-password with token and password', async () => {
      mockPost.mockResolvedValueOnce({ success: true } as any)

      const result = await resetPassword({ token: 'reset-token', password: 'newpass123' })

      expect(mockPost).toHaveBeenCalledWith('/auth/reset-password', { token: 'reset-token', password: 'newpass123' })
      expect(result).toEqual({ success: true })
    })
  })

  describe('verifyEmail()', () => {
    it('calls GET /api/auth/verify-email/:token', async () => {
      mockGet.mockResolvedValueOnce({ success: true } as any)

      const result = await verifyEmail('verification-token')

      expect(mockGet).toHaveBeenCalledWith('/auth/verify-email/verification-token')
      expect(result).toEqual({ success: true })
    })
  })

  describe('resendVerification()', () => {
    it('calls POST /api/auth/resend-verification with email', async () => {
      mockPost.mockResolvedValueOnce({ success: true } as any)

      const result = await resendVerification('test@example.com')

      expect(mockPost).toHaveBeenCalledWith('/auth/resend-verification', { email: 'test@example.com' })
      expect(result).toEqual({ success: true })
    })
  })
})
