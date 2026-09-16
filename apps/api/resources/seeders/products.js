/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use strict'

/** @type {import('sequelize-cli').Migration} */

// Each product belongs to one of the parent categories seeded in
// categories.js (matched here by name) and ships with 1-2 variants.
const seedProducts = [
  {
    category_name: 'Sayuran',
    product_name: 'Bayam Segar',
    product_description: 'Bayam hijau segar, dipetik langsung dari kebun mitra.',
    product_code: 'SYR-001',
    product_unit: 'ikat',
    variants: [{ name: '1 Ikat (250g)', price: 5000, sellPrice: 4500, stock: 50, weight: 250 }]
  },
  {
    category_name: 'Sayuran',
    product_name: 'Wortel',
    product_description: 'Wortel segar kaya vitamin A, cocok untuk sup dan jus.',
    product_code: 'SYR-002',
    product_unit: 'kg',
    variants: [
      { name: '500g', price: 8000, sellPrice: 7500, stock: 40, weight: 500 },
      { name: '1kg', price: 15000, sellPrice: 14000, stock: 30, weight: 1000 }
    ]
  },
  {
    category_name: 'Sayuran',
    product_name: 'Brokoli',
    product_description: 'Brokoli hijau renyah, tinggi serat dan vitamin C.',
    product_code: 'SYR-003',
    product_unit: 'pcs',
    variants: [{ name: '1 Pack (300g)', price: 12000, sellPrice: 11000, stock: 25, weight: 300 }]
  },
  {
    category_name: 'Buah',
    product_name: 'Apel Fuji',
    product_description: 'Apel fuji manis dan renyah, import quality.',
    product_code: 'BUH-001',
    product_unit: 'kg',
    variants: [
      { name: '500g', price: 18000, sellPrice: 16500, stock: 35, weight: 500 },
      { name: '1kg', price: 35000, sellPrice: 32000, stock: 20, weight: 1000 }
    ]
  },
  {
    category_name: 'Buah',
    product_name: 'Pisang Cavendish',
    product_description: 'Pisang cavendish matang pohon, manis alami.',
    product_code: 'BUH-002',
    product_unit: 'sisir',
    variants: [{ name: '1 Sisir', price: 15000, sellPrice: 13500, stock: 40, weight: 1200 }]
  },
  {
    category_name: 'Buah',
    product_name: 'Jeruk Sunkist',
    product_description: 'Jeruk sunkist segar dan berair, kaya vitamin C.',
    product_code: 'BUH-003',
    product_unit: 'kg',
    variants: [{ name: '1kg', price: 28000, sellPrice: 25000, stock: 30, weight: 1000 }]
  },
  {
    category_name: 'Daging & Ikan',
    product_name: 'Daging Sapi Segar',
    product_description: 'Daging sapi segar pilihan, potongan has dalam.',
    product_code: 'DGI-001',
    product_unit: 'kg',
    variants: [{ name: '500g', price: 65000, sellPrice: 62000, stock: 20, weight: 500 }]
  },
  {
    category_name: 'Daging & Ikan',
    product_name: 'Ayam Fillet',
    product_description: 'Fillet dada ayam tanpa tulang, siap olah.',
    product_code: 'DGI-002',
    product_unit: 'kg',
    variants: [{ name: '500g', price: 24000, sellPrice: 22000, stock: 35, weight: 500 }]
  },
  {
    category_name: 'Daging & Ikan',
    product_name: 'Ikan Salmon',
    product_description: 'Salmon segar import, tinggi omega-3.',
    product_code: 'DGI-003',
    product_unit: 'pack',
    variants: [{ name: '300g', price: 75000, sellPrice: 69000, stock: 15, weight: 300 }]
  },
  {
    category_name: 'Bumbu Dapur',
    product_name: 'Bawang Merah',
    product_description: 'Bawang merah lokal kualitas super.',
    product_code: 'BMB-001',
    product_unit: 'kg',
    variants: [{ name: '250g', price: 9000, sellPrice: 8500, stock: 50, weight: 250 }]
  },
  {
    category_name: 'Bumbu Dapur',
    product_name: 'Bawang Putih',
    product_description: 'Bawang putih kating, aroma kuat dan tahan lama.',
    product_code: 'BMB-002',
    product_unit: 'kg',
    variants: [{ name: '250g', price: 10000, sellPrice: 9500, stock: 50, weight: 250 }]
  },
  {
    category_name: 'Bumbu Dapur',
    product_name: 'Cabai Merah Keriting',
    product_description: 'Cabai merah keriting segar, pedas mantap.',
    product_code: 'BMB-003',
    product_unit: 'kg',
    variants: [{ name: '250g', price: 12000, sellPrice: 11000, stock: 45, weight: 250 }]
  },
  {
    category_name: 'Minuman',
    product_name: 'Air Mineral',
    product_description: 'Air mineral dalam kemasan botol 600ml.',
    product_code: 'MNM-001',
    product_unit: 'botol',
    variants: [{ name: '600ml', price: 4000, sellPrice: 3500, stock: 100, weight: 600 }]
  },
  {
    category_name: 'Minuman',
    product_name: 'Susu UHT Full Cream',
    product_description: 'Susu UHT full cream kemasan 1 liter.',
    product_code: 'MNM-002',
    product_unit: 'liter',
    variants: [{ name: '1 Liter', price: 20000, sellPrice: 18500, stock: 60, weight: 1000 }]
  },
  {
    category_name: 'Minuman',
    product_name: 'Jus Jeruk Segar',
    product_description: 'Jus jeruk segar tanpa pengawet, kemasan 500ml.',
    product_code: 'MNM-003',
    product_unit: 'botol',
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
