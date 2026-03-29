import { type Options, Sequelize } from 'sequelize'
import { appConfigs } from '../configs/appConfig'

const dataBaseConfig: Options | any = appConfigs.dataBase.development

export const sequelize = new Sequelize(dataBaseConfig)
