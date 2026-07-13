import { Hono } from 'hono'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { User, AgentProfile, ClientProfile, Mission } from '@/server/database/models'
import { successResponse } from '@/server/utils/apiResponse'
import { authenticate } from '@/server/middleware/auth'
import { roleGuard } from '@/server/middleware/roleGuard'
import { validateRequest, validators } from '@/server/middleware/validateRequest'
import { AppError } from '@/server/middleware/errorHandler'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = parseInt(process.env.MAX_AVATAR_SIZE || String(5 * 1024 * 1024)) // 5MB default
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads/avatars'

async function ensureAgentProfile(userId: number) {
  const slug = crypto.randomBytes(6).toString('hex')
  const [profile] = await AgentProfile.findOrCreate({
    where: { userId },
    defaults: {
      userId,
      uniqueInviteSlug: slug,
      specialties: [],
      acceptedClientTypes: 'Both',
      currency: 'USD',
      timezone: 'UTC',
    },
  })
  return profile
}

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

// GET /api/users/me/export — GDPR data export (full JSON bundle of user data)
users.get('/me/export', authenticate(), async (c) => {
  const auth = c.get('auth')

  const user = await User.findByPk(auth.userId, {
    attributes: { exclude: ['passwordHash'] },
    include: [
      { model: AgentProfile, as: 'agentProfile' },
      { model: ClientProfile, as: 'clientProfile' },
    ],
  })

  if (!user) throw new AppError('User not found', 404)

  const { Mission, Payment, Dispute, DisputeMessage, Notification, Message, Conversation } = await import('@/server/database/models')

  const [agentMissions, clientMissions] = await Promise.all([
    Mission.findAll({
      where: { agentId: auth.userId },
      include: [
        { model: Payment, as: 'payments' },
        { model: Dispute, as: 'disputes', include: [{ model: DisputeMessage, as: 'messages' }] },
        { model: Conversation, as: 'conversation', include: [{ model: Message, as: 'messages' }] },
      ],
    }) as any,
    Mission.findAll({
      where: { clientId: auth.userId },
      include: [
        { model: Payment, as: 'payments' },
        { model: Dispute, as: 'disputes', include: [{ model: DisputeMessage, as: 'messages' }] },
        { model: Conversation, as: 'conversation', include: [{ model: Message, as: 'messages' }] },
      ],
    }) as any,
  ])

  const payments = await Payment.findAll({
    where: { payerId: auth.userId },
  }) as any

  const disputesInitiated = await Dispute.findAll({
    where: { initiatedBy: auth.userId },
    include: [{ model: DisputeMessage, as: 'messages' }],
  }) as any

  const notifications = await Notification.findAll({
    where: { userId: auth.userId },
  }) as any

  const userWithProfiles = user as any
  const exportData = {
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      emailVerified: user.emailVerified,
      tosAcceptedAt: user.tosAcceptedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    agentProfile: userWithProfiles.agentProfile || null,
    clientProfile: userWithProfiles.clientProfile || null,
    missions: {
      asAgent: agentMissions,
      asClient: clientMissions,
    },
    payments,
    disputesInitiated,
    notifications,
  }

  return successResponse(c, exportData, 'Data export generated')
})

// DELETE /api/users/me — GDPR account deletion (anonymizes PII, retains audit records)
users.delete('/me', authenticate(), async (c) => {
  const auth = c.get('auth')

  const { Mission, RefreshToken } = await import('@/server/database/models')

  // Block deletion if user has active missions (as agent or client)
  const activeAsAgent = await Mission.count({
    where: { agentId: auth.userId, status: ['pending_agreement', 'agreed', 'in_progress'] },
  })
  const activeAsClient = await Mission.count({
    where: { clientId: auth.userId, status: ['pending_agreement', 'agreed', 'in_progress'] },
  })

  if ((activeAsAgent as number) + (activeAsClient as number) > 0) {
    throw new AppError('Cannot delete account with active missions. Complete or cancel them first.', 409)
  }

  const user = await User.findByPk(auth.userId)
  if (!user) throw new AppError('User not found', 404)

  // Anonymize PII
  await user.update({
    firstName: 'Deleted',
    lastName: 'User',
    email: `deleted+${user.id}@dossiat.invalid`,
    passwordHash: crypto.randomBytes(32).toString('hex'),
  })

  // Revoke all refresh tokens
  await RefreshToken.destroy({ where: { userId: auth.userId } })

  return successResponse(c, { deleted: true }, 'Account anonymized successfully')
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

// GET /api/users/agents/discover — search agents (clients only; admins via X-View-As-Role: client)
// Query: ?q=<text>&clientType=B2B|B2C|Both&limit=<n>&offset=<n>
users.get('/agents/discover',
  authenticate(),
  roleGuard('client'),
  async (c) => {
    const q = (c.req.query('q') || '').trim()
    const clientType = c.req.query('clientType') as 'B2B' | 'B2C' | 'Both' | undefined
    const limit = Math.min(parseInt(c.req.query('limit') || '20', 10) || 20, 100)
    const offset = Math.max(parseInt(c.req.query('offset') || '0', 10) || 0, 0)

    const where: any = {}
    if (clientType && ['B2B', 'B2C', 'Both'].includes(clientType)) {
      where.acceptedClientTypes = clientType
    }

    const profiles = await AgentProfile.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          where: { emailVerified: true },
        },
      ],
      limit,
      offset,
      order: [[{ model: User, as: 'user' }, 'firstName', 'ASC']],
    }) as any[]

    // Filter by name (firstName/lastName) and specialties in JS to stay dialect-agnostic
    const needle = q.toLowerCase()
    const filtered = needle
      ? profiles.filter((p) => {
          const fn = (p.user?.firstName || '').toLowerCase()
          const ln = (p.user?.lastName || '').toLowerCase()
          const specialties: string[] = Array.isArray(p.specialties) ? p.specialties : []
          return (
            fn.includes(needle) ||
            ln.includes(needle) ||
            specialties.some((s) => String(s).toLowerCase().includes(needle))
          )
        })
      : profiles

    const data = filtered.map((p) => ({
      id: p.id,
      slug: p.uniqueInviteSlug,
      firstName: p.user?.firstName,
      lastName: p.user?.lastName,
      bio: p.bio,
      specialties: Array.isArray(p.specialties) ? p.specialties : [],
      acceptedClientTypes: p.acceptedClientTypes,
      profilePhotoUrl: p.profilePhotoUrl,
    }))

    return successResponse(c, data)
  }
)

// GET /api/users/agents/:slug — public agent profile (progressive visibility)
users.get('/agents/:slug', async (c) => {
  const slug = c.req.param('slug')

  const profile = await AgentProfile.findOne({
    where: { uniqueInviteSlug: slug },
    include: [{ model: User, as: 'user', attributes: { exclude: ['passwordHash'] } }],
  }) as any

  if (!profile) throw new AppError('Agent not found', 404)

  const auth = c.get('auth')
  const isOwnProfile = auth?.userId === profile.userId
  const isAuthenticated = !!auth

  // Progressive visibility: limit fields based on auth state
  const data: any = {
    id: profile.id,
    bio: profile.bio,
    specialties: profile.specialties,
    acceptedClientTypes: profile.acceptedClientTypes,
    profilePhotoUrl: profile.profilePhotoUrl,
    user: {
      id: profile.user.id,
      firstName: profile.user.firstName,
      lastName: profile.user.lastName,
    },
  }

  if (isAuthenticated) {
    // Authenticated users see timezone
    data.timezone = profile.timezone
  }

  if (isOwnProfile) {
    // Owner sees everything including currency and email
    data.currency = profile.currency
    data.user.email = profile.user.email
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

    const profile = await ensureAgentProfile(auth.userId)
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
    const profile = await ensureAgentProfile(auth.userId)

    const slug = crypto.randomBytes(6).toString('hex')
    await profile.update({ uniqueInviteSlug: slug })

    return successResponse(c, {
      inviteLink: `/agents/${slug}`,
      slug,
    }, 'Invite link regenerated')
  }
)

// GET /api/users/network — list users in the caller's private network (for dropdowns)
// Query: ?role=client|agent — which role to list.
//
// Private Network model (per PRD §2): only users with whom the caller has at
// least one existing mission are returned. Agents onboard new clients via their
// invite link; clients discover agents via /agents/discover or the invite link.
users.get('/network', authenticate(), async (c) => {
  const auth = c.get('auth')
  const requestedRole = c.req.query('role') as 'client' | 'agent' | undefined

  // Agent listing clients in their network (for mission assignment)
  if (auth.role === 'agent' && (requestedRole === 'client' || !requestedRole)) {
    // Collect distinct clientIds from missions where this agent is assigned
    const missions = await Mission.findAll({
      where: { agentId: auth.userId },
      attributes: ['clientId'],
      group: ['clientId'],
      raw: true,
    })
    const clientIds = missions.map((m: any) => m.clientId).filter((id: any) => id != null)

    if (clientIds.length === 0) {
      return successResponse(c, [])
    }

    const clients = await User.findAll({
      where: { id: clientIds, role: 'client' },
      attributes: ['id', 'firstName', 'lastName', 'email'],
      order: [['firstName', 'ASC'], ['lastName', 'ASC']],
    })
    return successResponse(c, clients)
  }

  // Client listing agents in their network (for re-assignment convenience)
  if (auth.role === 'client' && (requestedRole === 'agent' || !requestedRole)) {
    // Collect distinct agentIds from missions where this client is the client
    const missions = await Mission.findAll({
      where: { clientId: auth.userId },
      attributes: ['agentId'],
      group: ['agentId'],
      raw: true,
    })
    const agentIds = missions.map((m: any) => m.agentId).filter((id: any) => id != null)

    if (agentIds.length === 0) {
      return successResponse(c, [])
    }

    const agents = await User.findAll({
      where: { id: agentIds, role: 'agent' },
      attributes: ['id', 'firstName', 'lastName', 'email'],
      order: [['firstName', 'ASC'], ['lastName', 'ASC']],
    })
    return successResponse(c, agents)
  }

  return successResponse(c, [])
})

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
    profile = await ensureAgentProfile(auth.userId)
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

// GET /api/users/:id — minimal public user info by id (for read-only displays)
// Returns only public-safe fields. Used e.g. to display a pre-assigned agent's
// name in the mission create form when arriving via ?agentId=.
// Declared last so it never shadows specific routes (/me, /network, /agents/*, /clients/*).
users.get('/:id', authenticate(), async (c) => {
  const idParam = c.req.param('id') ?? ''
  // Only accept numeric ids to avoid matching other single-segment routes
  if (!/^\d+$/.test(idParam)) {
    throw new AppError('User not found', 404)
  }

  const user = await User.findByPk(parseInt(idParam, 10), {
    attributes: ['id', 'firstName', 'lastName', 'role'],
  })

  if (!user) throw new AppError('User not found', 404)

  return successResponse(c, user)
})

export default users
