/* eslint-disable @typescript-eslint/indent */
import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'

export interface ChatSessionAttributes extends IBaseModelFields {
  chatSessionId: number
  chatSessionUserId: number
  chatSessionTitle?: string | null
}

type ChatSessionCreationAttributes = Optional<
  ChatSessionAttributes,
  'chatSessionId' | 'createdAt' | 'updatedAt' | 'chatSessionTitle'
>

interface ChatSessionInstance
  extends Model<ChatSessionAttributes, ChatSessionCreationAttributes>,
    ChatSessionAttributes {}

export const ChatSessionModel = sequelizeInit.define<ChatSessionInstance>(
  'ChatSessionModel',
  {
    ...BaseModelFields,
    chatSessionId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    chatSessionUserId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    chatSessionTitle: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    timestamps: false,
    tableName: 'chat_sessions',
    deletedAt: false,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)
