import { Queue } from 'bullmq'
import { appConfigs } from '../configs/appConfig'
import logger from '../utilities/logger'

const productEmbeddingQueue = new Queue('product-embedding-queue', {
  connection: {
    host: appConfigs.redis.host,
    port: appConfigs.redis.port as number
  }
})

export async function addProductEmbeddingToQueue(
  productId: number,
  action: 'sync' | 'remove'
) {
  logger.info(
    `[ProductEmbeddingQueue]-Adding job to product embedding queue: ${productId} (${action})`
  )

  await productEmbeddingQueue.add(
    'process-product-embedding',
    { productId, action },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false
    }
  )
}

export default productEmbeddingQueue
