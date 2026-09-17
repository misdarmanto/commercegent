import { Queue } from 'bullmq'
import { appConfigs } from '../configs/appConfig'
import logger from '../utilities/logger'

const faqEmbeddingQueue = new Queue('faq-embedding-queue', {
  connection: {
    host: appConfigs.redis.host,
    port: appConfigs.redis.port as number
  }
})

export async function addFaqEmbeddingToQueue(faqId: number, action: 'sync' | 'remove') {
  logger.info(
    `[FaqEmbeddingQueue]-Adding job to faq embedding queue: ${faqId} (${action})`
  )

  await faqEmbeddingQueue.add(
    'process-faq-embedding',
    { faqId, action },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false
    }
  )
}

export default faqEmbeddingQueue
