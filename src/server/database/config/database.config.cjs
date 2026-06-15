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
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
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
}
