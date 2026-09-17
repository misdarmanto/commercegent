import { Worker } from 'bullmq'
import { appConfigs } from '../configs/appConfig'
import { ProductEmbeddingService } from '../services/ProductEmbedding.service'
import logger from '../utilities/logger'

new Worker(
  'product-embedding-queue',
  async (job) => {
    const { productId, action } = job.data as {
      productId: number
      action: 'sync' | 'remove'
    }

    logger.info(
      `[ProductEmbeddingWorker]-Processing embedding job for product ID: ${productId} (${action})`
    )

    if (action === 'remove') {
      await ProductEmbeddingService.removeProduct(productId)
      return
    }

    await ProductEmbeddingService.syncProduct(productId)
  },
  {
    connection: {
      host: appConfigs.redis.host,
      port: appConfigs.redis.port as number
    }
  }
).on('failed', (job, err) => {
  logger.error(
    `[ProductEmbeddingWorker]-Job failed for product ID ${job?.data?.productId}: ${String(err)}`
  )
})
