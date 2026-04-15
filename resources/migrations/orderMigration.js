/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('orders', {
      ...BaseModelFields,
      order_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      order_user_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      order_subtotal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      order_shipping_fee: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      order_grand_total: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      order_total_item: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      order_courier_company: {
        type: DataTypes.STRING,
        allowNull: true
      },
      order_courier_type: {
        type: DataTypes.STRING,
        allowNull: true
      },

      order_tracking_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      order_waybill_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      order_draft_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      order_payment_url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      order_payment_token: {
        type: DataTypes.STRING,
        allowNull: true
      },
      order_reference_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      order_status: {
        type: DataTypes.ENUM('waiting', 'process', 'draft', 'delivery', 'done', 'cancel'),
        allowNull: false,
        defaultValue: 'waiting'
      }
    })
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('orders')
  }
}
