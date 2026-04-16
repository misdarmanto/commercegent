import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'

export interface SettingAttributes extends IBaseModelFields {
  settingId: number
  whatsappNumber?: string | null
}

type SettingCreationAttributes = Optional<
  SettingAttributes,
  'settingId' | 'createdAt' | 'updatedAt'
>

interface SettingInstance
  extends Model<SettingAttributes, SettingCreationAttributes>,
    SettingAttributes {}

export const SettingModel = sequelizeInit.define<SettingInstance>(
  'SettingModel',
  {
    ...BaseModelFields,
    settingId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    whatsappNumber: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    timestamps: false,
    tableName: 'settings',
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)
