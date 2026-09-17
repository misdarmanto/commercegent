import { Op, type WhereOptions } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { FaqAttributes, FaqModel } from '../models/FaqModel'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import { addFaqEmbeddingToQueue } from '../queues/faqEmbeddingQueue'
import type {
  ICreateFaq,
  IFindAllFaqs,
  IRemoveFaq,
  IUpdateFaq
} from '../schemas/faqSchema'

export class FaqService {
  private static buildFindAllWhere(payload: IFindAllFaqs): WhereOptions<FaqAttributes> {
    const where: WhereOptions<FaqAttributes> = {
      deleted: { [Op.eq]: false }
    }

    if (payload.search != null) {
      where.faqQuestion = { [Op.like]: `%${payload.search}%` }
    }

    return where
  }

  static async findAllFaqs(payload: IFindAllFaqs) {
    try {
      const pager = new Pagination(payload.page, payload.size)

      const result = await FaqModel.findAndCountAll({
        where: this.buildFindAllWhere(payload),
        attributes: ['faqId', 'faqQuestion', 'faqAnswer'],
        order: [['faqId', 'desc']],
        ...(payload.pagination === true && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData(result)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[FaqService] findAllFaqs failed: ${String(serviceError)}`)
      throw new AppError('Failed to find all FAQs', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async createFaq(payload: ICreateFaq) {
    try {
      const faq = await FaqModel.create({
        faqQuestion: payload.faqQuestion,
        faqAnswer: payload.faqAnswer,
        deleted: false
      })

      await addFaqEmbeddingToQueue(faq.faqId, 'sync')
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[FaqService] createFaq failed: ${String(serviceError)}`)
      throw new AppError('Failed to create FAQ', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updateFaq(payload: IUpdateFaq) {
    try {
      const faq = await FaqModel.findOne({
        where: { faqId: payload.faqId, deleted: false }
      })

      if (faq == null) {
        throw new AppError('FAQ not found', StatusCodes.NOT_FOUND)
      }

      const { faqId: _omitId, ...restUpdate } = payload

      if (Object.keys(restUpdate).length === 0) {
        throw new AppError('No fields to update', StatusCodes.BAD_REQUEST)
      }

      await faq.update(restUpdate)

      await addFaqEmbeddingToQueue(payload.faqId, 'sync')
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[FaqService] updateFaq failed: ${String(serviceError)}`)
      throw new AppError('Failed to update FAQ', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async removeFaq(payload: IRemoveFaq) {
    try {
      const [updatedRows] = await FaqModel.update(
        { deleted: true },
        { where: { faqId: { [Op.eq]: payload.faqId }, deleted: { [Op.eq]: false } } }
      )

      if (updatedRows === 0) {
        throw new AppError('FAQ not found', StatusCodes.NOT_FOUND)
      }

      await addFaqEmbeddingToQueue(payload.faqId, 'remove')
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[FaqService] removeFaq failed: ${String(serviceError)}`)
      throw new AppError('Failed to remove FAQ', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
