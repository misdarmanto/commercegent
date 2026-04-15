/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('products', {
      ...BaseModelFields,
      product_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      product_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      product_description: {
        type: DataTypes.STRING,
        allowNull: false
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
