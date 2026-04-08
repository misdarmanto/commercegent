/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('carts', {
      ...BaseModelFields,
      cart_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      cart_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      cart_product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      cart_total_item: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    })
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('carts')
  }
}
