/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('stats', {
      ...BaseModelFields,
      stat_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      stat_total_visit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      }
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('stats')
  }
}
