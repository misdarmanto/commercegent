import { DataTypes, type Model, type Optional } from 'sequelize'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'
import { ProductModel } from './ProductModel'
import { sequelizeInit } from '../configs/database'
import { ProductVariantModel } from './ProductVariantModel'

export interface CartsAttributes extends IBaseModelFields {
  cartId: number
  cartUserId: number
  cartProductId: number
  cartProductVariantId: number
  cartQuantity: number
}

type CartsCreationAttributes = Optional<
  CartsAttributes,
  'cartId' | 'createdAt' | 'updatedAt'
>

interface CartsInstance
  extends Model<CartsAttributes, CartsCreationAttributes>,
    CartsAttributes {}

export const CartsModel = sequelizeInit.define<CartsInstance>(
  'CartModel',
  {
    ...BaseModelFields,
    cartId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    cartUserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cartProductId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cartProductVariantId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cartQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  },
  {
    timestamps: false,
    tableName: 'carts',
    deletedAt: false,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)

CartsModel.hasOne(ProductModel, {
  sourceKey: 'cartProductId',
  foreignKey: 'productId',
  as: 'product'
})

CartsModel.hasOne(ProductVariantModel, {
  sourceKey: 'cartProductVariantId',
  foreignKey: 'productVariantId',
  as: 'variant'
})
