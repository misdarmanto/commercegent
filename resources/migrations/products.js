/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { ZygoteModel } = require('../zygote')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('products', {
      ...ZygoteModel,
      product_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      product_name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      product_images: {
        type: DataTypes.JSON,
        allowNull: false
      },
      product_description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      product_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      product_discount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      product_sell_price: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      product_category_id: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      product_sub_category_id: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      product_code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      product_total_sale: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      product_stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      product_weight: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      product_is_highlight: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      product_is_visible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      product_barcode: {
        type: DataTypes.STRING,
        allowNull: true
      },
      product_unit: {
        type: DataTypes.STRING,
        allowNull: true
      }
    })
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('products')
  }
}
