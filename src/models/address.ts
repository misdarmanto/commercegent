/* eslint-disable @typescript-eslint/indent */
import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelize } from '.'
import { type ZygoteAttributes, ZygoteModel } from './zygote'

export interface AddressesAttributes extends ZygoteAttributes {
  addressId: number
  addressUserId: number
  addressUserName: string
  addressKontak: string
  addressDetail: string
  addressPostalCode: string
  addressProvinsi: string
  addressKabupaten: string
  addressKecamatan: string
  addressCategory: 'user' | 'admin'
  addressDesa: string
  addressLatitude: string
  addressLongitude: string
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

export const AddressesModel = sequelize.define<AddressesInstance>(
  'addresses',
  {
    ...ZygoteModel,
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
    addressProvinsi: {
      type: DataTypes.STRING,
      allowNull: false
    },
    addressKabupaten: {
      type: DataTypes.STRING,
      allowNull: false
    },
    addressKecamatan: {
      type: DataTypes.STRING,
      allowNull: false
    },
    addressDesa: {
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
    }
  },
  {
    ...sequelize,
    timestamps: false,
    tableName: 'addresses',
    deletedAt: false,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)
