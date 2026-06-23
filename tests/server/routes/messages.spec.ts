import { describe, it, expect, beforeAll } from 'vitest'
import app from '@/server/index'
import { User, AgentProfile, ClientProfile, Mission, Conversation, Message, RefreshToken, Notification, EmailVerificationToken, PasswordResetToken } from '@/server/database/models'

let agentToken: string
let clientToken: string
let missionId: number

beforeAll(async () => {
  await Notification.destroy({ where: {} })
  await Message.destroy({ where: {} })
  await Conversation.destroy({ where: {} })
  await Mission.destroy({ where: {} })
  await EmailVerificationToken.destroy({ where: {} })
  await PasswordResetToken.destroy({ where: {} })
  await RefreshToken.destroy({ where: {} })
  await AgentProfile.destroy({ where: {} })
  // await ClientProfile.destroy({ where: {} })
  // await User.destroy({ where: {} })

  const agentRes = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `agent-msg-${Date.now()}@test.com`, password: 'Password123!', firstName: 'Agent', lastName: 'Msg', role: 'agent' }),
  })
  const agentBody = await agentRes.json()
  agentToken = agentBody.data.accessToken

  const clientRes = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `client-msg-${Date.now()}@test.com`, password: 'Password123!', firstName: 'Client', lastName: 'Msg', role: 'client' }),
  })
  const clientBody = await clientRes.json()
  clientToken = clientBody.data.accessToken

  const missionRes = await app.request('/api/missions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
    body: JSON.stringify({ title: 'Msg Mission', clientId: clientBody.data.id, pricingType: 'fixed' }),
  })
  const missionBody = await missionRes.json()
  missionId = missionBody.data.id
})

describe('Message Routes', () => {
  it('POST /api/missions/:id/messages - sends a message', async () => {
    const res = await app.request(`/api/missions/${missionId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({ content: 'Hello from agent!' }),
    })
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.content).toBe('Hello from agent!')
  })

  it('GET /api/missions/:id/messages - lists messages', async () => {
    const res = await app.request(`/api/missions/${missionId}/messages`, {
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.length).toBeGreaterThan(0)
  })

  it('GET /api/messages/unread-count - returns unread count', async () => {
    const res = await app.request('/api/messages/unread-count', {
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.count).toBeGreaterThan(0)
  })
})
