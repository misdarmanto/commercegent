import { Queue } from 'bullmq'
import { appConfigs } from '../configs/appConfig'
import logger from '../logs'

const productFileQueue = new Queue('product-file-queue', {
  connection: {
    host: appConfigs.redis.host,
    port: appConfigs.redis.port as number
  }
})

export async function addProductFileToQueue(fileId: number, filePath: string) {
  logger.info('Adding job to product file queue:', { fileId, filePath })

  await productFileQueue.add(
    'process-product-file',
    { fileId, filePath },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false
    }
  )
}

export default productFileQueue
