/* eslint-disable @typescript-eslint/indent */
import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'

export interface StatModelAttributes extends IBaseModelFields {
  statId: number
  statTotalVisit: number
}

// we're telling the Model that 'id' is optional
// when creating an instance of the model (such as using Model.create()).
export type StatModelCreationAttributes = Optional<
  StatModelAttributes,
  'statId' | 'createdAt' | 'updatedAt'
>

// We need to declare an interface for our model that is basically what our class would be

interface StatModelInstance
  extends Model<StatModelAttributes, StatModelCreationAttributes>,
    StatModelAttributes {}

export const StatModel = sequelizeInit.define<StatModelInstance>(
  'StatModel',
  {
    ...BaseModelFields,
    statId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    statTotalVisit: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    timestamps: false,
    tableName: 'stats',
    deletedAt: false,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)
