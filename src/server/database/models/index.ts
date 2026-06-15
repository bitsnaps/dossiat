import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'

// ============================================================
// User & Auth Models
// ============================================================

interface UserModel {
  id: number
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  role: 'agent' | 'client' | 'admin'
  emailVerified: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface UserCreationAttributes extends Optional<UserModel, 'id' | 'emailVerified' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserModel, UserCreationAttributes> implements UserModel {
  declare id: number
  declare email: string
  declare passwordHash: string
  declare firstName: string
  declare lastName: string
  declare role: 'agent' | 'client' | 'admin'
  declare emailVerified: boolean
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('agent', 'client', 'admin'), allowNull: false },
    emailVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  { sequelize, tableName: 'users', modelName: 'User' }
)

// ============================================================
// Agent Profile
// ============================================================

interface AgentProfileModel {
  id: number
  userId: number
  bio: string | null
  specialties: string[]
  acceptedClientTypes: 'B2B' | 'B2C' | 'Both'
  uniqueInviteSlug: string
  currency: string
  timezone: string
  profilePhotoUrl: string | null
  createdAt?: Date
  updatedAt?: Date
}

interface AgentProfileCreationAttributes extends Optional<AgentProfileModel, 'id' | 'bio' | 'createdAt' | 'updatedAt'> {}

class AgentProfile extends Model<AgentProfileModel, AgentProfileCreationAttributes> implements AgentProfileModel {
  declare id: number
  declare userId: number
  declare bio: string | null
  declare specialties: string[]
  declare acceptedClientTypes: 'B2B' | 'B2C' | 'Both'
  declare uniqueInviteSlug: string
  declare currency: string
  declare timezone: string
  declare profilePhotoUrl: string | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

AgentProfile.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    bio: { type: DataTypes.TEXT, allowNull: true },
    specialties: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    acceptedClientTypes: { type: DataTypes.ENUM('B2B', 'B2C', 'Both'), allowNull: false, defaultValue: 'Both' },
    uniqueInviteSlug: { type: DataTypes.STRING, allowNull: false, unique: true },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
    timezone: { type: DataTypes.STRING, allowNull: false, defaultValue: 'UTC' },
    profilePhotoUrl: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, tableName: 'agent_profiles', modelName: 'AgentProfile' }
)

// ============================================================
// Client Profile
// ============================================================

interface ClientProfileModel {
  id: number
  userId: number
  companyName: string | null
  companySize: string | null
  industry: string | null
  createdAt?: Date
  updatedAt?: Date
}

interface ClientProfileCreationAttributes extends Optional<ClientProfileModel, 'id' | 'companyName' | 'companySize' | 'industry' | 'createdAt' | 'updatedAt'> {}

class ClientProfile extends Model<ClientProfileModel, ClientProfileCreationAttributes> implements ClientProfileModel {
  declare id: number
  declare userId: number
  declare companyName: string | null
  declare companySize: string | null
  declare industry: string | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

ClientProfile.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    companyName: { type: DataTypes.STRING, allowNull: true },
    companySize: { type: DataTypes.STRING, allowNull: true },
    industry: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, tableName: 'client_profiles', modelName: 'ClientProfile' }
)

// ============================================================
// Refresh Token
// ============================================================

interface RefreshTokenModel {
  id: number
  userId: number
  token: string
  expiresAt: Date
  createdAt?: Date
}

interface RefreshTokenCreationAttributes extends Optional<RefreshTokenModel, 'id' | 'createdAt'> {}

class RefreshToken extends Model<RefreshTokenModel, RefreshTokenCreationAttributes> implements RefreshTokenModel {
  declare id: number
  declare userId: number
  declare token: string
  declare expiresAt: Date
  declare readonly createdAt: Date
}

RefreshToken.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    token: { type: DataTypes.STRING(512), allowNull: false, unique: true },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, tableName: 'refresh_tokens', modelName: 'RefreshToken' }
)

// ============================================================
// Password Reset Token
// ============================================================

interface PasswordResetTokenModel {
  id: number
  userId: number
  token: string
  expiresAt: Date
  used: boolean
  createdAt?: Date
}

interface PasswordResetTokenCreationAttributes extends Optional<PasswordResetTokenModel, 'id' | 'used' | 'createdAt'> {}

class PasswordResetToken extends Model<PasswordResetTokenModel, PasswordResetTokenCreationAttributes> implements PasswordResetTokenModel {
  declare id: number
  declare userId: number
  declare token: string
  declare expiresAt: Date
  declare used: boolean
  declare readonly createdAt: Date
}

PasswordResetToken.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    token: { type: DataTypes.STRING(512), allowNull: false, unique: true },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    used: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  { sequelize, tableName: 'password_reset_tokens', modelName: 'PasswordResetToken' }
)

// ============================================================
// Email Verification Token
// ============================================================

interface EmailVerificationTokenModel {
  id: number
  userId: number
  token: string
  expiresAt: Date
  used: boolean
  createdAt?: Date
}

interface EmailVerificationTokenCreationAttributes extends Optional<EmailVerificationTokenModel, 'id' | 'used' | 'createdAt'> {}

class EmailVerificationToken extends Model<EmailVerificationTokenModel, EmailVerificationTokenCreationAttributes> implements EmailVerificationTokenModel {
  declare id: number
  declare userId: number
  declare token: string
  declare expiresAt: Date
  declare used: boolean
  declare readonly createdAt: Date
}

EmailVerificationToken.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    token: { type: DataTypes.STRING(512), allowNull: false, unique: true },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    used: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  { sequelize, tableName: 'email_verification_tokens', modelName: 'EmailVerificationToken' }
)

// ============================================================
// Mission
// ============================================================

interface MissionModel {
  id: number
  agentId: number
  clientId: number
  title: string
  description: string | null
  status: 'draft' | 'pending_agreement' | 'agreed' | 'in_progress' | 'completed' | 'disputed' | 'cancelled'
  type: 'one_time' | 'recurrent'
  pricingType: 'fixed' | 'hourly' | 'task_based'
  agreedAmount: number | null
  currency: string
  agreedChecklist: string[]
  completedChecklist: string[]
  startedAt: Date | null
  completedAt: Date | null
  createdAt?: Date
  updatedAt?: Date
}

interface MissionCreationAttributes extends Optional<MissionModel, 'id' | 'description' | 'agreedAmount' | 'agreedChecklist' | 'completedChecklist' | 'startedAt' | 'completedAt' | 'createdAt' | 'updatedAt'> {}

class Mission extends Model<MissionModel, MissionCreationAttributes> implements MissionModel {
  declare id: number
  declare agentId: number
  declare clientId: number
  declare title: string
  declare description: string | null
  declare status: 'draft' | 'pending_agreement' | 'agreed' | 'in_progress' | 'completed' | 'disputed' | 'cancelled'
  declare type: 'one_time' | 'recurrent'
  declare pricingType: 'fixed' | 'hourly' | 'task_based'
  declare agreedAmount: number | null
  declare currency: string
  declare agreedChecklist: string[]
  declare completedChecklist: string[]
  declare startedAt: Date | null
  declare completedAt: Date | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

Mission.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    agentId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    clientId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM('draft', 'pending_agreement', 'agreed', 'in_progress', 'completed', 'disputed', 'cancelled'),
      allowNull: false,
      defaultValue: 'draft',
    },
    type: { type: DataTypes.ENUM('one_time', 'recurrent'), allowNull: false, defaultValue: 'one_time' },
    pricingType: { type: DataTypes.ENUM('fixed', 'hourly', 'task_based'), allowNull: false },
    agreedAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
    agreedChecklist: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    completedChecklist: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    startedAt: { type: DataTypes.DATE, allowNull: true },
    completedAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, tableName: 'missions', modelName: 'Mission' }
)

// ============================================================
// Recurrent Mission Config
// ============================================================

interface RecurrentMissionConfigModel {
  id: number
  missionId: number
  frequency: 'daily' | 'weekly' | 'monthly' | 'annual'
  interval: number
  dayOfMonth: number | null
  dayOfWeek: number | null
  nextRunAt: Date | null
  lastRunAt: Date | null
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface RecurrentMissionConfigCreationAttributes extends Optional<RecurrentMissionConfigModel, 'id' | 'dayOfMonth' | 'dayOfWeek' | 'nextRunAt' | 'lastRunAt' | 'createdAt' | 'updatedAt'> {}

class RecurrentMissionConfig extends Model<RecurrentMissionConfigModel, RecurrentMissionConfigCreationAttributes> implements RecurrentMissionConfigModel {
  declare id: number
  declare missionId: number
  declare frequency: 'daily' | 'weekly' | 'monthly' | 'annual'
  declare interval: number
  declare dayOfMonth: number | null
  declare dayOfWeek: number | null
  declare nextRunAt: Date | null
  declare lastRunAt: Date | null
  declare isActive: boolean
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

RecurrentMissionConfig.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    missionId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'missions', key: 'id' }, onDelete: 'CASCADE' },
    frequency: { type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'annual'), allowNull: false },
    interval: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    dayOfMonth: { type: DataTypes.INTEGER, allowNull: true },
    dayOfWeek: { type: DataTypes.INTEGER, allowNull: true },
    nextRunAt: { type: DataTypes.DATE, allowNull: true },
    lastRunAt: { type: DataTypes.DATE, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { sequelize, tableName: 'recurrent_mission_configs', modelName: 'RecurrentMissionConfig' }
)

// ============================================================
// Mission Attachment
// ============================================================

interface MissionAttachmentModel {
  id: number
  missionId: number
  uploadedBy: number
  fileUrl: string
  fileName: string
  fileType: string
  fileSize: number
  createdAt?: Date
}

interface MissionAttachmentCreationAttributes extends Optional<MissionAttachmentModel, 'id' | 'createdAt'> {}

class MissionAttachment extends Model<MissionAttachmentModel, MissionAttachmentCreationAttributes> implements MissionAttachmentModel {
  declare id: number
  declare missionId: number
  declare uploadedBy: number
  declare fileUrl: string
  declare fileName: string
  declare fileType: string
  declare fileSize: number
  declare readonly createdAt: Date
}

MissionAttachment.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    missionId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'missions', key: 'id' }, onDelete: 'CASCADE' },
    uploadedBy: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    fileUrl: { type: DataTypes.STRING, allowNull: false },
    fileName: { type: DataTypes.STRING, allowNull: false },
    fileType: { type: DataTypes.STRING, allowNull: false },
    fileSize: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, tableName: 'mission_attachments', modelName: 'MissionAttachment' }
)

// ============================================================
// Conversation
// ============================================================

interface ConversationModel {
  id: number
  missionId: number
  createdAt?: Date
  updatedAt?: Date
}

interface ConversationCreationAttributes extends Optional<ConversationModel, 'id' | 'createdAt' | 'updatedAt'> {}

class Conversation extends Model<ConversationModel, ConversationCreationAttributes> implements ConversationModel {
  declare id: number
  declare missionId: number
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

Conversation.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    missionId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'missions', key: 'id' }, onDelete: 'CASCADE' },
  },
  { sequelize, tableName: 'conversations', modelName: 'Conversation' }
)

// ============================================================
// Message
// ============================================================

interface MessageModel {
  id: number
  conversationId: number
  senderId: number
  content: string
  readAt: Date | null
  createdAt?: Date
}

interface MessageCreationAttributes extends Optional<MessageModel, 'id' | 'readAt' | 'createdAt'> {}

class Message extends Model<MessageModel, MessageCreationAttributes> implements MessageModel {
  declare id: number
  declare conversationId: number
  declare senderId: number
  declare content: string
  declare readAt: Date | null
  declare readonly createdAt: Date
}

Message.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    conversationId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'conversations', key: 'id' }, onDelete: 'CASCADE' },
    senderId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    content: { type: DataTypes.TEXT, allowNull: false },
    readAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, tableName: 'messages', modelName: 'Message' }
)

// ============================================================
// Message Attachment
// ============================================================

interface MessageAttachmentModel {
  id: number
  messageId: number
  fileUrl: string
  fileName: string
  fileType: string
  fileSize: number
}

interface MessageAttachmentCreationAttributes extends Optional<MessageAttachmentModel, 'id'> {}

class MessageAttachment extends Model<MessageAttachmentModel, MessageAttachmentCreationAttributes> implements MessageAttachmentModel {
  declare id: number
  declare messageId: number
  declare fileUrl: string
  declare fileName: string
  declare fileType: string
  declare fileSize: number
}

MessageAttachment.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    messageId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'messages', key: 'id' }, onDelete: 'CASCADE' },
    fileUrl: { type: DataTypes.STRING, allowNull: false },
    fileName: { type: DataTypes.STRING, allowNull: false },
    fileType: { type: DataTypes.STRING, allowNull: false },
    fileSize: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, tableName: 'message_attachments', modelName: 'MessageAttachment' }
)

// ============================================================
// Payment
// ============================================================

interface PaymentModel {
  id: number
  missionId: number
  payerId: number
  payeeId: number
  amount: number
  currency: string
  method: 'cash' | 'stripe' | 'paypal' | 'bank_transfer'
  platformFee: number
  gatewayFee: number
  netAmount: number
  status: 'pending' | 'confirmed' | 'failed' | 'refunded'
  confirmedByPayer: boolean
  confirmedByPayee: boolean
  confirmedAt: Date | null
  createdAt?: Date
}

interface PaymentCreationAttributes extends Optional<PaymentModel, 'id' | 'platformFee' | 'gatewayFee' | 'confirmedByPayer' | 'confirmedByPayee' | 'confirmedAt' | 'createdAt'> {}

class Payment extends Model<PaymentModel, PaymentCreationAttributes> implements PaymentModel {
  declare id: number
  declare missionId: number
  declare payerId: number
  declare payeeId: number
  declare amount: number
  declare currency: string
  declare method: 'cash' | 'stripe' | 'paypal' | 'bank_transfer'
  declare platformFee: number
  declare gatewayFee: number
  declare netAmount: number
  declare status: 'pending' | 'confirmed' | 'failed' | 'refunded'
  declare confirmedByPayer: boolean
  declare confirmedByPayee: boolean
  declare confirmedAt: Date | null
  declare readonly createdAt: Date
}

Payment.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    missionId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'missions', key: 'id' }, onDelete: 'CASCADE' },
    payerId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    payeeId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: { args: [0.01], msg: 'Amount must be greater than 0' } },
    },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
    method: { type: DataTypes.ENUM('cash', 'stripe', 'paypal', 'bank_transfer'), allowNull: false },
    platformFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: { args: [0], msg: 'Platform fee cannot be negative' } },
    },
    gatewayFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: { args: [0], msg: 'Gateway fee cannot be negative' } },
    },
    netAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: { args: [0.01], msg: 'Net amount must be greater than 0' } },
    },
    status: { type: DataTypes.ENUM('pending', 'confirmed', 'failed', 'refunded'), allowNull: false, defaultValue: 'pending' },
    confirmedByPayer: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    confirmedByPayee: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    confirmedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: 'payments',
    modelName: 'Payment',
    validate: {
      netAmountNotGreaterThanAmount() {
        if (this.netAmount != null && this.amount != null && Number(this.netAmount) > Number(this.amount)) {
          throw new Error('Net amount cannot be greater than payment amount')
        }
      },
    },
  }
)

// ============================================================
// Platform Credit
// ============================================================

interface PlatformCreditModel {
  id: number
  agentId: number
  balance: number
  currency: string
  updatedAt?: Date
}

interface PlatformCreditCreationAttributes extends Optional<PlatformCreditModel, 'id' | 'updatedAt'> {}

class PlatformCredit extends Model<PlatformCreditModel, PlatformCreditCreationAttributes> implements PlatformCreditModel {
  declare id: number
  declare agentId: number
  declare balance: number
  declare currency: string
  declare readonly updatedAt: Date
}

PlatformCredit.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    agentId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    balance: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
  },
  { sequelize, tableName: 'platform_credits', modelName: 'PlatformCredit' }
)

// ============================================================
// Credit Transaction
// ============================================================

interface CreditTransactionModel {
  id: number
  creditId: number
  type: 'purchase' | 'deduction' | 'refund' | 'adjustment'
  amount: number
  description: string
  createdAt?: Date
}

interface CreditTransactionCreationAttributes extends Optional<CreditTransactionModel, 'id' | 'createdAt'> {}

class CreditTransaction extends Model<CreditTransactionModel, CreditTransactionCreationAttributes> implements CreditTransactionModel {
  declare id: number
  declare creditId: number
  declare type: 'purchase' | 'deduction' | 'refund' | 'adjustment'
  declare amount: number
  declare description: string
  declare readonly createdAt: Date
}

CreditTransaction.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    creditId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'platform_credits', key: 'id' }, onDelete: 'CASCADE' },
    type: { type: DataTypes.ENUM('purchase', 'deduction', 'refund', 'adjustment'), allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, tableName: 'credit_transactions', modelName: 'CreditTransaction' }
)

// ============================================================
// Invoice
// ============================================================

interface InvoiceModel {
  id: number
  agentId: number
  periodStart: Date
  periodEnd: Date
  totalFees: number
  currency: string
  status: 'draft' | 'sent' | 'paid'
  paidAt: Date | null
  createdAt?: Date
}

interface InvoiceCreationAttributes extends Optional<InvoiceModel, 'id' | 'paidAt' | 'createdAt'> {}

class Invoice extends Model<InvoiceModel, InvoiceCreationAttributes> implements InvoiceModel {
  declare id: number
  declare agentId: number
  declare periodStart: Date
  declare periodEnd: Date
  declare totalFees: number
  declare currency: string
  declare status: 'draft' | 'sent' | 'paid'
  declare paidAt: Date | null
  declare readonly createdAt: Date
}

Invoice.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    agentId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    periodStart: { type: DataTypes.DATE, allowNull: false },
    periodEnd: { type: DataTypes.DATE, allowNull: false },
    totalFees: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
    status: { type: DataTypes.ENUM('draft', 'sent', 'paid'), allowNull: false, defaultValue: 'draft' },
    paidAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, tableName: 'invoices', modelName: 'Invoice' }
)

// ============================================================
// Subscription Plan
// ============================================================

interface SubscriptionPlanModel {
  id: number
  name: 'small_business' | 'professional' | 'enterprise'
  price: number
  currency: string
  interval: 'monthly' | 'annual'
  maxSeats: number
  maxRecurrentMissions: number
  features: Record<string, unknown>
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface SubscriptionPlanCreationAttributes extends Optional<SubscriptionPlanModel, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class SubscriptionPlan extends Model<SubscriptionPlanModel, SubscriptionPlanCreationAttributes> implements SubscriptionPlanModel {
  declare id: number
  declare name: 'small_business' | 'professional' | 'enterprise'
  declare price: number
  declare currency: string
  declare interval: 'monthly' | 'annual'
  declare maxSeats: number
  declare maxRecurrentMissions: number
  declare features: Record<string, unknown>
  declare isActive: boolean
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

SubscriptionPlan.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.ENUM('small_business', 'professional', 'enterprise'), allowNull: false, unique: true },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
    interval: { type: DataTypes.ENUM('monthly', 'annual'), allowNull: false, defaultValue: 'monthly' },
    maxSeats: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    maxRecurrentMissions: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
    features: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { sequelize, tableName: 'subscription_plans', modelName: 'SubscriptionPlan' }
)

// ============================================================
// Subscription
// ============================================================

interface SubscriptionModel {
  id: number
  clientId: number
  planId: number
  status: 'active' | 'past_due' | 'cancelled'
  stripeSubscriptionId: string | null
  currentPeriodStart: Date
  currentPeriodEnd: Date
  createdAt?: Date
  updatedAt?: Date
}

interface SubscriptionCreationAttributes extends Optional<SubscriptionModel, 'id' | 'stripeSubscriptionId' | 'createdAt' | 'updatedAt'> {}

class Subscription extends Model<SubscriptionModel, SubscriptionCreationAttributes> implements SubscriptionModel {
  declare id: number
  declare clientId: number
  declare planId: number
  declare status: 'active' | 'past_due' | 'cancelled'
  declare stripeSubscriptionId: string | null
  declare currentPeriodStart: Date
  declare currentPeriodEnd: Date
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

Subscription.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    clientId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'client_profiles', key: 'id' }, onDelete: 'CASCADE' },
    planId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'subscription_plans', key: 'id' }, onDelete: 'RESTRICT' },
    status: { type: DataTypes.ENUM('active', 'past_due', 'cancelled'), allowNull: false, defaultValue: 'active' },
    stripeSubscriptionId: { type: DataTypes.STRING, allowNull: true },
    currentPeriodStart: { type: DataTypes.DATE, allowNull: false },
    currentPeriodEnd: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, tableName: 'subscriptions', modelName: 'Subscription' }
)

// ============================================================
// Subscription Invoice
// ============================================================

interface SubscriptionInvoiceModel {
  id: number
  subscriptionId: number
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed'
  paidAt: Date | null
  createdAt?: Date
}

interface SubscriptionInvoiceCreationAttributes extends Optional<SubscriptionInvoiceModel, 'id' | 'paidAt' | 'createdAt'> {}

class SubscriptionInvoice extends Model<SubscriptionInvoiceModel, SubscriptionInvoiceCreationAttributes> implements SubscriptionInvoiceModel {
  declare id: number
  declare subscriptionId: number
  declare amount: number
  declare currency: string
  declare status: 'pending' | 'paid' | 'failed'
  declare paidAt: Date | null
  declare readonly createdAt: Date
}

SubscriptionInvoice.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    subscriptionId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'subscriptions', key: 'id' }, onDelete: 'CASCADE' },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
    status: { type: DataTypes.ENUM('pending', 'paid', 'failed'), allowNull: false, defaultValue: 'pending' },
    paidAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, tableName: 'subscription_invoices', modelName: 'SubscriptionInvoice' }
)

// ============================================================
// Dispute
// ============================================================

interface DisputeModel {
  id: number
  missionId: number
  initiatedBy: number
  reason: string
  status: 'open' | 'reconciling' | 'resolved' | 'escalated'
  resolution: string | null
  resolvedAt: Date | null
  createdAt?: Date
  updatedAt?: Date
}

interface DisputeCreationAttributes extends Optional<DisputeModel, 'id' | 'resolution' | 'resolvedAt' | 'createdAt' | 'updatedAt'> {}

class Dispute extends Model<DisputeModel, DisputeCreationAttributes> implements DisputeModel {
  declare id: number
  declare missionId: number
  declare initiatedBy: number
  declare reason: string
  declare status: 'open' | 'reconciling' | 'resolved' | 'escalated'
  declare resolution: string | null
  declare resolvedAt: Date | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

Dispute.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    missionId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'missions', key: 'id' }, onDelete: 'CASCADE' },
    initiatedBy: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    reason: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.ENUM('open', 'reconciling', 'resolved', 'escalated'), allowNull: false, defaultValue: 'open' },
    resolution: { type: DataTypes.TEXT, allowNull: true },
    resolvedAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, tableName: 'disputes', modelName: 'Dispute' }
)

// ============================================================
// Dispute Message
// ============================================================

interface DisputeMessageModel {
  id: number
  disputeId: number
  senderId: number
  content: string
  createdAt?: Date
}

interface DisputeMessageCreationAttributes extends Optional<DisputeMessageModel, 'id' | 'createdAt'> {}

class DisputeMessage extends Model<DisputeMessageModel, DisputeMessageCreationAttributes> implements DisputeMessageModel {
  declare id: number
  declare disputeId: number
  declare senderId: number
  declare content: string
  declare readonly createdAt: Date
}

DisputeMessage.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    disputeId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'disputes', key: 'id' }, onDelete: 'CASCADE' },
    senderId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    content: { type: DataTypes.TEXT, allowNull: false },
  },
  { sequelize, tableName: 'dispute_messages', modelName: 'DisputeMessage' }
)

// ============================================================
// Notification
// ============================================================

interface NotificationModel {
  id: number
  userId: number
  type: string
  title: string
  body: string
  data: Record<string, unknown>
  readAt: Date | null
  createdAt?: Date
}

interface NotificationCreationAttributes extends Optional<NotificationModel, 'id' | 'data' | 'readAt' | 'createdAt'> {}

class Notification extends Model<NotificationModel, NotificationCreationAttributes> implements NotificationModel {
  declare id: number
  declare userId: number
  declare type: string
  declare title: string
  declare body: string
  declare data: Record<string, unknown>
  declare readAt: Date | null
  declare readonly createdAt: Date
}

Notification.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    type: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: false },
    data: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    readAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, tableName: 'notifications', modelName: 'Notification' }
)

// ============================================================
// Associations
// ============================================================

User.hasOne(AgentProfile, { foreignKey: 'userId', as: 'agentProfile' })
AgentProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' })

User.hasOne(ClientProfile, { foreignKey: 'userId', as: 'clientProfile' })
ClientProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' })

User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' })
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' })

User.hasMany(PasswordResetToken, { foreignKey: 'userId', as: 'passwordResetTokens' })
PasswordResetToken.belongsTo(User, { foreignKey: 'userId', as: 'user' })

User.hasMany(EmailVerificationToken, { foreignKey: 'userId', as: 'emailVerificationTokens' })
EmailVerificationToken.belongsTo(User, { foreignKey: 'userId', as: 'user' })

User.hasMany(Mission, { foreignKey: 'agentId', as: 'agentMissions' })
User.hasMany(Mission, { foreignKey: 'clientId', as: 'clientMissions' })
Mission.belongsTo(User, { foreignKey: 'agentId', as: 'agent' })
Mission.belongsTo(User, { foreignKey: 'clientId', as: 'client' })

Mission.hasOne(RecurrentMissionConfig, { foreignKey: 'missionId', as: 'recurrenceConfig' })
RecurrentMissionConfig.belongsTo(Mission, { foreignKey: 'missionId', as: 'mission' })

Mission.hasMany(MissionAttachment, { foreignKey: 'missionId', as: 'attachments' })
MissionAttachment.belongsTo(Mission, { foreignKey: 'missionId', as: 'mission' })
MissionAttachment.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' })

Mission.hasOne(Conversation, { foreignKey: 'missionId', as: 'conversation' })
Conversation.belongsTo(Mission, { foreignKey: 'missionId', as: 'mission' })

Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' })
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' })
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' })

Message.hasMany(MessageAttachment, { foreignKey: 'messageId', as: 'attachments' })
MessageAttachment.belongsTo(Message, { foreignKey: 'messageId', as: 'message' })

Mission.hasMany(Payment, { foreignKey: 'missionId', as: 'payments' })
Payment.belongsTo(Mission, { foreignKey: 'missionId', as: 'mission' })
Payment.belongsTo(User, { foreignKey: 'payerId', as: 'payer' })
Payment.belongsTo(User, { foreignKey: 'payeeId', as: 'payee' })

User.hasOne(PlatformCredit, { foreignKey: 'agentId', as: 'platformCredit' })
PlatformCredit.belongsTo(User, { foreignKey: 'agentId', as: 'agent' })

PlatformCredit.hasMany(CreditTransaction, { foreignKey: 'creditId', as: 'transactions' })
CreditTransaction.belongsTo(PlatformCredit, { foreignKey: 'creditId', as: 'credit' })

User.hasMany(Invoice, { foreignKey: 'agentId', as: 'invoices' })
Invoice.belongsTo(User, { foreignKey: 'agentId', as: 'agent' })

ClientProfile.hasOne(Subscription, { foreignKey: 'clientId', as: 'subscription' })
Subscription.belongsTo(ClientProfile, { foreignKey: 'clientId', as: 'clientProfile' })
Subscription.belongsTo(SubscriptionPlan, { foreignKey: 'planId', as: 'plan' })
SubscriptionPlan.hasMany(Subscription, { foreignKey: 'planId', as: 'subscriptions' })

Subscription.hasMany(SubscriptionInvoice, { foreignKey: 'subscriptionId', as: 'invoices' })
SubscriptionInvoice.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' })

Mission.hasMany(Dispute, { foreignKey: 'missionId', as: 'disputes' })
Dispute.belongsTo(Mission, { foreignKey: 'missionId', as: 'mission' })
Dispute.belongsTo(User, { foreignKey: 'initiatedBy', as: 'initiator' })

Dispute.hasMany(DisputeMessage, { foreignKey: 'disputeId', as: 'messages' })
DisputeMessage.belongsTo(Dispute, { foreignKey: 'disputeId', as: 'dispute' })
DisputeMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' })

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' })
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' })

export {
  User,
  AgentProfile,
  ClientProfile,
  RefreshToken,
  PasswordResetToken,
  EmailVerificationToken,
  Mission,
  RecurrentMissionConfig,
  MissionAttachment,
  Conversation,
  Message,
  MessageAttachment,
  Payment,
  PlatformCredit,
  CreditTransaction,
  Invoice,
  SubscriptionPlan,
  Subscription,
  SubscriptionInvoice,
  Dispute,
  DisputeMessage,
  Notification,
}
