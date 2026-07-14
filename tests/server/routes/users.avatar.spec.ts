import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '@/server/index'
import { User, AgentProfile, RefreshToken, Notification, EmailVerificationToken, PasswordResetToken } from '@/server/database/models'
import fs from 'node:fs'
import path from 'node:path'

let agentToken: string
let agentUserId: number
const uploadDir = path.resolve('./uploads/avatars')

beforeAll(async () => {
  await Notification.destroy({ where: {} })
  await EmailVerificationToken.destroy({ where: {} })
  await PasswordResetToken.destroy({ where: {} })
  await RefreshToken.destroy({ where: {} })
  await AgentProfile.destroy({ where: {} })
  // await User.destroy({ where: {} })

  const agentRes = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `agent-avatar-${Date.now()}@test.com`,
      password: 'Password123!',
      firstName: 'Agent',
      lastName: 'Avatar',
      role: 'agent',
      acceptTerms: true,
    }),
  })
  const agentBody = await agentRes.json()
  agentToken = agentBody.data.accessToken
  agentUserId = agentBody.data.id

  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
})

afterAll(async () => {
  // Clean up uploaded test files
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir)
    for (const file of files) {
      if (file.startsWith(`${agentUserId}-`)) {
        fs.unlinkSync(path.join(uploadDir, file))
      }
    }
  }
})

describe('Avatar Upload Routes', () => {
  it('POST /api/users/me/avatar - requires authentication', async () => {
    const res = await app.request('/api/users/me/avatar', {
      method: 'POST',
    })

    expect(res.status).toBe(401)
  })

  it('POST /api/users/me/avatar - returns 400 when no file provided', async () => {
    const res = await app.request('/api/users/me/avatar', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${agentToken}`,
      },
    })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
  })

  it('POST /api/users/me/avatar - uploads a valid JPEG image', async () => {
    // Create a minimal valid JPEG file (smallest valid JPEG)
    const jpegBuffer = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xD9,
    ])

    const formData = new FormData()
    const blob = new Blob([jpegBuffer], { type: 'image/jpeg' })
    formData.append('avatar', blob, 'test-avatar.jpg')

    const res = await app.request('/api/users/me/avatar', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${agentToken}`,
      },
      body: formData,
    })

    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toHaveProperty('profilePhotoUrl')
    expect(body.data.profilePhotoUrl).toBeTruthy()

    // Verify agent profile was updated
    const profile = await AgentProfile.findOne({ where: { userId: agentUserId } })
    expect(profile).toBeTruthy()
    expect(profile!.profilePhotoUrl).toBe(body.data.profilePhotoUrl)
  })

  it('POST /api/users/me/avatar - replaces old avatar on re-upload', async () => {
    // Get current photo URL
    const beforeRes = await app.request('/api/users/me', {
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const beforeBody = await beforeRes.json()
    const oldPhotoUrl = beforeBody.data.agentProfile?.profilePhotoUrl

    const jpegBuffer = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xD9,
    ])

    const formData = new FormData()
    const blob = new Blob([jpegBuffer], { type: 'image/jpeg' })
    formData.append('avatar', blob, 'test-avatar-new.jpg')

    const res = await app.request('/api/users/me/avatar', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${agentToken}`,
      },
      body: formData,
    })

    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data.profilePhotoUrl).toBeTruthy()

    // New URL should be different from old
    if (oldPhotoUrl) {
      expect(body.data.profilePhotoUrl).not.toBe(oldPhotoUrl)
    }
  })

  it('POST /api/users/me/avatar - rejects non-image files', async () => {
    const formData = new FormData()
    const blob = new Blob(['not an image'], { type: 'text/plain' })
    formData.append('avatar', blob, 'test.txt')

    const res = await app.request('/api/users/me/avatar', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${agentToken}`,
      },
      body: formData,
    })

    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
  })

  it('POST /api/users/me/avatar - returns 404 when user has no agent/client profile', async () => {
    // Register a user directly without a profile (edge case)
    const { User } = await import('@/server/database/models')
    const bcrypt = (await import('bcryptjs')).default
    const orphanUser = await User.create({
      email: `orphan-${Date.now()}@test.com`,
      passwordHash: await bcrypt.hash('Password123!', 12),
      firstName: 'Orphan',
      lastName: 'User',
      role: 'client',
    })

    // Generate token for this orphan user (no profile)
    const { generateAccessToken } = await import('@/server/utils/jwt')
    const orphanToken = await generateAccessToken({ userId: orphanUser.id, email: orphanUser.email, role: 'client' })

    const jpegBuffer = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xD9,
    ])

    const formData = new FormData()
    const blob = new Blob([jpegBuffer], { type: 'image/jpeg' })
    formData.append('avatar', blob, 'test.jpg')

    const res = await app.request('/api/users/me/avatar', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${orphanToken}`,
      },
      body: formData,
    })

    const body = await res.json()
    expect(res.status).toBe(404)
    expect(body.success).toBe(false)

    // Cleanup
    await orphanUser.destroy()
  })

  it('POST /api/users/me/avatar - rejects files exceeding size limit (5MB)', async () => {
    // Create a 6MB buffer
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024)
    // Make it start with JPEG magic bytes
    largeBuffer[0] = 0xFF
    largeBuffer[1] = 0xD8
    largeBuffer[2] = 0xFF
    largeBuffer[3] = 0xE0

    const formData = new FormData()
    const blob = new Blob([largeBuffer], { type: 'image/jpeg' })
    formData.append('avatar', blob, 'large-avatar.jpg')

    const res = await app.request('/api/users/me/avatar', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${agentToken}`,
      },
      body: formData,
    })

    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
  })
})
