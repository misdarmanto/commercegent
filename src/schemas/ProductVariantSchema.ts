import { z } from 'zod'

export const createProductVariantSchema = z.object({
  productVariantProductId: z.number().int().positive().optional(),

  productVariantName: z
    .string({ required_error: 'Nama varian produk wajib diisi' })
    .min(3, 'Nama varian produk minimal 3 karakter')
    .max(150, 'Nama varian produk maksimal 150 karakter'),

  productVariantImage: z.string().optional(),

  productVariantPrice: z
    .number({ invalid_type_error: 'Harga varian produk harus berupa angka' })
    .min(0, 'Harga varian produk tidak boleh kurang dari 0'),

  productVariantSellPrice: z
    .number({ invalid_type_error: 'Harga jual varian produk harus berupa angka' })
    .int('Harga jual varian produk harus bilangan bulat')
    .min(0, 'Harga jual varian produk tidak boleh kurang dari 0'),

  productVariantStock: z
    .number({ invalid_type_error: 'Stok produk harus berupa angka' })
    .int('Stok produk harus bilangan bulat')
    .min(0, 'Stok produk tidak boleh kurang dari 0'),

  productVariantDiscount: z
    .number({ invalid_type_error: 'Diskon produk harus berupa angka' })
    .min(0, 'Diskon produk tidak boleh kurang dari 0')
    .max(100, 'Diskon produk tidak boleh lebih dari 100')
    .optional()
    .default(0),

  productVariantWeight: z
    .number({ invalid_type_error: 'Berat produk harus berupa angka' })
    .min(0, 'Berat produk tidak boleh kurang dari 0'),

  productVariantColor: z.string().optional(),
  productVariantSize: z.string().optional()
})

const updateExistingProductVariantSchema = z
  .object({
    productVariantId: z.number().int().positive(),
    productVariantProductId: z.number().int().positive().optional(),
    productVariantName: z
      .string({ required_error: 'Nama varian produk wajib diisi' })
      .trim()
      .min(3)
      .max(255)
      .optional(),
    productVariantImage: z.string().optional(),
    productVariantPrice: z
      .number({ invalid_type_error: 'Harga varian produk harus berupa angka' })
      .min(0, 'Harga varian produk tidak boleh kurang dari 0')
      .optional(),
    productVariantSellPrice: z
      .number({ invalid_type_error: 'Harga jual varian produk harus berupa angka' })
      .int('Harga jual varian produk harus bilangan bulat')
      .min(0, 'Harga jual varian produk tidak boleh kurang dari 0')
      .optional(),
    productVariantStock: z
      .number({ invalid_type_error: 'Stok produk harus berupa angka' })
      .int('Stok produk harus bilangan bulat')
      .min(0, 'Stok produk tidak boleh kurang dari 0')
      .max(100, 'Stok produk tidak boleh lebih dari 100')
      .optional(),
    productVariantDiscount: z
      .number({ invalid_type_error: 'Diskon produk harus berupa angka' })
      .min(0, 'Diskon produk tidak boleh kurang dari 0')
      .max(100, 'Diskon produk tidak boleh lebih dari 100')
      .optional(),
    productVariantWeight: z
      .number({ invalid_type_error: 'Berat produk harus berupa angka' })
      .min(0, 'Berat produk tidak boleh kurang dari 0')
      .optional(),
    productVariantColor: z.string().optional(),
    productVariantSize: z.string().optional()
  })
  .strict()

const createProductVariantFromProductPayloadSchema = createProductVariantSchema
  .omit({
    productVariantProductId: true
  })
  .strict()

export const updateProductVariantSchema = z.union([
  updateExistingProductVariantSchema,
  createProductVariantFromProductPayloadSchema
])

export const removeProductVariantQuerySchema = z.object({
  productId: z.coerce
    .number({ invalid_type_error: 'productId harus berupa angka' })
    .int('productId harus bilangan bulat')
    .positive('productId harus lebih dari 0')
})

export type ICreateProductVariant = z.infer<typeof createProductVariantSchema>
export type IUpdateProductVariant = z.infer<typeof updateProductVariantSchema>
export type IRemoveProductVariant = z.infer<typeof removeProductVariantQuerySchema>
