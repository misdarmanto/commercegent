/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { ZygoteModel } = require('../zygote')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('transactions', {
      ...ZygoteModel,
      transaction_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      transaction_order_id: {
        type: DataTypes.BIGINT,
        allowNull: false
      },

      transaction_user_id: {
        type: DataTypes.STRING,
        allowNull: false
      },

      transaction_amount: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      transaction_ongkir_price: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      transaction_provider: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'midtrans'
      },

      transaction_payment_type: {
        type: DataTypes.STRING,
        allowNull: true
      },

      transaction_snap_token: {
        type: DataTypes.STRING,
        allowNull: true
      },

      transaction_status: {
        type: DataTypes.ENUM('pending', 'success', 'failed', 'expire', 'cancel'),
        allowNull: false,
        defaultValue: 'pending'
      },

      transaction_raw_response: {
        type: DataTypes.JSON,
        allowNull: true
      }
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('transactions')
  }
}
