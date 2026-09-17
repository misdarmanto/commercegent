import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'

export interface FaqAttributes extends IBaseModelFields {
  faqId: number
  faqQuestion: string
  faqAnswer: string
}

export type FaqCreationAttributes = Optional<
  FaqAttributes,
  'faqId' | 'createdAt' | 'updatedAt'
>

interface FaqInstance extends Model<FaqAttributes, FaqCreationAttributes>, FaqAttributes {}

export const FaqModel = sequelizeInit.define<FaqInstance>(
  'FaqModel',
  {
    ...BaseModelFields,
    faqId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    faqQuestion: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    faqAnswer: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  },
  {
    timestamps: false,
    tableName: 'faqs',
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)
