import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

const isProduction = process.env.NODE_ENV === 'production'

let sequelize: Sequelize

if (isProduction && process.env.DB_DIALECT !== 'sqlite') {
  sequelize = new Sequelize(
    process.env.DB_NAME!,
    process.env.DB_USER!,
    process.env.DB_PASSWORD!,
    {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      dialect: 'postgres',
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
      },
    }
  )
} else {
  const storage = process.env.DB_STORAGE || './dev.sqlite'
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  })
}

export default sequelize
