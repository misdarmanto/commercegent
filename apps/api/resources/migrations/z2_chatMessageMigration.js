/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('chat_messages', {
      ...BaseModelFields,
      chat_message_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      chat_message_session_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'chat_sessions',
          key: 'chat_session_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      chat_message_role: {
        type: DataTypes.ENUM('user', 'assistant', 'system'),
        allowNull: false
      },
      chat_message_content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      chat_message_meta: {
        type: DataTypes.JSON,
        allowNull: true
      }
    })
  },

  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('chat_messages')
  }
}
