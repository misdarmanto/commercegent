import { ProductModel } from '../src/models/ProductModel'
import { ProductEmbeddingService } from '../src/services/ProductEmbedding.service'
import logger from '../src/utilities/logger'

async function main() {
  const products = await ProductModel.findAll({
    where: { deleted: false },
    attributes: ['productId']
  })

  logger.info(`[ReindexProducts] Found ${products.length} products to sync`)

  for (const product of products) {
    try {
      await ProductEmbeddingService.syncProduct(product.productId)
      logger.info(`[ReindexProducts] Synced product ${product.productId}`)
    } catch (error) {
      logger.error(
        `[ReindexProducts] Failed to sync product ${product.productId}: ${String(error)}`
      )
    }
  }

  logger.info('[ReindexProducts] Done')
  process.exit(0)
}

main().catch((error) => {
  logger.error(`[ReindexProducts] Fatal error: ${String(error)}`)
  process.exit(1)
})
