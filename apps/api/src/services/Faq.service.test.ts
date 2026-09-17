import { StatusCodes } from 'http-status-codes'
import { FaqService } from './Faq.service'
import { FaqModel } from '../models/FaqModel'
import { addFaqEmbeddingToQueue } from '../queues/faqEmbeddingQueue'

jest.mock('../models/FaqModel', () => ({
  FaqModel: { findAndCountAll: jest.fn(), findOne: jest.fn(), create: jest.fn(), update: jest.fn() }
}))
jest.mock('../queues/faqEmbeddingQueue', () => ({
  addFaqEmbeddingToQueue: jest.fn()
}))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedFindAndCountAll = FaqModel.findAndCountAll as jest.Mock
const mockedFindOne = FaqModel.findOne as jest.Mock
const mockedCreate = FaqModel.create as jest.Mock
const mockedUpdate = FaqModel.update as jest.Mock
const mockedAddToQueue = addFaqEmbeddingToQueue as jest.Mock

describe('FaqService.findAllFaqs', () => {
  it('formats the paginated result', async () => {
    mockedFindAndCountAll.mockResolvedValue({ count: 1, rows: [{ faqId: 1 }] })

    const result = await FaqService.findAllFaqs({ page: 1, size: 10, pagination: true })

    expect(result).toEqual({
      totalItems: 1,
      items: [{ faqId: 1 }],
      totalPages: 1,
      currentPage: 1
    })
  })

  it('filters by question search text', async () => {
    mockedFindAndCountAll.mockResolvedValue({ count: 0, rows: [] })

    await FaqService.findAllFaqs({ page: 1, size: 10, pagination: false, search: 'shipping' })

    const callArgs = mockedFindAndCountAll.mock.calls[0][0]
    expect(callArgs.where.faqQuestion).toBeDefined()
  })
})

describe('FaqService.createFaq', () => {
  it('creates the FAQ and enqueues an embedding sync job', async () => {
    mockedCreate.mockResolvedValue({ faqId: 7 })

    await FaqService.createFaq({ faqQuestion: 'Q?', faqAnswer: 'A.' })

    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({ faqQuestion: 'Q?', faqAnswer: 'A.', deleted: false })
    )
    expect(mockedAddToQueue).toHaveBeenCalledWith(7, 'sync')
  })
})

describe('FaqService.updateFaq', () => {
  it('throws a 404 AppError when the FAQ does not exist', async () => {
    mockedFindOne.mockResolvedValue(null)

    await expect(
      FaqService.updateFaq({ faqId: 1, faqAnswer: 'New answer' })
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })

  it('throws a 400 AppError when there is nothing to update', async () => {
    mockedFindOne.mockResolvedValue({ update: jest.fn() })

    await expect(FaqService.updateFaq({ faqId: 1 })).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_REQUEST
    })
  })

  it('updates the FAQ and enqueues an embedding sync job', async () => {
    const faq = { update: jest.fn() }
    mockedFindOne.mockResolvedValue(faq)

    await FaqService.updateFaq({ faqId: 1, faqAnswer: 'Updated answer' })

    expect(faq.update).toHaveBeenCalledWith({ faqAnswer: 'Updated answer' })
    expect(mockedAddToQueue).toHaveBeenCalledWith(1, 'sync')
  })
})

describe('FaqService.removeFaq', () => {
  it('throws a 404 AppError when no row matched', async () => {
    mockedUpdate.mockResolvedValue([0])

    await expect(FaqService.removeFaq({ faqId: 1 })).rejects.toMatchObject({
      statusCode: StatusCodes.NOT_FOUND
    })
    expect(mockedAddToQueue).not.toHaveBeenCalled()
  })

  it('soft-deletes the FAQ and enqueues a removal job', async () => {
    mockedUpdate.mockResolvedValue([1])

    await FaqService.removeFaq({ faqId: 1 })

    expect(mockedAddToQueue).toHaveBeenCalledWith(1, 'remove')
  })
})
