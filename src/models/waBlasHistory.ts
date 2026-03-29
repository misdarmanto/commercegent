/* eslint-disable @typescript-eslint/indent */
import moment from 'moment'
import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelize } from '.'
import { type ZygoteAttributes, ZygoteModel } from './zygote'

export interface WaBlasHistoryAttributes extends ZygoteAttributes {
  waBlasHistoryId: number
  waBlasHistoryUserId: string
  waBlasHistoryUserName: string
  waBlasHistoryUserPhone: string
  waBlasHistoryTitle: string
  waBlasHistoryMessage: string
  waBlasStatus: 'success' | 'fail'
}

// we're telling the Model that 'id' is optional
// when creating an instance of the model (such as using Model.create()).
type WaBlasHistoryCreationAttributes = Optional<
  WaBlasHistoryAttributes,
  'waBlasHistoryId' | 'createdAt' | 'updatedAt'
>
// We need to declare an interface for our model that is basically what our class would be
interface WaBlasHistoryInstance
  extends Model<WaBlasHistoryAttributes, WaBlasHistoryCreationAttributes>,
    WaBlasHistoryAttributes {}

export const WaBlasHistoryModel = sequelize.define<WaBlasHistoryInstance>(
  'wa_blas_history',
  {
    ...ZygoteModel,
    waBlasHistoryId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    waBlasHistoryUserId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    waBlasHistoryUserName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    waBlasHistoryUserPhone: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    waBlasHistoryTitle: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    waBlasHistoryMessage: {
      type: DataTypes.STRING,
      allowNull: false
    },
    waBlasStatus: {
      type: DataTypes.ENUM('success', 'fail'),
      allowNull: false,
      defaultValue: 'success'
    }
  },
  {
    ...sequelize,
    timestamps: false,
    tableName: 'wa_blas_history',
    deletedAt: false,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB',
    hooks: {
      beforeCreate: (record, options) => {
        const now = moment().add(7, 'hours').format('YYYY-MM-DD HH:mm:ss')
        record.createdAt = now
        record.updatedAt = null
      },
      beforeUpdate: (record, options) => {
        const now = moment().add(7, 'hours').format('YYYY-MM-DD HH:mm:ss')
        record.updatedAt = now
      }
    }
  }
)
