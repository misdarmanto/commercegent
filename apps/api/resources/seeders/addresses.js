/* eslint-disable @typescript-eslint/space-before-function-paren */
'use strict'
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('addresses', [
      {
        address_user_id: '66aba427-4b2b-437e-b427-65f2b3f1eca2',
        address_user_name: 'Jack',
        address_kontak: '081233339099',
        address_detail:
          'Jl, Hadi Subroto, desa Bandar, kec.Mesuji kec.Batang , Provinsi Jawa Tengah ',
        address_postal_code: '3433',
        address_provinsi: 'Jawa Tengah',
        address_kabupaten: 'Batang',
        address_kecamatan: 'Mesuji',
        address_category: 'admin'
      }
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('addresses', null, {})
  }
}
