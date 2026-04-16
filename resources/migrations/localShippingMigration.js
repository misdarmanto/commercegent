/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('local_shippings', {
      ...BaseModelFields,
      local_shipping_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      local_shipping_company_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      local_shipping_province_id: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      local_shipping_province_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      local_shipping_price_per_kg: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('local_shippings')
  }
}
