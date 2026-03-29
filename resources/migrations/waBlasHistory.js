/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { ZygoteModel } = require('../zygote')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('wa_blas_history', {
      ...ZygoteModel,
      wa_blas_history_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      wa_blas_history_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4
      },
      wa_blas_history_user_name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      wa_blas_history_user_phone: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      wa_blas_history_title: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      wa_blas_history_message: {
        type: DataTypes.STRING,
        allowNull: false
      },
      wa_blas_status: {
        type: DataTypes.ENUM('success', 'fail'),
        allowNull: false,
        defaultValue: 'success'
      }
    })
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('wa_blas_history')
  }
}
