import { FaqEmbeddingService } from './FaqEmbedding.service'
import { FaqModel } from '../models/FaqModel'
import { OpenAIService } from './external/OpenAI.service'
import { faqPineconeIndex } from '../configs/pinecone'

jest.mock('../models/FaqModel', () => ({ FaqModel: { findOne: jest.fn() } }))
jest.mock('../configs/pinecone', () => ({
  faqPineconeIndex: { upsert: jest.fn(), deleteOne: jest.fn(), query: jest.fn() }
}))
jest.mock('./external/OpenAI.service', () => ({
  OpenAIService: { createEmbedding: jest.fn() }
}))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedFindOne = FaqModel.findOne as jest.Mock
const mockedCreateEmbedding = OpenAIService.createEmbedding as jest.Mock
const mockedUpsert = faqPineconeIndex.upsert as jest.Mock
const mockedDeleteOne = faqPineconeIndex.deleteOne as jest.Mock
const mockedQuery = faqPineconeIndex.query as jest.Mock

describe('FaqEmbeddingService.syncFaq', () => {
  it('removes the vector instead of upserting when the FAQ no longer exists', async () => {
    mockedFindOne.mockResolvedValue(null)

    await FaqEmbeddingService.syncFaq(1)

    expect(mockedDeleteOne).toHaveBeenCalledWith({ id: 'faq-1' })
    expect(mockedUpsert).not.toHaveBeenCalled()
  })

  it('embeds and upserts the FAQ with question/answer metadata', async () => {
    mockedFindOne.mockResolvedValue({
      faqId: 3,
      faqQuestion: 'How long is shipping?',
      faqAnswer: '2-3 business days'
    })
    mockedCreateEmbedding.mockResolvedValue([0.1, 0.2])

    await FaqEmbeddingService.syncFaq(3)

    expect(mockedCreateEmbedding).toHaveBeenCalledWith(
      expect.stringContaining('How long is shipping?')
    )
    expect(mockedUpsert).toHaveBeenCalledWith({
      records: [
        {
          id: 'faq-3',
          values: [0.1, 0.2],
          metadata: {
            faqId: 3,
            faqQuestion: 'How long is shipping?',
            faqAnswer: '2-3 business days'
          }
        }
      ]
    })
  })
})

describe('FaqEmbeddingService.removeFaq', () => {
  it('deletes the vector by id', async () => {
    await FaqEmbeddingService.removeFaq(9)
    expect(mockedDeleteOne).toHaveBeenCalledWith({ id: 'faq-9' })
  })

  it('swallows errors instead of throwing', async () => {
    mockedDeleteOne.mockRejectedValue(new Error('pinecone down'))
    await expect(FaqEmbeddingService.removeFaq(9)).resolves.toBeUndefined()
  })
})

describe('FaqEmbeddingService.searchFaqs', () => {
  it('embeds the query and returns the matches from Pinecone', async () => {
    mockedCreateEmbedding.mockResolvedValue([0.3, 0.4])
    mockedQuery.mockResolvedValue({ matches: [{ id: 'faq-3', metadata: {} }] })

    const result = await FaqEmbeddingService.searchFaqs('shipping time', 2)

    expect(mockedCreateEmbedding).toHaveBeenCalledWith('shipping time')
    expect(mockedQuery).toHaveBeenCalledWith(
      expect.objectContaining({ vector: [0.3, 0.4], topK: 2, includeMetadata: true })
    )
    expect(result).toEqual([{ id: 'faq-3', metadata: {} }])
  })

  it('returns an empty array when Pinecone has no matches', async () => {
    mockedCreateEmbedding.mockResolvedValue([0.3, 0.4])
    mockedQuery.mockResolvedValue({})

    const result = await FaqEmbeddingService.searchFaqs('shipping time')

    expect(result).toEqual([])
  })
})
