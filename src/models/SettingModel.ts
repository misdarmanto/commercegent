import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'

export interface SettingAttributes extends IBaseModelFields {
  settingId: number
  settingType: 'general' | 'wa_blas'
  banner?: string | null
  whatsappNumber?: string | null
  waBlasToken?: string | null
  waBlasServer?: string | null
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
    settingType: {
      type: DataTypes.ENUM('general', 'wa_blas'),
      allowNull: false
    },
    banner: {
      type: DataTypes.JSON,
      allowNull: true
    },
    whatsappNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    waBlasToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    waBlasServer: {
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
