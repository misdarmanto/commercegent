/* eslint-disable @typescript-eslint/indent */
import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelize } from '.'
import { type ZygoteAttributes, ZygoteModel } from './zygote'
import { CategoryModel } from './categories'

export interface ProductAttributes extends ZygoteAttributes {
  productId: number
  productName: string
  productDescription: string
  productImages: string[]
  productPrice: number
  productDiscount: number
  productSellPrice?: number
  productCategoryId?: string
  productSubCategoryId?: string
  productTotalSale: number
  productCode: string
  productStock: number
  productWeight: number
  productIsHighlight: boolean

  // new
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

export const ProductModel = sequelize.define<ProductInstance>(
  'products',
  {
    ...ZygoteModel,
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
    productImages: {
      type: DataTypes.JSON,
      allowNull: false
    },
    productDescription: {
      type: DataTypes.STRING,
      allowNull: false
    },
    productPrice: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    productDiscount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    productSellPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true
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
    productTotalSale: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    productStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    productWeight: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
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
    ...sequelize,
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
