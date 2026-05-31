import dotenv from 'dotenv'
import { type Options, Sequelize } from 'sequelize'
import { appConfigs } from './appConfig'
dotenv.config()

const dataBaseConfig = appConfigs.dataBase.development as Options

const sequelizeConfig: Options = {
  ...dataBaseConfig,
  timezone: '+07:00'
}

export const sequelizeInit = new Sequelize(sequelizeConfig)
