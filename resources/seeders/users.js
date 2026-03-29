/* eslint-disable @typescript-eslint/space-before-function-paren */
'use strict'
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        user_name: 'super admin',
        user_password: 'cf7c906bfbb48e72288fc016bac0e6ed58b0dc2a',
        user_whats_app_number: '628123456789',
        user_photo: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        user_role: 'superAdmin',
        user_coin: 10000,
        user_gender: 'pria',
        user_partner_code: 'AA-628123456789'
      }
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {})
  }
}
