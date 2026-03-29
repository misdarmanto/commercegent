/* eslint-disable @typescript-eslint/indent */
import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelize } from '.'
import { ZygoteModel, type ZygoteAttributes } from './zygote'
import { ProductModel } from './products'

/**
 * ORDER ITEMS
 * many items belong to one order
 */
export interface OrderItemsAttributes extends ZygoteAttributes {
  orderItemId: number
  orderId: number
  productId: number
  productNameSnapshot: string
  productPriceSnapshot: number
  productDiscountSnapshot?: number
  productSellPriceSnapshot?: number
  quantity: number
  totalPrice: number
}

type OrderItemsCreationAttributes = Optional<
  OrderItemsAttributes,
  'orderItemId' | 'createdAt' | 'updatedAt'
>

interface OrderItemsInstance
  extends Model<OrderItemsAttributes, OrderItemsCreationAttributes>,
    OrderItemsAttributes {}

export const OrderItemsModel = sequelize.define<OrderItemsInstance>(
  'order_items',
  {
    ...ZygoteModel,

    orderItemId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },

    orderId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },

    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    productNameSnapshot: {
      type: DataTypes.STRING,
      allowNull: false
    },

    productPriceSnapshot: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },

    productDiscountSnapshot: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },

    productSellPriceSnapshot: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    totalPrice: {
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
  foreignKey: 'productId',
  targetKey: 'productId'
})
