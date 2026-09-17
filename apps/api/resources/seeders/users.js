/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use strict'
require('dotenv').config()

const crypto = require('crypto')

/** @type {import('sequelize-cli').Migration} */

// Mirrors src/utilities/scurePassword.ts so seeded passwords match whatever
// SECRET_PASSWORD_ENCRYPTION is currently set in the environment.
function hashPassword(password) {
  return crypto
    .createHash('sha1')
    .update(password + process.env.SECRET_PASSWORD_ENCRYPTION)
    .digest('hex')
}

// Dev/test-only accounts. Plaintext passwords below are only ever used to
// compute the seeded hash — never stored.
const seedUsers = [
  {
    user_name: 'super admin',
    plainPassword: 'qwerty',
    user_whats_app_number: '628123456789',
    user_photo: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    user_role: 'superAdmin',
    user_coin: 10000,
    user_gender: 'pria'
  },
  {
    user_name: 'admin',
    plainPassword: 'qwerty',
    user_whats_app_number: '628123456788',
    user_photo: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    user_role: 'admin',
    user_coin: 10000,
    user_gender: 'wanita'
  },
  {
    user_name: 'office',
    plainPassword: 'qwerty',
    user_whats_app_number: '628123456787',
    user_photo: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    user_role: 'office',
    user_coin: 0,
    user_gender: 'pria'
  },
  {
    user_name: 'courier',
    plainPassword: 'qwerty',
    user_whats_app_number: '628123456786',
    user_photo: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    user_role: 'courier',
    user_coin: 0,
    user_gender: 'pria'
  },
  {
    user_name: 'customer',
    plainPassword: 'qwerty',
    user_whats_app_number: '628123456785',
    user_photo: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    user_role: 'user',
    user_coin: 0,
    user_gender: 'wanita'
  }
]

module.exports = {
  async up(queryInterface, Sequelize) {
    // sequelize-cli re-runs every seeder on each `db:seed:all` call with no
    // built-in tracking, so guard against inserting duplicate rows here.
    const [existing] = await queryInterface.sequelize.query(
      'SELECT user_whats_app_number FROM users WHERE user_whats_app_number IN (:numbers)',
      { replacements: { numbers: seedUsers.map((user) => user.user_whats_app_number) } }
    )
    const existingNumbers = new Set(existing.map((row) => row.user_whats_app_number))
    const usersToInsert = seedUsers.filter(
      (user) => !existingNumbers.has(user.user_whats_app_number)
    )

    if (usersToInsert.length === 0) return

    await queryInterface.bulkInsert(
      'users',
      usersToInsert.map(({ plainPassword, ...user }) => ({
        ...user,
        user_password: hashPassword(plainPassword),
        user_partner_code: `AA-${user.user_whats_app_number}`
      }))
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      user_whats_app_number: seedUsers.map((user) => user.user_whats_app_number)
    })
  }
}
