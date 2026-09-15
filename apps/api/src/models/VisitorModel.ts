/* eslint-disable @typescript-eslint/indent */
import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'

export interface VisitorModelAttributes extends IBaseModelFields {
  visitorId: number
  visitorMeta: string
}

// we're telling the Model that 'id' is optional
// when creating an instance of the model (such as using Model.create()).
export type VisitorModelCreationAttributes = Optional<
  VisitorModelAttributes,
  'visitorId' | 'createdAt' | 'updatedAt'
>

// We need to declare an interface for our model that is basically what our class would be

interface VisitorModelInstance
  extends Model<VisitorModelAttributes, VisitorModelCreationAttributes>,
    VisitorModelAttributes {}

export const VisitorModel = sequelizeInit.define<VisitorModelInstance>(
  'VisitorModel',
  {
    ...BaseModelFields,
    visitorId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    visitorMeta: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    timestamps: false,
    tableName: 'visitors',
    deletedAt: false,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)
