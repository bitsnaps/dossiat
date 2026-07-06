'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Make agent_id nullable to support client-initiated missions
    await queryInterface.changeColumn('missions', 'agent_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    })

    // Add 'open' to the status ENUM
    // Postgres: ALTER TYPE ... ADD VALUE
    // SQLite: ENUM is stored as TEXT, so no action needed for the column itself
    const dialect = queryInterface.sequelize.getDialect()
    if (dialect === 'postgres') {
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_missions_status" ADD VALUE IF NOT EXISTS 'open'`
      )
    }
    // For SQLite, the ENUM is a CHECK constraint on TEXT, so we update the model sync to handle it.

    // Add proposed_amount column
    await queryInterface.addColumn('missions', 'proposed_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    })

    // Add proposed_by column
    await queryInterface.addColumn('missions', 'proposed_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
    })

    // Add index for open missions discovery
    await queryInterface.addIndex('missions', ['status'])
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('missions', ['status'])
    await queryInterface.removeColumn('missions', 'proposed_by')
    await queryInterface.removeColumn('missions', 'proposed_amount')

    // Postgres: cannot remove an ENUM value, but the column type stays
    // Revert agent_id back to NOT NULL (careful: existing open missions would break)
    await queryInterface.changeColumn('missions', 'agent_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    })
  },
}
