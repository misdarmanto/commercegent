/* eslint-disable @typescript-eslint/indent */
import { DataTypes, type Model, type Optional, UUIDV4 } from 'sequelize'
import { sequelize } from '.'
import { type ZygoteAttributes, ZygoteModel } from './zygote'

export interface CategoryAttributes extends ZygoteAttributes {
  categoryId: number
  categoryReference: string
  categoryName: string
  categoryIcon: string
  categoryType: 'parent' | 'child'
}

// we're telling the Model that 'id' is optional
// when creating an instance of the model (such as using Model.create()).
type CategoryCreationAttributes = Optional<
  CategoryAttributes,
  'categoryId' | 'createdAt' | 'updatedAt'
>

// We need to declare an interface for our model that is basically what our class would be

interface CategoryInstance
  extends Model<CategoryAttributes, CategoryCreationAttributes>,
    CategoryAttributes {}

export const CategoryModel = sequelize.define<CategoryInstance>(
  'category',
  {
    ...ZygoteModel,
    categoryId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    categoryReference: {
      type: DataTypes.STRING,
      allowNull: true
    },
    categoryName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    categoryIcon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    categoryType: {
      type: DataTypes.ENUM('parent', 'child'),
      allowNull: false,
      defaultValue: 'parent'
    }
  },
  {
    ...sequelize,
    timestamps: false,
    tableName: 'categories',
    deletedAt: false,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)
