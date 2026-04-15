/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('categories', {
      ...BaseModelFields,
      category_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      category_reference: {
        type: DataTypes.STRING,
        allowNull: true
      },
      category_icon: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      category_name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      category_type: {
        type: DataTypes.ENUM('parent', 'child'),
        allowNull: false,
        defaultValue: 'parent'
      }
    })
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('categories')
  }
}
