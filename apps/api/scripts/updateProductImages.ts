// const normalizeString = (value: string): string => {
//   return value
//     .toLowerCase()
//     .replace(/\.(jpg|jpeg|png|webp)$/g, '') // hapus ekstensi
//     .replace(/[^a-z0-9]/g, '') // hapus simbol, spasi, underscore, dll
// }

// import XLSX from 'xlsx'
// import { ProductModel } from '../src/models/ProductModel'
// import logger from '../src/logs'
// import path from 'path'
// import { sequelize } from '../src/models'

// export const updateProductImagesFromExcel = async (excelPath: string): Promise<void> => {
//   const workbook = XLSX.readFile(excelPath)
//   const sheet = workbook.SheetNames[0]
//   const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])

//   const products = await ProductModel.findAll({
//     where: { deleted: 0 }
//   })

//   let updatedCount = 0

//   for (const row of rows as any[]) {
//     if (!row['Nama File Gambar']) continue

//     const imageName = row['Nama File Gambar'].trim()
//     const normalizedImage = normalizeString(imageName)

//     const matchedProduct = products.find((product) => {
//       const normalizedProductName = normalizeString(product.productName)
//       return normalizedProductName === normalizedImage
//     })

//     if (!matchedProduct) {
//       logger.warn(`[IMAGE MATCH] Tidak ditemukan product untuk image: ${imageName}`)
//       continue
//     }

//     await matchedProduct.update({
//       productImages: [imageName]
//     })

//     updatedCount++
//     logger.info(`[IMAGE UPDATED] ${matchedProduct.productName} → ${imageName}`)
//   }

//   logger.info(`✅ Total product image terupdate: ${updatedCount}`)
// }

// const run = async () => {
//   try {
//     logger.info('🚀 Starting product image update...')

//     await sequelize.authenticate()

//     await updateProductImagesFromExcel(path.resolve(__dirname, './product.xlsx'))

//     logger.info('✅ Done updating product images')
//     process.exit(0)
//   } catch (error) {
//     logger.error('❌ Error running script:', error)
//     process.exit(1)
//   }
// }

// run()
