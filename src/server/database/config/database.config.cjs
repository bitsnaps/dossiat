const path = require('path')

require('dotenv').config()

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './dev.sqlite',
    logging: false,
    migrationStorage: 'json',
    migrationStorageTableName: 'SequelizeMeta',
    modelsPath: path.resolve(__dirname, '..', 'models'),
    migrationsPath: path.resolve(__dirname, '..', 'migrations'),
    seedersPath: path.resolve(__dirname, '..', 'seeders'),
    define: {
      timestamps: true,
      underscored: true,
    },
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    migrationStorage: 'json',
    migrationStorageTableName: 'SequelizeMeta',
    modelsPath: path.resolve(__dirname, '..', 'models'),
    migrationsPath: path.resolve(__dirname, '..', 'migrations'),
    seedersPath: path.resolve(__dirname, '..', 'seeders'),
    define: {
      timestamps: true,
      underscored: true,
    },
  },
  production: {
    dialect: 'postgres',
    host: process.env.DB_HOST || process.env.PGHOST,
    port: Number(process.env.DB_PORT || process.env.PGPORT) || 5432,
    database: process.env.DB_NAME || process.env.PGDATABASE,
    username: process.env.DB_USER || process.env.PGUSER,
    password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    migrationStorage: 'sequelize',
    migrationStorageTableName: 'SequelizeMeta',
    modelsPath: path.resolve(__dirname, '..', 'models'),
    migrationsPath: path.resolve(__dirname, '..', 'migrations'),
    seedersPath: path.resolve(__dirname, '..', 'seeders'),
    define: {
      timestamps: true,
      underscored: true,
    },
  },
}
