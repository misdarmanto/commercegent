/* eslint-disable @typescript-eslint/indent */
import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'
import { ProductModel } from './ProductModel'

export interface OrderItemsAttributes extends IBaseModelFields {
  orderItemId: number
  orderItemOrderId: number
  orderItemProductId: number
  orderItemProductVariantId: number
  orderItemProductName: string
  orderItemProductPrice: number
  orderItemProductDiscount?: number
  orderItemProductSellPrice?: number
  orderItemProductImage?: string
  orderItemProductWeight: number
  orderItemQuantity: number
  orderItemTotalPrice: number
}

type OrderItemsCreationAttributes = Optional<
  OrderItemsAttributes,
  'orderItemId' | 'createdAt' | 'updatedAt'
>

interface OrderItemsInstance
  extends Model<OrderItemsAttributes, OrderItemsCreationAttributes>,
    OrderItemsAttributes {}

export const OrderItemsModel = sequelizeInit.define<OrderItemsInstance>(
  'OrderItemModel',
  {
    ...BaseModelFields,
    orderItemId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    orderItemOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    orderItemProductId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    orderItemProductVariantId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    orderItemProductName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    orderItemProductPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    orderItemProductDiscount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    orderItemProductSellPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    orderItemProductImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    orderItemProductWeight: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    orderItemQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    orderItemTotalPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    }
  },
  {
    tableName: 'order_items',
    timestamps: false,
    deletedAt: false,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)

/* ===================== RELATION ===================== */

OrderItemsModel.belongsTo(ProductModel, {
  foreignKey: 'orderItemProductId',
  targetKey: 'productId',
  as: 'product'
})
