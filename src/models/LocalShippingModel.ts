import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'

export interface LocalShippingAttributes extends IBaseModelFields {
  localShippingId: number
  localShippingCompanyName: string
  localShippingProvinceName: string
  localShippingProvinceId: string
  localShippingPricePerKg: number
}

export type LocalShippingCreationAttributes = Optional<
  LocalShippingAttributes,
  'localShippingId' | 'createdAt' | 'updatedAt'
>

interface LocalShippingInstance
  extends Model<LocalShippingAttributes, LocalShippingCreationAttributes>,
    LocalShippingAttributes {}

export const LocalShippingModel = sequelizeInit.define<LocalShippingInstance>(
  'LocalShippingModel',
  {
    ...BaseModelFields,
    localShippingId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    localShippingCompanyName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    localShippingProvinceName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    localShippingProvinceId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    localShippingPricePerKg: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    timestamps: false,
    tableName: 'local_shippings',
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)
