/* eslint-disable @typescript-eslint/indent */
import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'
import { ChatSessionModel } from './ChatSessionModel'

export type ChatMessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessageAttributes extends IBaseModelFields {
  chatMessageId: number
  chatMessageSessionId: number
  chatMessageRole: ChatMessageRole
  chatMessageContent: string
  chatMessageMeta?: Record<string, unknown> | null
}

type ChatMessageCreationAttributes = Optional<
  ChatMessageAttributes,
  'chatMessageId' | 'createdAt' | 'updatedAt' | 'chatMessageMeta'
>

interface ChatMessageInstance
  extends Model<ChatMessageAttributes, ChatMessageCreationAttributes>,
    ChatMessageAttributes {}

export const ChatMessageModel = sequelizeInit.define<ChatMessageInstance>(
  'ChatMessageModel',
  {
    ...BaseModelFields,
    chatMessageId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    chatMessageSessionId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'chat_sessions',
        key: 'chat_session_id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    chatMessageRole: {
      type: DataTypes.ENUM('user', 'assistant', 'system'),
      allowNull: false
    },
    chatMessageContent: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    chatMessageMeta: {
      type: DataTypes.JSON,
      allowNull: true
    }
  },
  {
    timestamps: false,
    tableName: 'chat_messages',
    deletedAt: false,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)

ChatSessionModel.hasMany(ChatMessageModel, {
  as: 'messages',
  foreignKey: 'chatMessageSessionId',
  sourceKey: 'chatSessionId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  hooks: true
})

ChatMessageModel.belongsTo(ChatSessionModel, {
  as: 'session',
  foreignKey: 'chatMessageSessionId',
  targetKey: 'chatSessionId'
})
