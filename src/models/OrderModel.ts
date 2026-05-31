/* eslint-disable @typescript-eslint/indent */
import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'
import { UserModel } from './UserModel'
import { AddressesModel } from './AddressModel'
import { OrderItemsModel } from './OrderItemModel'
/**
 * ORDER HEADER
 * 1 order = many order_items
 */
export interface OrdersAttributes extends IBaseModelFields {
  orderId: number
  orderUserId: string

  orderSubtotal: number
  orderShippingFee: number
  orderGrandTotal: number
  orderTotalItem: number
  orderShippingProvider: 'FRESH' | 'BITESHIP'

  orderCourierCompany: string
  orderCourierType: string

  orderTrackingId?: string
  orderWaybillId?: string
  orderDraftId?: string
  orderPaymentUrl?: string
  orderPaymentToken?: string
  orderReferenceId?: string
  orderStatus: 'waiting' | 'process' | 'draft' | 'delivery' | 'done' | 'cancel'
}

type OrdersCreationAttributes = Optional<
  OrdersAttributes,
  'orderId' | 'createdAt' | 'updatedAt'
>

interface OrdersInstance
  extends Model<OrdersAttributes, OrdersCreationAttributes>,
    OrdersAttributes {}

export const OrdersModel = sequelizeInit.define<OrdersInstance>(
  'OrderModel',
  {
    ...BaseModelFields,
    orderId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    orderUserId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    orderSubtotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    orderShippingFee: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    orderGrandTotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    orderTotalItem: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    orderShippingProvider: {
      type: DataTypes.ENUM('FRESH', 'BITESHIP'),
      allowNull: false,
      defaultValue: 'BITESHIP'
    },
    orderCourierCompany: {
      type: DataTypes.STRING,
      allowNull: true
    },
    orderCourierType: {
      type: DataTypes.STRING,
      allowNull: true
    },

    orderTrackingId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    orderWaybillId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    orderDraftId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    orderPaymentUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    orderPaymentToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    orderReferenceId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    orderStatus: {
      type: DataTypes.ENUM('waiting', 'process', 'draft', 'delivery', 'done', 'cancel'),
      allowNull: false,
      defaultValue: 'waiting'
    }
  },
  {
    tableName: 'orders',
    timestamps: false,
    deletedAt: false,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)

/* ===================== RELATION ===================== */

OrdersModel.belongsTo(UserModel, {
  foreignKey: 'orderUserId',
  targetKey: 'userId',
  as: 'user'
})

OrdersModel.belongsTo(AddressesModel, {
  foreignKey: 'orderUserId',
  targetKey: 'addressUserId',
  as: 'address'
})

OrdersModel.hasMany(OrderItemsModel, {
  as: 'orderItems',
  foreignKey: 'orderItemOrderId',
  sourceKey: 'orderId'
})
