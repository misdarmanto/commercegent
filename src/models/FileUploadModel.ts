import { DataTypes, Model, Optional } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'

export interface FileUploadAttributes extends IBaseModelFields {
  fileId: number
  fileName: string
  filePath: string
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'
  message?: string | null
}

// we're telling the Model that 'id' is optional
// when creating an instance of the model (such as using Model.create()).
type FileUploadCreationAttributes = Optional<
  FileUploadAttributes,
  'fileId' | 'createdAt' | 'updatedAt'
>

// We need to declare an interface for our model that is basically what our class would be

interface OrdersInstance
  extends Model<FileUploadAttributes, FileUploadCreationAttributes>,
    FileUploadAttributes {}

export const FileUploadModel = sequelizeInit.define<OrdersInstance>(
  'FileUpload',
  {
    ...BaseModelFields,
    fileId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'),
      allowNull: false
    },
    message: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    timestamps: false,
    tableName: 'file_uploads',
    deletedAt: false,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)
