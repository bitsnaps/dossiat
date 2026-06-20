import { Hono } from 'hono'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { User, AgentProfile, ClientProfile } from '@/server/database/models'
import { successResponse } from '@/server/utils/apiResponse'
import { authenticate } from '@/server/middleware/auth'
import { roleGuard } from '@/server/middleware/roleGuard'
import { validateRequest, validators } from '@/server/middleware/validateRequest'
import { AppError } from '@/server/middleware/errorHandler'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = parseInt(process.env.MAX_AVATAR_SIZE || String(5 * 1024 * 1024)) // 5MB default
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads/avatars'

const users = new Hono()

// GET /api/users/me
users.get('/me', authenticate(), async (c) => {
  const auth = c.get('auth')
  const user = await User.findByPk(auth.userId, {
    attributes: { exclude: ['passwordHash'] },
    include: [
      { model: AgentProfile, as: 'agentProfile' },
      { model: ClientProfile, as: 'clientProfile' },
    ],
  })

  if (!user) throw new AppError('User not found', 404)

  return successResponse(c, user)
})

// PUT /api/users/me
users.put('/me',
  authenticate(),
  validateRequest({
    body: {
      firstName: validators.required(),
      lastName: validators.required(),
    },
  }),
  async (c) => {
    const auth = c.get('auth')
    const { firstName, lastName } = await c.req.json()

    await User.update({ firstName, lastName }, { where: { id: auth.userId } })

    const user = await User.findByPk(auth.userId, {
      attributes: { exclude: ['passwordHash'] },
    })

    return successResponse(c, user, 'Profile updated')
  }
)

// PUT /api/users/me/password
users.put('/me/password',
  authenticate(),
  validateRequest({
    body: {
      currentPassword: validators.required(),
      newPassword: validators.required(),
    },
  }),
  async (c) => {
    const auth = c.get('auth')
    const { currentPassword, newPassword } = await c.req.json()

    if (newPassword.length < 8) {
      throw new AppError('New password must be at least 8 characters', 422)
    }

    const user = await User.findByPk(auth.userId)
    if (!user) throw new AppError('User not found', 404)

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) {
      throw new AppError('Current password is incorrect', 401)
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await user.update({ passwordHash })

    return successResponse(c, { message: 'Password updated successfully' })
  }
)

// GET /api/users/agents/:slug — public agent profile
users.get('/agents/:slug', async (c) => {
  const slug = c.req.param('slug')

  const profile = await AgentProfile.findOne({
    where: { uniqueInviteSlug: slug },
    include: [{ model: User, as: 'user', attributes: { exclude: ['passwordHash'] } }],
  }) as any

  if (!profile) throw new AppError('Agent not found', 404)

  const auth = c.get('auth')
  const isOwnProfile = auth?.userId === profile.userId

  const data: any = {
    id: profile.id,
    bio: profile.bio,
    specialties: profile.specialties,
    acceptedClientTypes: profile.acceptedClientTypes,
    currency: profile.currency,
    timezone: profile.timezone,
    profilePhotoUrl: profile.profilePhotoUrl,
    user: profile.user,
  }

  if (!auth || !isOwnProfile) {
    delete data.currency
  }

  return successResponse(c, data)
})

// PUT /api/users/agents/me — update agent profile
users.put('/agents/me',
  authenticate(),
  roleGuard('agent'),
  validateRequest({
    body: {
      bio: validators.required(),
      specialties: validators.required(),
      acceptedClientTypes: validators.isIn(['B2B', 'B2C', 'Both']),
      currency: validators.required(),
      timezone: validators.required(),
    },
  }),
  async (c) => {
    const auth = c.get('auth')
    const { bio, specialties, acceptedClientTypes, currency, timezone } = await c.req.json()

    const profile = await AgentProfile.findOne({ where: { userId: auth.userId } })
    if (!profile) throw new AppError('Agent profile not found', 404)

    await profile.update({ bio, specialties, acceptedClientTypes, currency, timezone })

    return successResponse(c, profile, 'Agent profile updated')
  }
)

// POST /api/users/agents/me/invite-link — generate/regenerate invite link
users.post('/agents/me/invite-link',
  authenticate(),
  roleGuard('agent'),
  async (c) => {
    const auth = c.get('auth')
    const profile = await AgentProfile.findOne({ where: { userId: auth.userId } })
    if (!profile) throw new AppError('Agent profile not found', 404)

    const slug = crypto.randomBytes(6).toString('hex')
    await profile.update({ uniqueInviteSlug: slug })

    return successResponse(c, {
      inviteLink: `/agents/${slug}`,
      slug,
    }, 'Invite link regenerated')
  }
)

// GET /api/users/clients/me
users.get('/clients/me',
  authenticate(),
  roleGuard('client'),
  async (c) => {
    const auth = c.get('auth')
    const profile = await ClientProfile.findOne({
      where: { userId: auth.userId },
      include: [{ model: User, as: 'user', attributes: { exclude: ['passwordHash'] } }],
    })

    if (!profile) throw new AppError('Client profile not found', 404)

    return successResponse(c, profile)
  }
)

// PUT /api/users/clients/me
users.put('/clients/me',
  authenticate(),
  roleGuard('client'),
  validateRequest({
    body: {
      companyName: validators.required(),
      companySize: validators.required(),
      industry: validators.required(),
    },
  }),
  async (c) => {
    const auth = c.get('auth')
    const { companyName, companySize, industry } = await c.req.json()

    const profile = await ClientProfile.findOne({ where: { userId: auth.userId } })
    if (!profile) throw new AppError('Client profile not found', 404)

    await profile.update({ companyName, companySize, industry })

    return successResponse(c, profile, 'Client profile updated')
  }
)

// POST /api/users/me/avatar — Upload profile photo
users.post('/me/avatar', authenticate(), async (c) => {
  const auth = c.get('auth')

  // Get the profile based on role
  let profile: any = null
  if (auth.role === 'agent') {
    profile = await AgentProfile.findOne({ where: { userId: auth.userId } })
  } else if (auth.role === 'client') {
    profile = await ClientProfile.findOne({ where: { userId: auth.userId } })
  }

  if (!profile) throw new AppError('Profile not found', 404)

  let formData: FormData
  try {
    formData = await c.req.formData()
  } catch {
    throw new AppError('No file provided', 400)
  }

  const file = formData.get('avatar') as File | null

  if (!file || !(file instanceof File)) {
    throw new AppError('No file provided', 400)
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new AppError(`Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`, 400)
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new AppError(`File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`, 400)
  }

  // Ensure upload directory exists
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }

  // Delete old avatar if exists
  if (profile.profilePhotoUrl) {
    const oldPath = path.join(UPLOAD_DIR, path.basename(profile.profilePhotoUrl))
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath)
    }
  }

  // Generate unique filename
  const ext = file.type === 'image/jpeg' ? '.jpg' : file.type === 'image/png' ? '.png' : '.webp'
  const filename = `${auth.userId}-${Date.now()}${ext}`
  const filepath = path.join(UPLOAD_DIR, filename)

  // Write file to disk
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  fs.writeFileSync(filepath, buffer)

  const profilePhotoUrl = `/uploads/avatars/${filename}`

  // Update profile
  await profile.update({ profilePhotoUrl })

  return successResponse(c, { profilePhotoUrl }, 'Avatar uploaded successfully')
})

export default users
