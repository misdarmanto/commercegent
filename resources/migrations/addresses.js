/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('addresses', {
      ...BaseModelFields,
      address_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      address_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      address_user_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      address_kontak: {
        type: DataTypes.STRING,
        allowNull: false
      },
      address_detail: {
        type: DataTypes.STRING,
        allowNull: false
      },
      address_postal_code: {
        type: DataTypes.STRING,
        allowNull: false
      },
      address_provinsi: {
        type: DataTypes.STRING,
        allowNull: false
      },
      address_kabupaten: {
        type: DataTypes.STRING,
        allowNull: false
      },
      address_kecamatan: {
        type: DataTypes.STRING,
        allowNull: false
      },
      address_desa: {
        type: DataTypes.STRING,
        allowNull: false
      },
      address_category: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user'
      },
      address_latitude: {
        type: DataTypes.STRING,
        allowNull: false
      },
      address_longitude: {
        type: DataTypes.STRING,
        allowNull: false
      }
    })
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('addresses')
  }
}
