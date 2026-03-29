/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { ZygoteModel } = require('../zygote')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('users', {
      ...ZygoteModel,
      user_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      user_name: {
        type: DataTypes.STRING(80),
        allowNull: false
      },
      user_password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      user_whats_app_number: {
        type: DataTypes.STRING,
        allowNull: true
      },
      user_photo: {
        type: DataTypes.STRING,
        allowNull: true
      },
      user_role: {
        type: DataTypes.ENUM('user', 'courier', 'office', 'admin', 'superAdmin'),
        allowNull: false,
        defaultValue: 'user'
      },
      user_coin: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      user_fcm_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      user_gender: {
        type: DataTypes.ENUM('pria', 'wanita'),
        allowNull: true,
        defaultValue: null
      },
      user_partner_code: {
        type: DataTypes.STRING(50),
        allowNull: true
      }
    })
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('users')
  }
}
