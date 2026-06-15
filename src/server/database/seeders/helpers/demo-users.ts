import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { Op } from 'sequelize'
import {
  User,
  AgentProfile,
  ClientProfile,
  Mission,
  Conversation,
  Message,
  MessageAttachment,
  Payment,
  RefreshToken,
  EmailVerificationToken,
  PasswordResetToken,
  Notification,
  PlatformCredit,
  Invoice,
} from '@/server/database/models'

function generateSlug(): string {
  return crypto.randomBytes(8).toString('hex')
}

const DEMO_EMAILS = ['agent-demo@dossiat.com', 'client-demo@dossiat.com']

async function cleanupDemoUser(email: string): Promise<void> {
  const user = await User.findOne({ where: { email } })
  if (!user) return

  // Find missions this user participated in
  const missions = await Mission.findAll({
    where: { [Op.or]: [{ agentId: user.id }, { clientId: user.id }] },
    attributes: ['id'],
  })
  const missionIds = missions.map(m => m.id)

  if (missionIds.length > 0) {
    // Find conversations for those missions
    const conversations = await Conversation.findAll({
      where: { missionId: { [Op.in]: missionIds } },
      attributes: ['id'],
    })
    const conversationIds = conversations.map(c => c.id)

    if (conversationIds.length > 0) {
      // Find messages to delete their attachments first
      const msgs = await Message.findAll({ where: { conversationId: { [Op.in]: conversationIds } }, attributes: ['id'] })
      const msgIds = msgs.map(m => m.id)
      if (msgIds.length > 0) {
        await MessageAttachment.destroy({ where: { messageId: { [Op.in]: msgIds } } })
      }
      await Message.destroy({ where: { conversationId: { [Op.in]: conversationIds } } })
    }
    await Conversation.destroy({ where: { missionId: { [Op.in]: missionIds } } })

    // Delete payments for those missions
    await Payment.destroy({ where: { missionId: { [Op.in]: missionIds } } })
  }
  await Mission.destroy({ where: { [Op.or]: [{ agentId: user.id }, { clientId: user.id }] } })
  await AgentProfile.destroy({ where: { userId: user.id } })
  await ClientProfile.destroy({ where: { userId: user.id } })
  await RefreshToken.destroy({ where: { userId: user.id } })
  await EmailVerificationToken.destroy({ where: { userId: user.id } })
  await PasswordResetToken.destroy({ where: { userId: user.id } })
  await Notification.destroy({ where: { userId: user.id } })
  await PlatformCredit.destroy({ where: { agentId: user.id } })
  await Invoice.destroy({ where: { agentId: user.id } })
  await user.destroy()
}

export async function createDemoUsers(): Promise<{ agentId: number; clientId: number }> {
  // Clean up any previous demo data
  for (const email of DEMO_EMAILS) {
    await cleanupDemoUser(email)
  }

  // Create agent user
  const agent = await User.create({
    email: 'agent-demo@dossiat.com',
    passwordHash: await bcrypt.hash('Demo1234!', 10),
    firstName: 'Omar',
    lastName: 'Benali',
    role: 'agent',
    emailVerified: true,
  })

  // Create agent profile
  await AgentProfile.create({
    userId: agent.id,
    bio: 'Experienced administrative assistant with 5+ years in office management and errand coordination.',
    specialties: ['Office Management', 'Errand Running', 'Document Processing', 'Travel Coordination'],
    acceptedClientTypes: 'Both',
    uniqueInviteSlug: generateSlug(),
    currency: 'USD',
    timezone: 'Africa/Algiers',
  })

  // Create client user
  const client = await User.create({
    email: 'client-demo@dossiat.com',
    passwordHash: await bcrypt.hash('Demo1234!', 10),
    firstName: 'Sophia',
    lastName: 'Martin',
    role: 'client',
    emailVerified: true,
  })

  // Create client profile
  await ClientProfile.create({
    userId: client.id,
    companyName: 'Martin & Associates',
    companySize: '10-50',
    industry: 'Consulting',
  })

  // Create sample missions
  const mission1 = await Mission.create({
    agentId: agent.id,
    clientId: client.id,
    title: 'Monthly Office Supply Run',
    description: 'Procure office supplies for the month including stationery, printer paper, and pantry items.',
    status: 'completed',
    type: 'one_time',
    pricingType: 'fixed',
    agreedAmount: 150,
    currency: 'USD',
    agreedChecklist: ['Visit office supply store', 'Check inventory list', 'Purchase items', 'Deliver to office'],
    completedChecklist: ['Visit office supply store', 'Check inventory list', 'Purchase items', 'Deliver to office'],
    startedAt: new Date('2026-05-01'),
    completedAt: new Date('2026-05-03'),
  })

  const mission2 = await Mission.create({
    agentId: agent.id,
    clientId: client.id,
    title: 'Client Document Filing',
    description: 'Organize and file quarterly client reports in the shared drive and physical archive.',
    status: 'in_progress',
    type: 'one_time',
    pricingType: 'hourly',
    agreedAmount: 200,
    currency: 'USD',
    agreedChecklist: ['Download reports from email', 'Organize by client', 'Upload to shared drive', 'File physical copies'],
    completedChecklist: ['Download reports from email', 'Organize by client'],
  })

  // Create a draft mission (not yet sent)
  await Mission.create({
    agentId: agent.id,
    clientId: client.id,
    title: 'Airport Pickup Coordination',
    description: 'Coordinate airport pickup for visiting client from JFK.',
    status: 'draft',
    type: 'one_time',
    pricingType: 'fixed',
    agreedAmount: 80,
    currency: 'USD',
  })

  // Create conversation and message for in_progress mission
  const conversation = await Conversation.create({ missionId: mission2.id })

  await Message.create({
    conversationId: conversation.id,
    senderId: agent.id,
    content: 'Hi Sophia, I\'ve finished downloading and organizing the reports. Uploading to the shared drive now.',
  })

  await Message.create({
    conversationId: conversation.id,
    senderId: client.id,
    content: 'Thanks Omar! Let me know when you need access to the physical archive.',
  })

  return { agentId: agent.id, clientId: client.id }
}
