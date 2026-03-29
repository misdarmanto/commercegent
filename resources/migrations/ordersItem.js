/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { ZygoteModel } = require('../zygote')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('order_items', {
      ...ZygoteModel,
      order_item_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      order_id: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      product_name_snapshot: {
        type: DataTypes.STRING,
        allowNull: false
      },
      product_price_snapshot: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      product_discount_snapshot: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
      },
      product_sell_price_snapshot: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      total_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      }
    })
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('order_items')
  }
}
