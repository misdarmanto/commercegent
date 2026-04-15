import { Worker } from 'bullmq'
import XLSX from 'xlsx'
import fs from 'fs'
import { Op } from 'sequelize'
import { ProductAttributes, ProductModel } from '../models/ProductModel'
import { FileUploadModel } from '../models/FileUploadModel'
import { appConfigs } from '../configs/appConfig'
import { calculateSellPrice } from '../utilities/priceCalculator'
import logger from '../utilities/logger'

new Worker(
  'product-file-queue',
  async (job) => {
    const { fileId, filePath } = job.data

    logger.info(`[ProductFileWorker]-Processing file upload job for file ID: ${fileId}`)

    await FileUploadModel.update({ status: 'PROCESSING' }, { where: { fileId } })

    try {
      const workbook = XLSX.readFile(filePath)
      const sheet = workbook.SheetNames[0]
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])

      /* ===============================
       * MAP DATA
       * =============================== */
      const products = data.map((item: any) => ({
        productName: item.nama,
        productDescription: item.deskripsi || '',
        productImages: item.image ? [item.image] : [],
        productPrice: Number(item.harga) || 0,
        productCategoryId: item.kategori,
        productSubCategoryId: item.subkategori,
        productCode: item.kode || null,
        productBarcode: item.barcode || null,
        productStock: Number(item.stok) || 0,
        productDiscount: Number(item.diskon) || 0,
        productSellPrice: calculateSellPrice({
          originalPrice: Number(item.harga),
          discountPercent: Number(item.diskon)
        }),
        productWeight: Number(item.berat) || 0
      })) as ProductAttributes[]

      /* ===============================
       * VALIDATION - DUPLICATE IN FILE
       * =============================== */
      const codeSet = new Set<string>()
      const barcodeSet = new Set<string>()

      for (const product of products) {
        if (product.productCode) {
          if (codeSet.has(product.productCode)) {
            throw new Error(`Duplicate product code di file: ${product.productCode}`)
          }
          codeSet.add(product.productCode)
        }

        if (product.productBarcode) {
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
      const codes = products.map((p) => p.productCode).filter(Boolean) as string[]

      const barcodes = products.map((p) => p.productBarcode).filter(Boolean) as string[]

      if (codes.length || barcodes.length) {
        const existingProduct = await ProductModel.findOne({
          where: {
            deleted: 0,
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
       * BULK INSERT
       * =============================== */
      await ProductModel.bulkCreate(products)

      await FileUploadModel.update({ status: 'SUCCESS' }, { where: { fileId } })

      fs.unlinkSync(filePath)
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
    }
  },
  {
    connection: {
      host: appConfigs.redis.host,
      port: appConfigs.redis.port as number
    }
  }
)
