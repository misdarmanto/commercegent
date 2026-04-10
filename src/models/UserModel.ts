/* eslint-disable @typescript-eslint/indent */
import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'

export interface UserAttributes extends IBaseModelFields {
  userId: number
  userName: string
  userPassword: string
  userWhatsAppNumber: string
  userPhoto: string
  userRole: 'user' | 'admin' | 'superAdmin'
  userGender: 'pria' | 'wanita'
  userCoin: number
  userFcmId: string
  userPartnerCode: string
}

// we're telling the Model that 'id' is optional
// when creating an instance of the model (such as using Model.create()).
type UserCreationAttributes = Optional<
  UserAttributes,
  'userId' | 'createdAt' | 'updatedAt'
>

// We need to declare an interface for our model that is basically what our class would be
interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {}

export const UserModel = sequelizeInit.define<UserInstance>(
  'users',
  {
    ...BaseModelFields,
    userId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userPassword: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userWhatsAppNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userPhoto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userRole: {
      type: DataTypes.ENUM('user', 'courier', 'office', 'admin', 'superAdmin'),
      allowNull: false,
      defaultValue: 'user'
    },
    userCoin: {
      type: DataTypes.NUMBER,
      allowNull: true,
      defaultValue: 0
    },
    userFcmId: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    userGender: {
      type: DataTypes.ENUM('pria', 'wanita'),
      allowNull: true,
      defaultValue: null
    },
    userPartnerCode: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  },
  {
    timestamps: false,
    tableName: 'users',
    deletedAt: false,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)
