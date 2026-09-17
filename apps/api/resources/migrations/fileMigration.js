/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('files', {
      ...BaseModelFields,
      file_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      file_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      file_path: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      file_size: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      mime_type: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      uploaded_by: {
        type: DataTypes.STRING(100),
        allowNull: true
      }
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('files')
  }
}
