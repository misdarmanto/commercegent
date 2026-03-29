/* eslint-disable @typescript-eslint/indent */
import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelize } from '.'
import { type ZygoteAttributes, ZygoteModel } from './zygote'
import { OrdersModel } from './orders'
import { UserModel } from './user'

export interface TransactionsAttributes extends ZygoteAttributes {
  transactionId: number
  transactionOrderId: number
  transactionUserId: string

  transactionAmount: number
  transactionOngkirPrice: number

  transactionProvider: 'midtrans'
  transactionPaymentType?: string

  transactionSnapToken?: string
  transactionStatus: 'pending' | 'success' | 'failed' | 'expire' | 'cancel'

  transactionRawResponse?: object
}

// optional field saat create
type TransactionsCreationAttributes = Optional<
  TransactionsAttributes,
  'transactionId' | 'createdAt' | 'updatedAt'
>

interface TransactionsInstance
  extends Model<TransactionsAttributes, TransactionsCreationAttributes>,
    TransactionsAttributes {}

export const TransactionsModel = sequelize.define<TransactionsInstance>(
  'transactions',
  {
    ...ZygoteModel,
    transactionId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    transactionOrderId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    transactionUserId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    transactionAmount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    transactionOngkirPrice: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    transactionProvider: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'midtrans'
    },
    transactionPaymentType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    transactionSnapToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    transactionStatus: {
      type: DataTypes.ENUM('pending', 'success', 'failed', 'expire', 'cancel'),
      allowNull: false,
      defaultValue: 'pending'
    },
    transactionRawResponse: {
      type: DataTypes.JSON,
      allowNull: true
    }
  },
  {
    tableName: 'transactions',
    timestamps: false,
    deletedAt: false,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)

/* ================= RELATIONS ================= */

TransactionsModel.belongsTo(OrdersModel, {
  foreignKey: 'transactionOrderId'
})

TransactionsModel.belongsTo(UserModel, {
  foreignKey: 'transactionUserId'
})
