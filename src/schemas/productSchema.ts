import { z } from 'zod'

const productImagesField = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((v) => (v == null ? [] : Array.isArray(v) ? v : [v]))

export const createProductSchema = z.object({
  productName: z
    .string({ required_error: 'Nama produk wajib diisi' })
    .min(3, 'Nama produk minimal 3 karakter')
    .max(150, 'Nama produk maksimal 150 karakter'),

  productDescription: z.string().optional(),
  productImages: productImagesField,

  productPrice: z
    .number({ invalid_type_error: 'Harga produk harus berupa angka' })
    .int('Harga produk harus bilangan bulat')
    .min(0, 'Harga produk tidak boleh kurang dari 0'),

  productCategoryId: z
    .number({ invalid_type_error: 'category parent harus berupa angka' })
    .int('category parent harus bilangan bulat')
    .min(0, 'category parent tidak boleh kurang dari 0')
    .default(0),

  productSubCategoryId: z
    .number({ invalid_type_error: 'sub category harus berupa angka' })
    .int('sub category harus bilangan bulat')
    .min(0, 'sub category tidak boleh kurang dari 0')
    .default(0),

  productCode: z.string({ required_error: 'Kode produk wajib diisi' }).min(1).max(50),

  productTotalSale: z
    .number({ invalid_type_error: 'Total penjualan harus berupa angka' })
    .int('Total penjualan harus bilangan bulat')
    .min(0, 'Total penjualan tidak boleh kurang dari 0')
    .default(0),

  productStock: z
    .number({ invalid_type_error: 'Stok produk harus berupa angka' })
    .int('Stok produk harus bilangan bulat')
    .min(0, 'Stok produk tidak boleh kurang dari 0'),

  productDiscount: z
    .number({ invalid_type_error: 'Diskon produk harus berupa angka' })
    .min(0, 'Diskon produk tidak boleh kurang dari 0')
    .max(100, 'Diskon produk tidak boleh lebih dari 100')
    .optional()
    .default(0),

  productWeight: z
    .number({ invalid_type_error: 'Berat produk harus berupa angka' })
    .min(0, 'Berat produk tidak boleh kurang dari 0'),

  productBarcode: z.string().optional(),
  productUnit: z.string().optional(),
  productIsVisible: z.boolean().optional(),

  productSellPrice: z.number().optional()
})

export const updateProductSchema = z
  .object({
    productId: z.number().int().positive(),
    productName: z.string().trim().min(3).max(255).optional(),
    productDescription: z.string().optional(),
    productImages: z
      .union([z.array(z.string()), z.string()])
      .optional()
      .default([])
      .transform((v) => (v == null ? [] : Array.isArray(v) ? v : [v])),

    productPrice: z.number().optional(),
    productDiscount: z.number().min(0).max(100).optional(),
    productCategoryId: z.number().optional(),
    productSubCategoryId: z.number().optional(),
    productTotalSale: z.number().int().min(0).optional(),
    productCode: z.string().trim().optional(),
    productStock: z.number().int().min(0).optional(),
    productWeight: z.number().positive().optional(),

    productBarcode: z.string().optional(),
    productUnit: z.string().optional(),
    productIsVisible: z.boolean().optional(),

    productSellPrice: z.number().optional()
  })
  .strict()
