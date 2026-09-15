import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'

export interface BannerAttributes extends IBaseModelFields {
  bannerId: number
  bannerImage: string
  bannerOrder: number
}

export type BannerCreationAttributes = Optional<
  BannerAttributes,
  'bannerId' | 'createdAt' | 'updatedAt'
>

interface BannerInstance
  extends Model<BannerAttributes, BannerCreationAttributes>,
    BannerAttributes {}

export const BannerModel = sequelizeInit.define<BannerInstance>(
  'BannerModel',
  {
    ...BaseModelFields,
    bannerId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    bannerImage: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bannerOrder: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    timestamps: false,
    tableName: 'banners',
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)
