import { Worker } from 'bullmq'
import { appConfigs } from '../configs/appConfig'
import { FaqEmbeddingService } from '../services/FaqEmbedding.service'
import logger from '../utilities/logger'

new Worker(
  'faq-embedding-queue',
  async (job) => {
    const { faqId, action } = job.data as { faqId: number; action: 'sync' | 'remove' }

    logger.info(
      `[FaqEmbeddingWorker]-Processing embedding job for faq ID: ${faqId} (${action})`
    )

    if (action === 'remove') {
      await FaqEmbeddingService.removeFaq(faqId)
      return
    }

    await FaqEmbeddingService.syncFaq(faqId)
  },
  {
    connection: {
      host: appConfigs.redis.host,
      port: appConfigs.redis.port as number
    }
  }
).on('failed', (job, err) => {
  logger.error(
    `[FaqEmbeddingWorker]-Job failed for faq ID ${job?.data?.faqId}: ${String(err)}`
  )
})
