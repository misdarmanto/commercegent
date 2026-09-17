import { StatusCodes } from 'http-status-codes'
import { ChatService } from './Chat.service'
import { ChatSessionModel } from '../models/ChatSessionModel'
import { ChatMessageModel } from '../models/ChatMessageModel'
import { ProductEmbeddingService } from './ProductEmbedding.service'
import { OpenAIService } from './external/OpenAI.service'
import { ChatToolsService } from './ChatTools.service'

jest.mock('../models/ChatSessionModel', () => ({
  ChatSessionModel: { findOne: jest.fn(), create: jest.fn(), findAll: jest.fn() }
}))
jest.mock('../models/ChatMessageModel', () => ({
  ChatMessageModel: { create: jest.fn(), findAll: jest.fn() }
}))
jest.mock('./ProductEmbedding.service', () => ({
  ProductEmbeddingService: { searchProducts: jest.fn() }
}))
jest.mock('./external/OpenAI.service', () => ({
  OpenAIService: { createChatCompletion: jest.fn() }
}))
jest.mock('./ChatTools.service', () => ({
  chatTools: [],
  ChatToolsService: { execute: jest.fn() }
}))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedSessionFindOne = ChatSessionModel.findOne as jest.Mock
const mockedSessionCreate = ChatSessionModel.create as jest.Mock
const mockedSessionFindAll = ChatSessionModel.findAll as jest.Mock
const mockedMessageCreate = ChatMessageModel.create as jest.Mock
const mockedMessageFindAll = ChatMessageModel.findAll as jest.Mock
const mockedSearchProducts = ProductEmbeddingService.searchProducts as jest.Mock
const mockedCreateChatCompletion = OpenAIService.createChatCompletion as jest.Mock
const mockedToolExecute = ChatToolsService.execute as jest.Mock

const buildSession = (overrides: Record<string, unknown> = {}) => ({
  chatSessionId: 1,
  chatSessionUserId: 1,
  chatSessionTitle: null,
  update: jest.fn(),
  ...overrides
})

beforeEach(() => {
  mockedSearchProducts.mockResolvedValue([])
  mockedMessageFindAll.mockResolvedValue([])
})

describe('ChatService.sendMessage', () => {
  it('creates a new session when no chatSessionId is provided', async () => {
    const session = buildSession()
    mockedSessionCreate.mockResolvedValue(session)
    mockedCreateChatCompletion.mockResolvedValue({ content: 'Hi there!', tool_calls: undefined })

    const result = await ChatService.sendMessage(1, { message: 'Hello' } as any)

    expect(mockedSessionCreate).toHaveBeenCalledWith({ chatSessionUserId: 1 })
    expect(mockedSessionFindOne).not.toHaveBeenCalled()
    expect(result).toEqual({
      chatSessionId: 1,
      reply: 'Hi there!',
      products: []
    })
  })

  it('throws a 404 AppError when chatSessionId does not belong to the user', async () => {
    mockedSessionFindOne.mockResolvedValue(null)

    await expect(
      ChatService.sendMessage(1, { chatSessionId: 99, message: 'Hi' } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })

    expect(mockedMessageCreate).not.toHaveBeenCalled()
  })

  it('reuses an existing session and sets the title only once', async () => {
    const session = buildSession({ chatSessionId: 5, chatSessionTitle: 'Existing title' })
    mockedSessionFindOne.mockResolvedValue(session)
    mockedCreateChatCompletion.mockResolvedValue({ content: 'Reply', tool_calls: undefined })

    await ChatService.sendMessage(1, { chatSessionId: 5, message: 'Follow up' } as any)

    expect(session.update).not.toHaveBeenCalled()
  })

  it('sets the session title from the first message when none is set yet', async () => {
    const session = buildSession()
    mockedSessionCreate.mockResolvedValue(session)
    mockedCreateChatCompletion.mockResolvedValue({ content: 'Reply', tool_calls: undefined })

    await ChatService.sendMessage(1, { message: 'What products do you have?' } as any)

    expect(session.update).toHaveBeenCalledWith({
      chatSessionTitle: 'What products do you have?'
    })
  })

  it('persists the user message and the assistant reply', async () => {
    const session = buildSession()
    mockedSessionCreate.mockResolvedValue(session)
    mockedSearchProducts.mockResolvedValue([
      { metadata: { productId: 1, productName: 'Salmon' } }
    ])
    mockedCreateChatCompletion.mockResolvedValue({ content: 'Here is Salmon', tool_calls: undefined })

    await ChatService.sendMessage(1, { message: 'Recommend a product' } as any)

    expect(mockedMessageCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        chatMessageSessionId: 1,
        chatMessageRole: 'user',
        chatMessageContent: 'Recommend a product'
      })
    )
    expect(mockedMessageCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        chatMessageSessionId: 1,
        chatMessageRole: 'assistant',
        chatMessageContent: 'Here is Salmon',
        chatMessageMeta: expect.objectContaining({ matchedProductIds: [1] })
      })
    )
  })

  it('executes tool calls and feeds the results back before returning the final reply', async () => {
    const session = buildSession()
    mockedSessionCreate.mockResolvedValue(session)

    const toolCall = {
      id: 'call_1',
      type: 'function',
      function: { name: 'add_to_cart', arguments: '{"productId":1,"quantity":1}' }
    }

    mockedCreateChatCompletion
      .mockResolvedValueOnce({ content: null, tool_calls: [toolCall] })
      .mockResolvedValueOnce({ content: 'Added to your cart!', tool_calls: undefined })
    mockedToolExecute.mockResolvedValue(JSON.stringify({ success: true, message: 'added' }))

    const result = await ChatService.sendMessage(1, { message: 'Add salmon to cart' } as any)

    expect(mockedToolExecute).toHaveBeenCalledWith(1, toolCall)
    expect(mockedCreateChatCompletion).toHaveBeenCalledTimes(2)
    expect(result.reply).toBe('Added to your cart!')

    const assistantMessageCall = mockedMessageCreate.mock.calls.find(
      ([payload]) => payload.chatMessageRole === 'assistant'
    )
    expect(assistantMessageCall[0].chatMessageMeta.toolCalls).toEqual([
      { name: 'add_to_cart', result: JSON.stringify({ success: true, message: 'added' }) }
    ])
  })

  it('falls back to a default message when the model never returns content', async () => {
    const session = buildSession()
    mockedSessionCreate.mockResolvedValue(session)

    const toolCall = {
      id: 'call_1',
      type: 'function',
      function: { name: 'view_cart', arguments: '{}' }
    }

    mockedCreateChatCompletion.mockResolvedValue({ content: null, tool_calls: [toolCall] })
    mockedToolExecute.mockResolvedValue(JSON.stringify({ success: true, cart: {} }))

    const result = await ChatService.sendMessage(1, { message: 'What is in my cart?' } as any)

    expect(mockedCreateChatCompletion).toHaveBeenCalledTimes(3)
    expect(result.reply).toBe('Maaf, terjadi kesalahan.')
  })

  it('wraps an unexpected failure into a 500 AppError', async () => {
    mockedSessionCreate.mockRejectedValue(new Error('db down'))

    await expect(
      ChatService.sendMessage(1, { message: 'Hello' } as any)
    ).rejects.toMatchObject({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to process chat message'
    })
  })
})

describe('ChatService.findSessionMessages', () => {
  it('throws a 404 AppError when the session does not belong to the user', async () => {
    mockedSessionFindOne.mockResolvedValue(null)

    await expect(ChatService.findSessionMessages(1, 5)).rejects.toMatchObject({
      statusCode: StatusCodes.NOT_FOUND
    })
  })

  it('returns the session and its ordered messages', async () => {
    const session = buildSession()
    mockedSessionFindOne.mockResolvedValue(session)
    mockedMessageFindAll.mockResolvedValue([{ chatMessageId: 1 }])

    const result = await ChatService.findSessionMessages(1, 1)

    expect(result).toEqual({ session, messages: [{ chatMessageId: 1 }] })
  })
})

describe('ChatService.findAllSessions', () => {
  it('returns the sessions belonging to the user', async () => {
    mockedSessionFindAll.mockResolvedValue([{ chatSessionId: 1 }])

    const result = await ChatService.findAllSessions(1)

    expect(result).toEqual([{ chatSessionId: 1 }])
    expect(mockedSessionFindAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { chatSessionUserId: 1, deleted: false } })
    )
  })
})
