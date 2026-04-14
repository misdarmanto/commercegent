/* eslint-disable @typescript-eslint/indent */
import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'

export interface CategoryAttributes extends IBaseModelFields {
  categoryId: number
  categoryReference: string
  categoryName: string
  categoryIcon: string
  categoryType: 'parent' | 'child'
}

// we're telling the Model that 'id' is optional
// when creating an instance of the model (such as using Model.create()).
export type CategoryCreationAttributes = Optional<
  CategoryAttributes,
  'categoryId' | 'createdAt' | 'updatedAt'
>

// We need to declare an interface for our model that is basically what our class would be

interface CategoryInstance
  extends Model<CategoryAttributes, CategoryCreationAttributes>,
    CategoryAttributes {}

export const CategoryModel = sequelizeInit.define<CategoryInstance>(
  'CategoryModel',
  {
    ...BaseModelFields,
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
    timestamps: false,
    tableName: 'categories',
    deletedAt: false,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)
