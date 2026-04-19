/* eslint-disable @typescript-eslint/indent */
import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'
import { CategoryModel } from './CategoryModel'
import { ProductVariantModel } from './ProductVariantModel'

export interface ProductAttributes extends IBaseModelFields {
  productId: number
  productName: string
  productDescription: string
  productCategoryId?: string
  productSubCategoryId?: string
  productCode: string
  productIsHighlight: boolean
  productBarcode: string
  productUnit?: string
  productIsVisible?: boolean
}

// we're telling the Model that 'id' is optional
// when creating an instance of the model (such as using Model.create()).
type ProductCreationAttributes = Optional<
  ProductAttributes,
  'productId' | 'createdAt' | 'updatedAt'
>

// We need to declare an interface for our model that is basically what our class would be

interface ProductInstance
  extends Model<ProductAttributes, ProductCreationAttributes>,
    ProductAttributes {}

export const ProductModel = sequelizeInit.define<ProductInstance>(
  'ProductModel',
  {
    ...BaseModelFields,
    productId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    productDescription: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    productCategoryId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    productSubCategoryId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    productCode: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    productIsHighlight: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    productIsVisible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    productBarcode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    productUnit: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    timestamps: false,
    tableName: 'products',
    deletedAt: false,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)

ProductModel.hasOne(CategoryModel, {
  sourceKey: 'productCategoryId',
  foreignKey: 'categoryId'
})

ProductModel.hasMany(ProductVariantModel, {
  as: 'variants',
  foreignKey: 'productVariantProductId',
  sourceKey: 'productId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  hooks: true
})
