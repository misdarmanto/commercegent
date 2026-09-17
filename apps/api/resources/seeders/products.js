/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use strict'

/** @type {import('sequelize-cli').Migration} */

// Each product belongs to one of the parent categories seeded in
// categories.js (matched here by name) and ships with 1-2 variants.
const seedProducts = [
  {
    category_name: 'Vegetables',
    product_name: 'Fresh Spinach',
    product_description: 'Fresh green spinach, picked straight from partner farms.',
    product_code: 'SYR-001',
    product_unit: 'bunch',
    variants: [{ name: '1 Bunch (250g)', price: 5000, sellPrice: 4500, stock: 50, weight: 250 }]
  },
  {
    category_name: 'Vegetables',
    product_name: 'Carrot',
    product_description: 'Fresh carrots rich in vitamin A, great for soups and juices.',
    product_code: 'SYR-002',
    product_unit: 'kg',
    variants: [
      { name: '500g', price: 8000, sellPrice: 7500, stock: 40, weight: 500 },
      { name: '1kg', price: 15000, sellPrice: 14000, stock: 30, weight: 1000 }
    ]
  },
  {
    category_name: 'Vegetables',
    product_name: 'Broccoli',
    product_description: 'Crisp green broccoli, high in fiber and vitamin C.',
    product_code: 'SYR-003',
    product_unit: 'pcs',
    variants: [{ name: '1 Pack (300g)', price: 12000, sellPrice: 11000, stock: 25, weight: 300 }]
  },
  {
    category_name: 'Fruits',
    product_name: 'Fuji Apple',
    product_description: 'Sweet and crisp Fuji apples, import quality.',
    product_code: 'BUH-001',
    product_unit: 'kg',
    variants: [
      { name: '500g', price: 18000, sellPrice: 16500, stock: 35, weight: 500 },
      { name: '1kg', price: 35000, sellPrice: 32000, stock: 20, weight: 1000 }
    ]
  },
  {
    category_name: 'Fruits',
    product_name: 'Cavendish Banana',
    product_description: 'Tree-ripened Cavendish bananas, naturally sweet.',
    product_code: 'BUH-002',
    product_unit: 'bunch',
    variants: [{ name: '1 Bunch', price: 15000, sellPrice: 13500, stock: 40, weight: 1200 }]
  },
  {
    category_name: 'Fruits',
    product_name: 'Sunkist Orange',
    product_description: 'Fresh and juicy Sunkist oranges, rich in vitamin C.',
    product_code: 'BUH-003',
    product_unit: 'kg',
    variants: [{ name: '1kg', price: 28000, sellPrice: 25000, stock: 30, weight: 1000 }]
  },
  {
    category_name: 'Meat & Fish',
    product_name: 'Fresh Beef',
    product_description: 'Premium fresh beef, tenderloin cut.',
    product_code: 'DGI-001',
    product_unit: 'kg',
    variants: [{ name: '500g', price: 65000, sellPrice: 62000, stock: 20, weight: 500 }]
  },
  {
    category_name: 'Meat & Fish',
    product_name: 'Chicken Fillet',
    product_description: 'Boneless chicken breast fillet, ready to cook.',
    product_code: 'DGI-002',
    product_unit: 'kg',
    variants: [{ name: '500g', price: 24000, sellPrice: 22000, stock: 35, weight: 500 }]
  },
  {
    category_name: 'Meat & Fish',
    product_name: 'Salmon',
    product_description: 'Imported fresh salmon, high in omega-3.',
    product_code: 'DGI-003',
    product_unit: 'pack',
    variants: [{ name: '300g', price: 75000, sellPrice: 69000, stock: 15, weight: 300 }]
  },
  {
    category_name: 'Cooking Spices',
    product_name: 'Shallot',
    product_description: 'Premium quality local shallots.',
    product_code: 'BMB-001',
    product_unit: 'kg',
    variants: [{ name: '250g', price: 9000, sellPrice: 8500, stock: 50, weight: 250 }]
  },
  {
    category_name: 'Cooking Spices',
    product_name: 'Garlic',
    product_description: 'Kating garlic, strong aroma and long shelf life.',
    product_code: 'BMB-002',
    product_unit: 'kg',
    variants: [{ name: '250g', price: 10000, sellPrice: 9500, stock: 50, weight: 250 }]
  },
  {
    category_name: 'Cooking Spices',
    product_name: 'Curly Red Chili',
    product_description: 'Fresh curly red chilies, packs a solid kick.',
    product_code: 'BMB-003',
    product_unit: 'kg',
    variants: [{ name: '250g', price: 12000, sellPrice: 11000, stock: 45, weight: 250 }]
  },
  {
    category_name: 'Beverages',
    product_name: 'Mineral Water',
    product_description: 'Bottled mineral water, 600ml.',
    product_code: 'MNM-001',
    product_unit: 'bottle',
    variants: [{ name: '600ml', price: 4000, sellPrice: 3500, stock: 100, weight: 600 }]
  },
  {
    category_name: 'Beverages',
    product_name: 'Full Cream UHT Milk',
    product_description: 'Full cream UHT milk, 1 liter carton.',
    product_code: 'MNM-002',
    product_unit: 'liter',
    variants: [{ name: '1 Liter', price: 20000, sellPrice: 18500, stock: 60, weight: 1000 }]
  },
  {
    category_name: 'Beverages',
    product_name: 'Fresh Orange Juice',
    product_description: 'Fresh orange juice with no preservatives, 500ml bottle.',
    product_code: 'MNM-003',
    product_unit: 'bottle',
    variants: [{ name: '500ml', price: 15000, sellPrice: 13500, stock: 40, weight: 500 }]
  }
]

module.exports = {
  async up(queryInterface, Sequelize) {
    // sequelize-cli re-runs every seeder on each `db:seed:all` call with no
    // built-in tracking, so guard against inserting duplicate rows here.
    const [existingProducts] = await queryInterface.sequelize.query(
      'SELECT product_code FROM products WHERE product_code IN (:codes)',
      { replacements: { codes: seedProducts.map((product) => product.product_code) } }
    )
    const existingCodes = new Set(existingProducts.map((row) => row.product_code))
    const productsToInsert = seedProducts.filter(
      (product) => !existingCodes.has(product.product_code)
    )

    if (productsToInsert.length === 0) return

    const [categories] = await queryInterface.sequelize.query(
      'SELECT category_id, category_name FROM categories WHERE category_name IN (:names)',
      {
        replacements: {
          names: [...new Set(productsToInsert.map((product) => product.category_name))]
        }
      }
    )
    const categoryIdByName = new Map(
      categories.map((category) => [category.category_name, category.category_id])
    )

    await queryInterface.bulkInsert(
      'products',
      productsToInsert.map((product) => ({
        product_name: product.product_name,
        product_description: product.product_description,
        product_category_id: String(categoryIdByName.get(product.category_name) ?? ''),
        product_sub_category_id: null,
        product_code: product.product_code,
        product_is_highlight: true,
        product_is_visible: true,
        product_barcode: null,
        product_unit: product.product_unit
      }))
    )

    const [insertedProducts] = await queryInterface.sequelize.query(
      'SELECT product_id, product_code FROM products WHERE product_code IN (:codes)',
      { replacements: { codes: productsToInsert.map((product) => product.product_code) } }
    )
    const productIdByCode = new Map(
      insertedProducts.map((row) => [row.product_code, row.product_id])
    )

    const variantRows = productsToInsert.flatMap((product) => {
      const productId = productIdByCode.get(product.product_code)
      const imageSeed = product.product_code.toLowerCase()

      return product.variants.map((variant) => ({
        product_variant_product_id: productId,
        product_variant_name: variant.name,
        product_variant_image: `https://picsum.photos/seed/${imageSeed}/600/600`,
        product_variant_price: String(variant.price),
        product_variant_sell_price: variant.sellPrice,
        product_variant_discount: variant.price > variant.sellPrice
          ? Math.round(((variant.price - variant.sellPrice) / variant.price) * 100)
          : 0,
        product_variant_total_sale: 0,
        product_variant_stock: variant.stock,
        product_variant_weight: variant.weight
      }))
    })

    if (variantRows.length > 0) {
      await queryInterface.bulkInsert('product_variants', variantRows)
    }
  },

  async down(queryInterface, Sequelize) {
    const [products] = await queryInterface.sequelize.query(
      'SELECT product_id FROM products WHERE product_code IN (:codes)',
      { replacements: { codes: seedProducts.map((product) => product.product_code) } }
    )
    const productIds = products.map((row) => row.product_id)

    if (productIds.length > 0) {
      await queryInterface.bulkDelete('product_variants', {
        product_variant_product_id: productIds
      })
    }

    await queryInterface.bulkDelete('products', {
      product_code: seedProducts.map((product) => product.product_code)
    })
  }
}
