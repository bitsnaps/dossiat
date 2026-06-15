'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date()

    await queryInterface.bulkInsert('subscription_plans', [
      {
        name: 'small_business',
        price: 29.0,
        currency: 'USD',
        interval: 'monthly',
        max_seats: 3,
        max_recurrent_missions: 10,
        features: JSON.stringify({
          missions: true,
          messaging: true,
          payments: true,
          recurrent_missions: true,
          csv_import: false,
          priority_support: false,
        }),
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'professional',
        price: 99.0,
        currency: 'USD',
        interval: 'monthly',
        max_seats: 10,
        max_recurrent_missions: -1,
        features: JSON.stringify({
          missions: true,
          messaging: true,
          payments: true,
          recurrent_missions: true,
          csv_import: false,
          priority_support: true,
        }),
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'enterprise',
        price: 499.0,
        currency: 'USD',
        interval: 'monthly',
        max_seats: -1,
        max_recurrent_missions: -1,
        features: JSON.stringify({
          missions: true,
          messaging: true,
          payments: true,
          recurrent_missions: true,
          csv_import: true,
          priority_support: true,
        }),
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ])
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('subscription_plans', null, {})
  },
}
