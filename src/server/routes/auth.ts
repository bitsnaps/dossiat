import { Hono } from 'hono'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { User, AgentProfile, ClientProfile, RefreshToken, EmailVerificationToken, PasswordResetToken } from '@/server/database/models'
import { successResponse } from '@/server/utils/apiResponse'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/server/utils/jwt'
import { validateRequest, validators } from '@/server/middleware/validateRequest'
import { AppError } from '@/server/middleware/errorHandler'

const auth = new Hono()

// POST /api/auth/register
auth.post('/register',
  validateRequest({
    body: {
      email: validators.required(),
      password: validators.required(),
      firstName: validators.required(),
      lastName: validators.required(),
      role: validators.isIn(['agent', 'client']),
      acceptTerms: validators.required(),
    },
  }),
  async (c) => {
    const { email, password, firstName, lastName, role, acceptTerms } = await c.req.json()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AppError('Invalid email format', 422)
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 422)
    }

    if (!acceptTerms) {
      throw new AppError('You must accept the Terms of Service to register', 422)
    }

    const existing = await User.findOne({ where: { email: email.toLowerCase() } })
    if (existing) {
      throw new AppError('Email already registered', 409)
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      role,
      tosAcceptedAt: new Date(),
    })

    if (role === 'agent') {
      const slug = `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${crypto.randomBytes(3).toString('hex')}`
      await AgentProfile.create({
        userId: user.id,
        uniqueInviteSlug: slug,
        specialties: [],
        acceptedClientTypes: 'Both',
        currency: 'USD',
        timezone: 'UTC',
      })
    } else {
      await ClientProfile.create({ userId: user.id })
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await EmailVerificationToken.create({
      userId: user.id,
      token: verificationToken,
      expiresAt,
    })

    const tokenPayload = { userId: user.id, email: user.email, role: user.role }
    const accessToken = await generateAccessToken(tokenPayload)
    const refreshToken = await generateRefreshToken(tokenPayload)

    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshExpiry,
    })

    return successResponse(c, {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      emailVerified: user.emailVerified,
      accessToken,
      refreshToken,
      verificationToken,
    }, 'Registration successful', 201)
  }
)

// POST /api/auth/login
auth.post('/login',
  validateRequest({
    body: {
      email: validators.required(),
      password: validators.required(),
    },
  }),
  async (c) => {
    const { email, password } = await c.req.json()

    const user = await User.findOne({ where: { email: email.toLowerCase() } })
    if (!user) {
      throw new AppError('Invalid email or password', 401)
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      throw new AppError('Invalid email or password', 401)
    }

    const tokenPayload = { userId: user.id, email: user.email, role: user.role }
    const accessToken = await generateAccessToken(tokenPayload)
    const refreshToken = await generateRefreshToken(tokenPayload)

    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshExpiry,
    })

    return successResponse(c, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      accessToken,
      refreshToken,
    })
  }
)

// POST /api/auth/refresh
auth.post('/refresh',
  validateRequest({
    body: { refreshToken: validators.required() },
  }),
  async (c) => {
    const { refreshToken: token } = await c.req.json()

    let payload
    try {
      payload = await verifyRefreshToken(token)
    } catch {
      throw new AppError('Invalid or expired refresh token', 401)
    }

    const storedToken = await RefreshToken.findOne({
      where: { token, userId: payload.userId },
    })

    if (!storedToken) {
      throw new AppError('Refresh token has been revoked', 401)
    }

    if (new Date() > storedToken.expiresAt) {
      await storedToken.destroy()
      throw new AppError('Refresh token has expired', 401)
    }

    const user = await User.findByPk(payload.userId)
    if (!user) {
      throw new AppError('User not found', 401)
    }

    const newPayload = { userId: user.id, email: user.email, role: user.role }
    const newAccessToken = await generateAccessToken(newPayload)
    const newRefreshToken = await generateRefreshToken(newPayload)

    await storedToken.update({ token: newRefreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })

    return successResponse(c, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    })
  }
)

// POST /api/auth/logout
auth.post('/logout',
  validateRequest({
    body: { refreshToken: validators.required() },
  }),
  async (c) => {
    const { refreshToken: token } = await c.req.json()

    await RefreshToken.destroy({ where: { token } })

    return successResponse(c, { loggedOut: true })
  }
)

// POST /api/auth/forgot-password
auth.post('/forgot-password',
  validateRequest({
    body: { email: validators.required() },
  }),
  async (c) => {
    const { email } = await c.req.json()

    const user = await User.findOne({ where: { email: email.toLowerCase() } })

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

      await PasswordResetToken.create({
        userId: user.id,
        token: resetToken,
        expiresAt,
      })
      // TODO: Send email with reset token
    }

    return successResponse(c, { message: 'If the email exists, a reset link has been sent' })
  }
)

// POST /api/auth/reset-password
auth.post('/reset-password',
  validateRequest({
    body: {
      token: validators.required(),
      password: validators.required(),
    },
  }),
  async (c) => {
    const { token, password } = await c.req.json()

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 422)
    }

    const resetToken = await PasswordResetToken.findOne({
      where: { token, used: false },
    })

    if (!resetToken || new Date() > resetToken.expiresAt) {
      throw new AppError('Invalid or expired reset token', 400)
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await User.update({ passwordHash }, { where: { id: resetToken.userId } })

    await resetToken.update({ used: true })

    await RefreshToken.destroy({ where: { userId: resetToken.userId } })

    return successResponse(c, { message: 'Password reset successful' })
  }
)

// GET /api/auth/verify-email/:token
auth.get('/verify-email/:token', async (c) => {
  const token = c.req.param('token')

  const verificationToken = await EmailVerificationToken.findOne({
    where: { token, used: false },
  })

  if (!verificationToken || new Date() > verificationToken.expiresAt) {
    throw new AppError('Invalid or expired verification token', 400)
  }

  await User.update({ emailVerified: true }, { where: { id: verificationToken.userId } })

  await verificationToken.update({ used: true })

  return successResponse(c, { message: 'Email verified successfully' })
})

// POST /api/auth/resend-verification
auth.post('/resend-verification',
  validateRequest({
    body: { email: validators.required() },
  }),
  async (c) => {
    const { email } = await c.req.json()

    const user = await User.findOne({ where: { email: email.toLowerCase() } })
    if (!user) {
      throw new AppError('User not found', 404)
    }

    if (user.emailVerified) {
      throw new AppError('Email already verified', 400)
    }

    await EmailVerificationToken.destroy({ where: { userId: user.id, used: false } })

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await EmailVerificationToken.create({
      userId: user.id,
      token: verificationToken,
      expiresAt,
    })

    // TODO: Send verification email

    return successResponse(c, { message: 'Verification email sent' })
  }
)

export default auth
