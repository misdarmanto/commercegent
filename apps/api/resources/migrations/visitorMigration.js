/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('visitors', {
      ...BaseModelFields,
      visitor_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      visitor_meta: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('visitors')
  }
}
