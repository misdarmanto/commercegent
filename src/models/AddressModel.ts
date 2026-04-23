/* eslint-disable @typescript-eslint/indent */
import { DataTypes, type Model, type Optional } from 'sequelize'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'
import { sequelizeInit } from '../configs/database'

export interface AddressesAttributes extends IBaseModelFields {
  addressId: number
  addressUserId: number
  addressUserName: string
  addressKontak: string
  addressDetail: string
  addressPostalCode: string
  addressProvinsiId: string
  addressProvinsiName: string
  addressKabupatenId: string
  addressKabupatenName: string
  addressKecamatanId: string
  addressKecamatanName: string
  addressDesaId: string
  addressDesaName: string
  addressCategory: 'user' | 'admin'
  addressLatitude: string
  addressLongitude: string
  addressType: 'main' | 'secondary'
}

// we're telling the Model that 'id' is optional
// when creating an instance of the model (such as using Model.create()).
type AddressesCreationAttributes = Optional<
  AddressesAttributes,
  'addressId' | 'createdAt' | 'updatedAt'
>

// We need to declare an interface for our model that is basically what our class would be

interface AddressesInstance
  extends Model<AddressesAttributes, AddressesCreationAttributes>,
    AddressesAttributes {}

export const AddressesModel = sequelizeInit.define<AddressesInstance>(
  'AddressModel',
  {
    ...BaseModelFields,
    addressId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    addressUserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    addressUserName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    addressKontak: {
      type: DataTypes.STRING,
      allowNull: false
    },
    addressDetail: {
      type: DataTypes.STRING,
      allowNull: false
    },
    addressPostalCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    addressProvinsiId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    addressProvinsiName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    addressKabupatenId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    addressKabupatenName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    addressKecamatanId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    addressKecamatanName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    addressDesaId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    addressDesaName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    addressCategory: {
      type: DataTypes.ENUM('user', 'admin'),
      allowNull: false,
      defaultValue: 'user'
    },
    addressLatitude: {
      type: DataTypes.STRING,
      allowNull: false
    },
    addressLongitude: {
      type: DataTypes.STRING,
      allowNull: false
    },
    addressType: {
      type: DataTypes.ENUM('main', 'secondary'),
      allowNull: false,
      defaultValue: 'secondary'
    }
  },
  {
    timestamps: false,
    tableName: 'addresses',
    deletedAt: false,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)
