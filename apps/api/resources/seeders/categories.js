/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use strict'

/** @type {import('sequelize-cli').Migration} */

const seedCategories = [
  {
    category_name: 'Vegetables',
    category_type: 'parent',
    category_icon: 'https://cdn-icons-png.flaticon.com/512/2909/2909808.png'
  },
  {
    category_name: 'Fruits',
    category_type: 'parent',
    category_icon: 'https://cdn-icons-png.flaticon.com/512/3194/3194591.png'
  },
  {
    category_name: 'Meat & Fish',
    category_type: 'parent',
    category_icon: 'https://cdn-icons-png.flaticon.com/512/2153/2153788.png'
  },
  {
    category_name: 'Cooking Spices',
    category_type: 'parent',
    category_icon: 'https://cdn-icons-png.flaticon.com/512/2515/2515183.png'
  },
  {
    category_name: 'Beverages',
    category_type: 'parent',
    category_icon: 'https://cdn-icons-png.flaticon.com/512/2405/2405479.png'
  }
]

module.exports = {
  async up(queryInterface, Sequelize) {
    // sequelize-cli re-runs every seeder on each `db:seed:all` call with no
    // built-in tracking, so guard against inserting duplicate rows here.
    const [existing] = await queryInterface.sequelize.query(
      'SELECT category_name FROM categories WHERE category_name IN (:names)',
      { replacements: { names: seedCategories.map((category) => category.category_name) } }
    )
    const existingNames = new Set(existing.map((row) => row.category_name))
    const categoriesToInsert = seedCategories.filter(
      (category) => !existingNames.has(category.category_name)
    )

    if (categoriesToInsert.length === 0) return

    await queryInterface.bulkInsert(
      'categories',
      categoriesToInsert.map((category) => ({ ...category, category_reference: '' }))
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', {
      category_name: seedCategories.map((category) => category.category_name)
    })
  }
}
