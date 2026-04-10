/* eslint-disable @typescript-eslint/indent */
import { DataTypes, type Model, type Optional } from 'sequelize'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'
import { ProductModel } from './ProductModel'
import { sequelizeInit } from '../configs/database'

export interface CartsAttributes extends IBaseModelFields {
  cartId: number
  cartUserId: number
  cartProductId: number
  cartTotalItem: number
}

// we're telling the Model that 'id' is optional
// when creating an instance of the model (such as using Model.create()).
type CartsCreationAttributes = Optional<
  CartsAttributes,
  'cartId' | 'createdAt' | 'updatedAt'
>

// We need to declare an interface for our model that is basically what our class would be

interface CartsInstance
  extends Model<CartsAttributes, CartsCreationAttributes>,
    CartsAttributes {}

export const CartsModel = sequelizeInit.define<CartsInstance>(
  'carts',
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
    cartTotalItem: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
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
  foreignKey: 'productId'
})
