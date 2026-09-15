/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('order_items', {
      ...BaseModelFields,
      order_item_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      order_item_order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      order_item_product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      order_item_product_variant_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      order_item_product_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      order_item_product_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      order_item_product_discount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
      },
      order_item_product_sell_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      order_item_product_image: {
        type: DataTypes.STRING,
        allowNull: true
      },
      order_item_product_weight: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      order_item_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      order_item_total_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      }
    })
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('order_items')
  }
}
