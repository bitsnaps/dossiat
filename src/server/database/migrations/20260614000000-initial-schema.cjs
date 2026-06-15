'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Users
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING, allowNull: false },
      first_name: { type: Sequelize.STRING, allowNull: false },
      last_name: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.ENUM('agent', 'client', 'admin'), allowNull: false },
      email_verified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // Agent Profiles
    await queryInterface.createTable('agent_profiles', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      bio: { type: Sequelize.TEXT, allowNull: true },
      specialties: { type: Sequelize.JSON, allowNull: false, defaultValue: '[]' },
      accepted_client_types: { type: Sequelize.ENUM('B2B', 'B2C', 'Both'), allowNull: false, defaultValue: 'Both' },
      unique_invite_slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'USD' },
      timezone: { type: Sequelize.STRING, allowNull: false, defaultValue: 'UTC' },
      profile_photo_url: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // Client Profiles
    await queryInterface.createTable('client_profiles', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      company_name: { type: Sequelize.STRING, allowNull: true },
      company_size: { type: Sequelize.STRING, allowNull: true },
      industry: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // Refresh Tokens
    await queryInterface.createTable('refresh_tokens', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      token: { type: Sequelize.STRING(512), allowNull: false, unique: true },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // Password Reset Tokens
    await queryInterface.createTable('password_reset_tokens', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      token: { type: Sequelize.STRING(512), allowNull: false, unique: true },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      used: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // Email Verification Tokens
    await queryInterface.createTable('email_verification_tokens', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      token: { type: Sequelize.STRING(512), allowNull: false, unique: true },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      used: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // Missions
    await queryInterface.createTable('missions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      agent_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      client_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      status: {
        type: Sequelize.ENUM('draft', 'pending_agreement', 'agreed', 'in_progress', 'completed', 'disputed', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft',
      },
      type: { type: Sequelize.ENUM('one_time', 'recurrent'), allowNull: false, defaultValue: 'one_time' },
      pricing_type: { type: Sequelize.ENUM('fixed', 'hourly', 'task_based'), allowNull: false },
      agreed_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'USD' },
      agreed_checklist: { type: Sequelize.JSON, allowNull: false, defaultValue: '[]' },
      completed_checklist: { type: Sequelize.JSON, allowNull: false, defaultValue: '[]' },
      started_at: { type: Sequelize.DATE, allowNull: true },
      completed_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // Recurrent Mission Configs
    await queryInterface.createTable('recurrent_mission_configs', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      mission_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'missions', key: 'id' }, onDelete: 'CASCADE' },
      frequency: { type: Sequelize.ENUM('daily', 'weekly', 'monthly', 'annual'), allowNull: false },
      interval: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      day_of_month: { type: Sequelize.INTEGER, allowNull: true },
      day_of_week: { type: Sequelize.INTEGER, allowNull: true },
      next_run_at: { type: Sequelize.DATE, allowNull: true },
      last_run_at: { type: Sequelize.DATE, allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // Mission Attachments
    await queryInterface.createTable('mission_attachments', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      mission_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'missions', key: 'id' }, onDelete: 'CASCADE' },
      uploaded_by: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      file_url: { type: Sequelize.STRING, allowNull: false },
      file_name: { type: Sequelize.STRING, allowNull: false },
      file_type: { type: Sequelize.STRING, allowNull: false },
      file_size: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // Conversations
    await queryInterface.createTable('conversations', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      mission_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'missions', key: 'id' }, onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // Messages
    await queryInterface.createTable('messages', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      conversation_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'conversations', key: 'id' }, onDelete: 'CASCADE' },
      sender_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      content: { type: Sequelize.TEXT, allowNull: false },
      read_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // Message Attachments
    await queryInterface.createTable('message_attachments', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      message_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'messages', key: 'id' }, onDelete: 'CASCADE' },
      file_url: { type: Sequelize.STRING, allowNull: false },
      file_name: { type: Sequelize.STRING, allowNull: false },
      file_type: { type: Sequelize.STRING, allowNull: false },
      file_size: { type: Sequelize.INTEGER, allowNull: false },
    })

    // Payments
    await queryInterface.createTable('payments', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      mission_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'missions', key: 'id' }, onDelete: 'CASCADE' },
      payer_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      payee_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'USD' },
      method: { type: Sequelize.ENUM('cash', 'stripe', 'paypal', 'bank_transfer'), allowNull: false },
      platform_fee: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      gateway_fee: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      net_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      status: { type: Sequelize.ENUM('pending', 'confirmed', 'failed', 'refunded'), allowNull: false, defaultValue: 'pending' },
      confirmed_by_payer: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      confirmed_by_payee: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      confirmed_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // Platform Credits
    await queryInterface.createTable('platform_credits', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      agent_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      balance: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'USD' },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // Credit Transactions
    await queryInterface.createTable('credit_transactions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      credit_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'platform_credits', key: 'id' }, onDelete: 'CASCADE' },
      type: { type: Sequelize.ENUM('purchase', 'deduction', 'refund', 'adjustment'), allowNull: false },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      description: { type: Sequelize.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // Invoices
    await queryInterface.createTable('invoices', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      agent_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      period_start: { type: Sequelize.DATE, allowNull: false },
      period_end: { type: Sequelize.DATE, allowNull: false },
      total_fees: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'USD' },
      status: { type: Sequelize.ENUM('draft', 'sent', 'paid'), allowNull: false, defaultValue: 'draft' },
      paid_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // Subscription Plans
    await queryInterface.createTable('subscription_plans', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.ENUM('small_business', 'professional', 'enterprise'), allowNull: false, unique: true },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'USD' },
      interval: { type: Sequelize.ENUM('monthly', 'annual'), allowNull: false, defaultValue: 'monthly' },
      max_seats: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      max_recurrent_missions: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 10 },
      features: { type: Sequelize.JSON, allowNull: false, defaultValue: '{}' },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // Subscriptions
    await queryInterface.createTable('subscriptions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      client_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'client_profiles', key: 'id' }, onDelete: 'CASCADE' },
      plan_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'subscription_plans', key: 'id' }, onDelete: 'RESTRICT' },
      status: { type: Sequelize.ENUM('active', 'past_due', 'cancelled'), allowNull: false, defaultValue: 'active' },
      stripe_subscription_id: { type: Sequelize.STRING, allowNull: true },
      current_period_start: { type: Sequelize.DATE, allowNull: false },
      current_period_end: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // Subscription Invoices
    await queryInterface.createTable('subscription_invoices', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      subscription_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'subscriptions', key: 'id' }, onDelete: 'CASCADE' },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'USD' },
      status: { type: Sequelize.ENUM('pending', 'paid', 'failed'), allowNull: false, defaultValue: 'pending' },
      paid_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // Disputes
    await queryInterface.createTable('disputes', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      mission_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'missions', key: 'id' }, onDelete: 'CASCADE' },
      initiated_by: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      reason: { type: Sequelize.TEXT, allowNull: false },
      status: { type: Sequelize.ENUM('open', 'reconciling', 'resolved', 'escalated'), allowNull: false, defaultValue: 'open' },
      resolution: { type: Sequelize.TEXT, allowNull: true },
      resolved_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // Dispute Messages
    await queryInterface.createTable('dispute_messages', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      dispute_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'disputes', key: 'id' }, onDelete: 'CASCADE' },
      sender_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      content: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // Notifications
    await queryInterface.createTable('notifications', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      type: { type: Sequelize.STRING, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      body: { type: Sequelize.TEXT, allowNull: false },
      data: { type: Sequelize.JSON, allowNull: false, defaultValue: '{}' },
      read_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // Indexes
    await queryInterface.addIndex('agent_profiles', ['user_id'])
    await queryInterface.addIndex('agent_profiles', ['unique_invite_slug'])
    await queryInterface.addIndex('client_profiles', ['user_id'])
    await queryInterface.addIndex('refresh_tokens', ['user_id'])
    await queryInterface.addIndex('refresh_tokens', ['token'])
    await queryInterface.addIndex('password_reset_tokens', ['user_id'])
    await queryInterface.addIndex('email_verification_tokens', ['user_id'])
    await queryInterface.addIndex('missions', ['agent_id'])
    await queryInterface.addIndex('missions', ['client_id'])
    await queryInterface.addIndex('missions', ['status'])
    await queryInterface.addIndex('missions', ['created_at'])
    await queryInterface.addIndex('recurrent_mission_configs', ['mission_id'])
    await queryInterface.addIndex('recurrent_mission_configs', ['next_run_at'])
    await queryInterface.addIndex('recurrent_mission_configs', ['is_active'])
    await queryInterface.addIndex('mission_attachments', ['mission_id'])
    await queryInterface.addIndex('conversations', ['mission_id'])
    await queryInterface.addIndex('messages', ['conversation_id'])
    await queryInterface.addIndex('messages', ['sender_id'])
    await queryInterface.addIndex('message_attachments', ['message_id'])
    await queryInterface.addIndex('payments', ['mission_id'])
    await queryInterface.addIndex('payments', ['payer_id'])
    await queryInterface.addIndex('payments', ['payee_id'])
    await queryInterface.addIndex('payments', ['status'])
    await queryInterface.addIndex('platform_credits', ['agent_id'])
    await queryInterface.addIndex('credit_transactions', ['credit_id'])
    await queryInterface.addIndex('invoices', ['agent_id'])
    await queryInterface.addIndex('invoices', ['status'])
    await queryInterface.addIndex('subscriptions', ['client_id'])
    await queryInterface.addIndex('subscriptions', ['status'])
    await queryInterface.addIndex('subscription_invoices', ['subscription_id'])
    await queryInterface.addIndex('disputes', ['mission_id'])
    await queryInterface.addIndex('disputes', ['initiated_by'])
    await queryInterface.addIndex('disputes', ['status'])
    await queryInterface.addIndex('dispute_messages', ['dispute_id'])
    await queryInterface.addIndex('notifications', ['user_id'])
    await queryInterface.addIndex('notifications', ['read_at'])
  },

  async down(queryInterface) {
    const tables = [
      'notifications',
      'dispute_messages',
      'disputes',
      'subscription_invoices',
      'subscriptions',
      'subscription_plans',
      'invoices',
      'credit_transactions',
      'platform_credits',
      'payments',
      'message_attachments',
      'messages',
      'conversations',
      'mission_attachments',
      'recurrent_mission_configs',
      'missions',
      'email_verification_tokens',
      'password_reset_tokens',
      'refresh_tokens',
      'client_profiles',
      'agent_profiles',
      'users',
    ]

    for (const table of tables) {
      await queryInterface.dropTable(table)
    }
  },
}
