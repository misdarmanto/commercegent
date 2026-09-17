import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, type IBaseModelFields } from '../interfaces/baseModelFields'

export interface FileAttributes extends IBaseModelFields {
  fileId: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  uploadedBy?: string | null
}

type FileCreationAttributes = Optional<FileAttributes, 'fileId' | 'createdAt' | 'updatedAt'>

interface FileInstance extends Model<FileAttributes, FileCreationAttributes>, FileAttributes {}

export const FileModel = sequelizeInit.define<FileInstance>(
  'FileModel',
  {
    ...BaseModelFields,
    fileId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uploadedBy: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    timestamps: true,
    tableName: 'files',
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)
