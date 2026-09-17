import { StatusCodes } from 'http-status-codes'
import { FaqModel } from '../models/FaqModel'
import { faqPineconeIndex } from '../configs/pinecone'
import { OpenAIService } from './external/OpenAI.service'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'

const vectorId = (faqId: number): string => `faq-${faqId}`

export class FaqEmbeddingService {
  static async syncFaq(faqId: number): Promise<void> {
    try {
      const faq = await FaqModel.findOne({ where: { faqId, deleted: false } })

      if (faq == null) {
        await this.removeFaq(faqId)
        return
      }

      const embeddingText = `Question: ${faq.faqQuestion}\nAnswer: ${faq.faqAnswer}`
      const embedding = await OpenAIService.createEmbedding(embeddingText)

      await faqPineconeIndex.upsert({
        records: [
          {
            id: vectorId(faqId),
            values: embedding,
            metadata: {
              faqId,
              faqQuestion: faq.faqQuestion,
              faqAnswer: faq.faqAnswer
            }
          }
        ]
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[FaqEmbeddingService] syncFaq failed: ${String(error)}`)
      throw new AppError('Failed to sync FAQ embedding', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async removeFaq(faqId: number): Promise<void> {
    try {
      await faqPineconeIndex.deleteOne({ id: vectorId(faqId) })
    } catch (error) {
      logger.error(`[FaqEmbeddingService] removeFaq failed: ${String(error)}`)
    }
  }

  static async searchFaqs(query: string, topK: number = 3) {
    try {
      const embedding = await OpenAIService.createEmbedding(query)

      const result = await faqPineconeIndex.query({
        vector: embedding,
        topK,
        includeMetadata: true
      })

      return result.matches ?? []
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[FaqEmbeddingService] searchFaqs failed: ${String(error)}`)
      throw new AppError('Failed to search FAQs', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
