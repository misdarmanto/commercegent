import { FaqModel } from '../src/models/FaqModel'
import { FaqEmbeddingService } from '../src/services/FaqEmbedding.service'
import logger from '../src/utilities/logger'

async function main() {
  const faqs = await FaqModel.findAll({
    where: { deleted: false },
    attributes: ['faqId']
  })

  logger.info(`[ReindexFaqs] Found ${faqs.length} FAQs to sync`)

  for (const faq of faqs) {
    try {
      await FaqEmbeddingService.syncFaq(faq.faqId)
      logger.info(`[ReindexFaqs] Synced faq ${faq.faqId}`)
    } catch (error) {
      logger.error(`[ReindexFaqs] Failed to sync faq ${faq.faqId}: ${String(error)}`)
    }
  }

  logger.info('[ReindexFaqs] Done')
  process.exit(0)
}

main().catch((error) => {
  logger.error(`[ReindexFaqs] Fatal error: ${String(error)}`)
  process.exit(1)
})
