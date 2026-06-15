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
} from '@/server/database/models'

function generateSlug(): string {
  return crypto.randomBytes(8).toString('hex')
}

export async function createDemoUsers(): Promise<{ agentId: number; clientId: number }> {
  // Clean up any previous demo data
  const existingAgent = await User.findOne({ where: { email: 'agent-demo@dossiat.com' } })
  if (existingAgent) {
    const missionIds = (await Mission.findAll({ where: { agentId: existingAgent.id }, attributes: ['id'] })).map((m) => m.id)
    if (missionIds.length > 0) {
      await Message.destroy({ where: { conversationId: { [Op.in]: (await Conversation.findAll({ where: { missionId: { [Op.in]: missionIds } }, attributes: ['id'] })).map((c) => c.id) } } })
      await Conversation.destroy({ where: { missionId: { [Op.in]: missionIds } } })
    }
    await Mission.destroy({ where: { agentId: existingAgent.id } })
    await AgentProfile.destroy({ where: { userId: existingAgent.id } })
    await existingAgent.destroy()
  }
  const existingClient = await User.findOne({ where: { email: 'client-demo@dossiat.com' } })
  if (existingClient) {
    await ClientProfile.destroy({ where: { userId: existingClient.id } })
    await existingClient.destroy()
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
