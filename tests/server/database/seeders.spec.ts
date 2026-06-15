import { describe, it, expect, beforeAll } from 'vitest'
import bcrypt from 'bcryptjs'
import {
  User,
  AgentProfile,
  ClientProfile,
  Mission,
  Conversation,
  Message,
} from '@/server/database/models'
import sequelize from '@/server/database/config/database'
import { createDemoUsers } from '@/server/database/seeders/helpers/demo-users'
import { SUPPORTED_CURRENCIES } from '@/server/database/seeders/helpers/currencies'

const DEMO_EMAILS = ['agent-demo@dossiat.com', 'client-demo@dossiat.com']

describe('Demo Users Seeder (2j)', () => {
  beforeAll(async () => {
    await sequelize.authenticate()
    // Aggressively clean up any leftover demo data before seeding
    await sequelize.query(`PRAGMA foreign_keys = OFF`)
    await sequelize.query(`DELETE FROM messages WHERE conversation_id IN (SELECT c.id FROM conversations c JOIN missions m ON c.mission_id = m.id WHERE m.agent_id IN (SELECT id FROM users WHERE email IN (${DEMO_EMAILS.map(() => '?').join(',')})))`, { replacements: DEMO_EMAILS })
    await sequelize.query(`DELETE FROM message_attachments WHERE message_id IN (SELECT id FROM messages WHERE sender_id IN (SELECT id FROM users WHERE email IN (${DEMO_EMAILS.map(() => '?').join(',')})))`, { replacements: DEMO_EMAILS })
    await sequelize.query(`DELETE FROM conversations WHERE mission_id IN (SELECT id FROM missions WHERE agent_id IN (SELECT id FROM users WHERE email IN (${DEMO_EMAILS.map(() => '?').join(',')})) OR client_id IN (SELECT id FROM users WHERE email IN (${DEMO_EMAILS.map(() => '?').join(',')})))`, { replacements: [...DEMO_EMAILS, ...DEMO_EMAILS] })
    await sequelize.query(`DELETE FROM payments WHERE payer_id IN (SELECT id FROM users WHERE email IN (${DEMO_EMAILS.map(() => '?').join(',')})) OR payee_id IN (SELECT id FROM users WHERE email IN (${DEMO_EMAILS.map(() => '?').join(',')}))`, { replacements: [...DEMO_EMAILS, ...DEMO_EMAILS] })
    await sequelize.query(`DELETE FROM missions WHERE agent_id IN (SELECT id FROM users WHERE email IN (${DEMO_EMAILS.map(() => '?').join(',')})) OR client_id IN (SELECT id FROM users WHERE email IN (${DEMO_EMAILS.map(() => '?').join(',')}))`, { replacements: [...DEMO_EMAILS, ...DEMO_EMAILS] })
    await sequelize.query(`DELETE FROM agent_profiles WHERE user_id IN (SELECT id FROM users WHERE email IN (${DEMO_EMAILS.map(() => '?').join(',')}))`, { replacements: DEMO_EMAILS })
    await sequelize.query(`DELETE FROM client_profiles WHERE user_id IN (SELECT id FROM users WHERE email IN (${DEMO_EMAILS.map(() => '?').join(',')}))`, { replacements: DEMO_EMAILS })
    await sequelize.query(`DELETE FROM refresh_tokens WHERE user_id IN (SELECT id FROM users WHERE email IN (${DEMO_EMAILS.map(() => '?').join(',')}))`, { replacements: DEMO_EMAILS })
    await sequelize.query(`DELETE FROM email_verification_tokens WHERE user_id IN (SELECT id FROM users WHERE email IN (${DEMO_EMAILS.map(() => '?').join(',')}))`, { replacements: DEMO_EMAILS })
    await sequelize.query(`DELETE FROM password_reset_tokens WHERE user_id IN (SELECT id FROM users WHERE email IN (${DEMO_EMAILS.map(() => '?').join(',')}))`, { replacements: DEMO_EMAILS })
    await sequelize.query(`DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email IN (${DEMO_EMAILS.map(() => '?').join(',')}))`, { replacements: DEMO_EMAILS })
    await sequelize.query(`DELETE FROM platform_credits WHERE agent_id IN (SELECT id FROM users WHERE email IN (${DEMO_EMAILS.map(() => '?').join(',')}))`, { replacements: DEMO_EMAILS })
    await sequelize.query(`DELETE FROM invoices WHERE agent_id IN (SELECT id FROM users WHERE email IN (${DEMO_EMAILS.map(() => '?').join(',')}))`, { replacements: DEMO_EMAILS })
    await sequelize.query(`DELETE FROM users WHERE email IN (${DEMO_EMAILS.map(() => '?').join(',')})`, { replacements: DEMO_EMAILS })
    await sequelize.query(`PRAGMA foreign_keys = ON`)
    await createDemoUsers()
  })

  it('creates an agent user with valid password hash', async () => {
    const agentUser = await User.findOne({ where: { email: 'agent-demo@dossiat.com' } })
    expect(agentUser).not.toBeNull()
    expect(agentUser!.role).toBe('agent')
    expect(agentUser!.firstName).toBe('Omar')
    const valid = await bcrypt.compare('Demo1234!', agentUser!.passwordHash)
    expect(valid).toBe(true)
  })

  it('creates an agent profile with slug', async () => {
    const agentUser = await User.findOne({ where: { email: 'agent-demo@dossiat.com' } })
    const profile = await AgentProfile.findOne({ where: { userId: agentUser!.id } })
    expect(profile).not.toBeNull()
    expect(profile!.uniqueInviteSlug).toBeTruthy()
    expect(profile!.currency).toBe('USD')
  })

  it('creates a client user with profile', async () => {
    const clientUser = await User.findOne({ where: { email: 'client-demo@dossiat.com' } })
    expect(clientUser).not.toBeNull()
    expect(clientUser!.role).toBe('client')

    const profile = await ClientProfile.findOne({ where: { userId: clientUser!.id } })
    expect(profile).not.toBeNull()
    expect(profile!.companyName).toBeTruthy()
  })

  it('creates sample missions between agent and client', async () => {
    const agentUser = await User.findOne({ where: { email: 'agent-demo@dossiat.com' } })
    const missions = await Mission.findAll({ where: { agentId: agentUser!.id } })
    expect(missions.length).toBeGreaterThanOrEqual(2)

    const statuses = missions.map((m) => m.status)
    expect(statuses).toContain('completed')
    expect(statuses).toContain('in_progress')
  })

  it('creates a conversation for the in_progress mission', async () => {
    const mission = await Mission.findOne({ where: { status: 'in_progress' } })
    expect(mission).not.toBeNull()
    const conversation = await Conversation.findOne({ where: { missionId: mission!.id } })
    expect(conversation).not.toBeNull()

    const messages = await Message.findAll({ where: { conversationId: conversation!.id } })
    expect(messages.length).toBeGreaterThanOrEqual(1)
  })
})

describe('Supported Currencies (2j)', () => {
  it('exports an array of currency objects with code and name', () => {
    expect(Array.isArray(SUPPORTED_CURRENCIES)).toBe(true)
    expect(SUPPORTED_CURRENCIES.length).toBeGreaterThan(0)
    for (const c of SUPPORTED_CURRENCIES) {
      expect(c).toHaveProperty('code')
      expect(c).toHaveProperty('name')
      expect(c.code).toHaveLength(3)
    }
  })

  it('includes common currencies', () => {
    const codes = SUPPORTED_CURRENCIES.map((c) => c.code)
    expect(codes).toContain('USD')
    expect(codes).toContain('EUR')
    expect(codes).toContain('GBP')
    expect(codes).toContain('DZD')
  })
})
