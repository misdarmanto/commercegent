import { z } from 'zod'

const orderStatusEnum = z.enum([
  'waiting',
  'process',
  'draft',
  'delivery',
  'done',
  'cancel'
])

/* ============================= */
/* CREATE PRODUCT (public, body) */
/* ============================= */

export const createProductPublicSchema = z.object({
  code: z
    .string({ required_error: 'Kode produk wajib diisi' })
    .min(1, 'Barcode produk minimal 1 karakter')
    .max(50, 'Barcode produk maksimal 50 karakter'),

  barcode: z
    .string({ required_error: 'Barcode produk wajib diisi' })
    .min(1, 'Barcode produk minimal 1 karakter')
    .max(50, 'Barcode produk maksimal 50 karakter'),

  name: z
    .string({ required_error: 'Nama produk wajib diisi' })
    .min(3, 'Nama produk minimal 3 karakter')
    .max(150, 'Nama produk maksimal 150 karakter'),

  stock: z
    .number({ invalid_type_error: 'Stok produk harus berupa angka' })
    .int('Stok produk harus bilangan bulat')
    .min(0, 'Stok produk tidak boleh kurang dari 0'),

  price: z
    .number({ invalid_type_error: 'Harga produk harus berupa angka' })
    .int('Harga produk harus bilangan bulat')
    .min(0, 'Harga produk tidak boleh kurang dari 0'),

  weight: z
    .number({ invalid_type_error: 'Berat produk harus berupa angka' })
    .min(0, 'Berat produk tidak boleh kurang dari 0'),

  unit: z
    .string({ required_error: 'Unit atau satuan produk wajib diisi' })
    .min(1)
    .max(50),

  isVisible: z.boolean({
    invalid_type_error: 'Status visible harus berupa true atau false'
  })
})

/* ============================= */
/* UPDATE PRODUCT (public, body) */
/* ============================= */

export const updateProductPublicSchema = z.object({
  code: z
    .string({ required_error: 'Kode produk wajib diisi' })
    .min(1, 'Kode produk minimal 1 karakter')
    .max(50, 'Kode produk maksimal 50 karakter'),

  barcode: z
    .string()
    .min(1, 'Barcode produk minimal 1 karakter')
    .max(50, 'Barcode produk maksimal 50 karakter')
    .optional(),

  name: z
    .string()
    .min(3, 'Nama produk minimal 3 karakter')
    .max(150, 'Nama produk maksimal 150 karakter')
    .optional(),

  stock: z
    .number({ invalid_type_error: 'Stok produk harus berupa angka' })
    .int('Stok produk harus bilangan bulat')
    .min(0, 'Stok produk tidak boleh kurang dari 0')
    .optional(),

  price: z
    .number({ invalid_type_error: 'Harga produk harus berupa angka' })
    .int('Harga produk harus bilangan bulat')
    .min(0, 'Harga produk tidak boleh kurang dari 0')
    .optional(),

  weight: z
    .number({ invalid_type_error: 'Berat produk harus berupa angka' })
    .min(0, 'Berat produk tidak boleh kurang dari 0')
    .optional(),

  unit: z
    .string()
    .min(1, 'Unit atau satuan produk minimal 1 karakter')
    .max(50, 'Unit atau satuan produk maksimal 50 karakter')
    .optional(),

  isVisible: z
    .boolean({ invalid_type_error: 'Status visible harus berupa true atau false' })
    .optional()
})

/* ============================= */
/* FIND ORDERS (public, query) */
/* ============================= */

export const findAllOrderPublicQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    size: z.coerce.number().int().min(1).max(100).default(10),
    search: z
      .union([z.string(), z.literal('')])
      .optional()
      .transform((v) => (v === '' ? undefined : v)),
    pagination: z
      .string()
      .optional()
      .transform((v) => v === 'true'),
    orderStatus: orderStatusEnum.optional(),
    startDate: z
      .union([z.string(), z.literal('')])
      .optional()
      .transform((v) => (v === '' ? undefined : v)),
    endDate: z
      .union([z.string(), z.literal('')])
      .optional()
      .transform((v) => (v === '' ? undefined : v))
  })
  .refine(
    (data) => {
      const hasStart = data.startDate != null
      const hasEnd = data.endDate != null
      return (hasStart && hasEnd) || (!hasStart && !hasEnd)
    },
    {
      message: 'startDate dan endDate harus keduanya disertakan',
      path: ['startDate']
    }
  )

export type ICreateProductPublicBody = z.infer<typeof createProductPublicSchema>
export type IUpdateProductPublicBody = z.infer<typeof updateProductPublicSchema>
export type IFindAllOrderPublicQuery = z.infer<typeof findAllOrderPublicQuerySchema>
