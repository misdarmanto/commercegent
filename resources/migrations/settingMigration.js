/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('settings', {
      ...BaseModelFields,
      setting_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      setting_type: {
        type: DataTypes.ENUM('general', 'wa_blas'),
        allowNull: false
      },
      banner: {
        type: DataTypes.JSON,
        allowNull: true
      },
      whatsapp_number: {
        type: DataTypes.STRING,
        allowNull: true
      },
      wa_blas_token: {
        type: DataTypes.STRING,
        allowNull: true
      },
      wa_blas_server: {
        type: DataTypes.STRING,
        allowNull: true
      }
    })
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('settings')
  }
}
