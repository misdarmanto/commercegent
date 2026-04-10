/* eslint-disable @typescript-eslint/indent */
import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'

export interface ProductVariantAttributes extends IBaseModelFields {
  productVariantProductId: number
  productVariantId: number
  productVariantName: string
  productVariantImage?: string
  productVariantPrice: number
  productVariantDiscount?: number
  productVariantSellPrice?: number
  productVariantTotalSale?: number
  productVariantStock?: number
  productVariantWeight?: number
  productVariantColor?: string
  productVariantSize?: string
}

// we're telling the Model that 'id' is optional
// when creating an instance of the model (such as using Model.create()).
type ProductVariantCreationAttributes = Optional<
  ProductVariantAttributes,
  'productVariantId' | 'createdAt' | 'updatedAt'
>

// We need to declare an interface for our model that is basically what our class would be

interface ProductVariantInstance
  extends Model<ProductVariantAttributes, ProductVariantCreationAttributes>,
    ProductVariantAttributes {}

export const ProductVariantModel = sequelizeInit.define<ProductVariantInstance>(
  'ProductVariant',
  {
    ...BaseModelFields,
    productVariantId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    productVariantProductId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'products',
        key: 'productId'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    productVariantName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    productVariantImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    productVariantPrice: {
      type: DataTypes.STRING,
      allowNull: false
    },
    productVariantSellPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    productVariantDiscount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    productVariantTotalSale: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    productVariantStock: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    productVariantWeight: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    productVariantColor: {
      type: DataTypes.STRING,
      allowNull: true
    },
    productVariantSize: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    timestamps: false,
    tableName: 'product_variants',
    deletedAt: false,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)
