import { z } from 'zod'
import {
  createProductVariantSchema,
  updateProductVariantSchema
} from './ProductVariantSchema'

export const createProductSchema = z.object({
  productName: z
    .string({ required_error: 'Nama produk wajib diisi' })
    .min(3, 'Nama produk minimal 3 karakter')
    .max(150, 'Nama produk maksimal 150 karakter'),

  productDescription: z.string().optional(),

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

  productBarcode: z.string().optional(),
  productUnit: z.string().optional(),
  productIsVisible: z.boolean().optional(),
  productVariants: z.array(createProductVariantSchema).optional().default([])
})

export const updateProductSchema = z
  .object({
    productId: z.coerce.number().int().positive(),
    productName: z.string().trim().min(3).max(255).optional(),
    productDescription: z.string().optional(),
    productCategoryId: z.coerce.number().optional(),
    productSubCategoryId: z.coerce.number().optional(),
    productCode: z.string().trim().optional(),
    productBarcode: z.string().optional(),
    productUnit: z.string().optional(),
    productIsVisible: z.boolean().optional(),
    productVariants: z.array(updateProductVariantSchema).optional().default([])
  })
  .strict()

export const findAllProductsQuerySchema = z.object({
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
  productCategoryId: z.coerce.number().int().optional(),
  productSubCategoryId: z.coerce.number().int().optional()
})

export const findAllProductsAdminQuerySchema = findAllProductsQuerySchema

export const productDetailParamsSchema = z.object({
  productId: z.coerce
    .number({ invalid_type_error: 'productId harus berupa angka' })
    .int('productId harus bilangan bulat')
    .positive('productId harus lebih dari 0')
})

export const removeProductQuerySchema = z.object({
  productId: z.coerce
    .number({ invalid_type_error: 'productId harus berupa angka' })
    .int('productId harus bilangan bulat')
    .positive('productId harus lebih dari 0')
})

export const uploadHistoriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(10),
  pagination: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  status: z.string().optional()
})

export const findProductByBarcodeSchema = z.object({
  barcode: z.string().min(1).max(50)
})

export type ICreateProduct = z.infer<typeof createProductSchema>
export type IUpdateProduct = z.infer<typeof updateProductSchema>
export type IFindAllProducts = z.infer<typeof findAllProductsQuerySchema>
export type IFindDetailProduct = z.infer<typeof productDetailParamsSchema>
export type IRemoveProduct = z.infer<typeof removeProductQuerySchema>
export type IUploadHistories = z.infer<typeof uploadHistoriesQuerySchema>
export type IFindProductByBarcode = z.infer<typeof findProductByBarcodeSchema>
