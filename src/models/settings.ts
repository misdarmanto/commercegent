import moment from 'moment'
import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelize } from '.'
import { type ZygoteAttributes, ZygoteModel } from './zygote'

export interface SettingAttributes extends ZygoteAttributes {
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

export const SettingModel = sequelize.define<SettingInstance>(
  'settings',
  {
    ...ZygoteModel,
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
    ...sequelize,
    timestamps: false,
    tableName: 'settings',
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB',
    hooks: {
      beforeCreate: (record) => {
        const now = moment().add(7, 'hours').format('YYYY-MM-DD HH:mm:ss')
        record.createdAt = now
        record.updatedAt = null
      },
      beforeUpdate: (record) => {
        const now = moment().add(7, 'hours').format('YYYY-MM-DD HH:mm:ss')
        record.updatedAt = now
      }
    }
  }
)
