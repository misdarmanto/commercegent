import { Worker } from 'bullmq'
import XLSX from 'xlsx'
import fs from 'fs'
import { Op } from 'sequelize'
import { ProductModel } from '../models/ProductModel'
import { ProductVariantModel } from '../models/ProductVariantModel'
import { FileUploadModel } from '../models/FileUploadModel'
import { appConfigs } from '../configs/appConfig'
import { calculateSellPrice } from '../utilities/priceCalculator'
import logger from '../utilities/logger'
import { sequelizeInit } from '../configs/database'

type ExcelRow = {
  nama?: string
  deskripsi?: string
  kategori?: string | number
  subkategori?: string | number
  kode?: string
  barcode?: string
  unit?: string
  visible?: string | boolean | number
  image?: string
  warna?: string
  ukuran?: string
  varian?: string
  harga?: string | number
  stok?: string | number
  diskon?: string | number
  berat?: string | number
}

const toSafeString = (value: unknown, fallback: string = ''): string => {
  if (value == null) return fallback
  return String(value).trim()
}

const toNumber = (value: unknown, fallback: number = 0): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const toBoolean = (value: unknown, fallback: boolean = false): boolean => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['1', 'true', 'yes', 'y'].includes(normalized)) return true
    if (['0', 'false', 'no', 'n'].includes(normalized)) return false
  }
  return fallback
}

new Worker(
  'product-file-queue',
  async (job) => {
    const { fileId, filePath } = job.data

    logger.info(`[ProductFileWorker]-Processing file upload job for file ID: ${fileId}`)

    await FileUploadModel.update({ status: 'PROCESSING' }, { where: { fileId } })

    try {
      const workbook = XLSX.readFile(filePath)
      const sheet = workbook.SheetNames[0]
      const data = XLSX.utils.sheet_to_json<ExcelRow>(workbook.Sheets[sheet], {
        defval: ''
      })

      /* ===============================
       * MAP DATA
       * =============================== */
      const products = data.map((item) => {
        const productCode = toSafeString(item.kode)
        const productBarcode = toSafeString(item.barcode)
        const productPrice = toNumber(item.harga, 0)
        const productDiscount = toNumber(item.diskon, 0)
        const variantName = toSafeString(item.varian || item.nama || 'Default Variant')

        return {
          productName: toSafeString(item.nama),
          productDescription: toSafeString(item.deskripsi),
          productCategoryId: toSafeString(item.kategori),
          productSubCategoryId: toSafeString(item.subkategori),
          productCode,
          productBarcode,
          productUnit: toSafeString(item.unit, 'pcs'),
          productIsVisible: toBoolean(item.visible, false),
          variant: {
            productVariantName: variantName,
            productVariantImage: toSafeString(item.image),
            productVariantPrice: productPrice,
            productVariantStock: toNumber(item.stok, 0),
            productVariantDiscount: productDiscount,
            productVariantWeight: toNumber(item.berat, 0),
            productVariantSellPrice: calculateSellPrice({
              originalPrice: productPrice,
              discountPercent: productDiscount
            })
          }
        }
      })

      const invalidRow = products.find(
        (item) => item.productName.length === 0 || item.productCode.length === 0
      )
      if (invalidRow != null) {
        throw new Error('Kolom wajib excel tidak lengkap (nama/kode produk)')
      }

      /* ===============================
       * VALIDATION - DUPLICATE IN FILE
       * =============================== */
      const codeSet = new Set<string>()
      const barcodeSet = new Set<string>()

      for (const product of products) {
        if (codeSet.has(product.productCode)) {
          throw new Error(`Duplicate product code di file: ${product.productCode}`)
        }
        codeSet.add(product.productCode)

        if (product.productBarcode.length > 0) {
          if (barcodeSet.has(product.productBarcode)) {
            throw new Error(
              `Duplicate product barcode di file: ${product.productBarcode}`
            )
          }
          barcodeSet.add(product.productBarcode)
        }
      }

      /* ===============================
       * VALIDATION - DUPLICATE IN DB
       * =============================== */
      const codes = products.map((p) => p.productCode)
      const barcodes = products.map((p) => p.productBarcode).filter((v) => v.length > 0)

      if (codes.length || barcodes.length) {
        const existingProduct = await ProductModel.findOne({
          where: {
            [Op.or]: [
              ...(codes.length ? [{ productCode: { [Op.in]: codes } }] : []),
              ...(barcodes.length ? [{ productBarcode: { [Op.in]: barcodes } }] : [])
            ]
          }
        })

        if (existingProduct) {
          if (
            existingProduct.productCode &&
            codes.includes(existingProduct.productCode)
          ) {
            throw new Error(
              `Product code sudah terdaftar: ${existingProduct.productCode}`
            )
          }

          if (
            existingProduct.productBarcode &&
            barcodes.includes(existingProduct.productBarcode)
          ) {
            throw new Error(
              `Product barcode sudah terdaftar: ${existingProduct.productBarcode}`
            )
          }

          throw new Error('Product sudah terdaftar')
        }
      }

      /* ===============================
       * BULK INSERT (PRODUCT + VARIANT)
       * =============================== */
      await sequelizeInit.transaction(async (transaction) => {
        for (const item of products) {
          const product = await ProductModel.create(
            {
              productName: item.productName,
              productDescription: item.productDescription,
              productCategoryId: item.productCategoryId,
              productSubCategoryId: item.productSubCategoryId,
              productCode: item.productCode,
              productBarcode: item.productBarcode,
              productUnit: item.productUnit,
              productIsVisible: item.productIsVisible,
              productIsHighlight: false,
              deleted: false
            },
            { transaction }
          )

          await ProductVariantModel.create(
            {
              productVariantProductId: product.productId,
              productVariantName: item.variant.productVariantName,
              productVariantImage: item.variant.productVariantImage,
              productVariantPrice: item.variant.productVariantPrice,
              productVariantStock: item.variant.productVariantStock,
              productVariantDiscount: item.variant.productVariantDiscount,
              productVariantWeight: item.variant.productVariantWeight,
              productVariantSellPrice: item.variant.productVariantSellPrice,
              deleted: false
            },
            { transaction }
          )
        }
      })

      await FileUploadModel.update({ status: 'SUCCESS' }, { where: { fileId } })
    } catch (workerError) {
      logger.error(
        `[ProductFileWorker]-Error processing file ID ${fileId}: ${String(workerError)}`
      )

      await FileUploadModel.update(
        {
          status: 'FAILED',
          message: (workerError as Error).message
        },
        { where: { fileId } }
      )
    } finally {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      } catch (unlinkError) {
        logger.warn(
          `[ProductFileWorker]-Failed to delete file ${filePath}: ${String(unlinkError)}`
        )
      }
    }
  },
  {
    connection: {
      host: appConfigs.redis.host,
      port: appConfigs.redis.port as number
    }
  }
)
