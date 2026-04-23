/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('product_variants', {
      ...BaseModelFields,
      product_variant_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      product_variant_product_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'products',
          key: 'product_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      product_variant_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      product_variant_image: {
        type: DataTypes.STRING,
        allowNull: true
      },
      product_variant_price: {
        type: DataTypes.STRING,
        allowNull: false
      },
      product_variant_sell_price: {
        type: DataTypes.DECIMAL,
        allowNull: true
      },
      product_variant_discount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      product_variant_total_sale: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      product_variant_stock: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      product_variant_weight: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      }
    })
  },

  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('product_variants')
  }
}
