import { post, get } from './api'

interface LoginParams {
  email: string
  password: string
}

interface RegisterParams {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'agent' | 'client'
  acceptTerms: boolean
}

interface ResetPasswordParams {
  token: string
  password: string
}

export function login(params: LoginParams) {
  return post('/auth/login', params)
}

export function register(params: RegisterParams) {
  return post('/auth/register', params)
}

export function logout(refreshToken: string) {
  return post('/auth/logout', { refreshToken })
}

export function refreshToken(refreshToken: string) {
  return post('/auth/refresh', { refreshToken })
}

export function forgotPassword(email: string) {
  return post('/auth/forgot-password', { email })
}

export function resetPassword(params: ResetPasswordParams) {
  return post('/auth/reset-password', params)
}

export function verifyEmail(token: string) {
  return get(`/auth/verify-email/${token}`)
}

export function resendVerification(email: string) {
  return post('/auth/resend-verification', { email })
}
