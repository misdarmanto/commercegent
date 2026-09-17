import { StatusCodes } from 'http-status-codes'
import { OpenAIService } from './OpenAI.service'

// OpenAI.service.ts instantiates the client at module-load time, which runs
// before any `const` in this file is initialized. Route calls through a
// mutable holder so the wrapper functions only read the mocks lazily, once
// the test body has actually set them up.
const mocks = {
  embeddingsCreate: jest.fn(),
  chatCompletionsCreate: jest.fn()
}

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    embeddings: { create: (...args: unknown[]) => mocks.embeddingsCreate(...args) },
    chat: {
      completions: { create: (...args: unknown[]) => mocks.chatCompletionsCreate(...args) }
    }
  }))
})
jest.mock('../../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockEmbeddingsCreate = mocks.embeddingsCreate
const mockChatCompletionsCreate = mocks.chatCompletionsCreate

describe('OpenAIService.createEmbedding', () => {
  it('returns the embedding vector from the OpenAI response', async () => {
    mockEmbeddingsCreate.mockResolvedValue({ data: [{ embedding: [0.1, 0.2, 0.3] }] })

    const result = await OpenAIService.createEmbedding('hello world')

    expect(result).toEqual([0.1, 0.2, 0.3])
    expect(mockEmbeddingsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ input: 'hello world' })
    )
  })

  it('wraps a failure into a 500 AppError', async () => {
    mockEmbeddingsCreate.mockRejectedValue(new Error('openai down'))

    await expect(OpenAIService.createEmbedding('hello')).rejects.toMatchObject({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to create embedding'
    })
  })
})

describe('OpenAIService.createChatCompletion', () => {
  it('returns the first choice message', async () => {
    const message = { role: 'assistant', content: 'hi there' }
    mockChatCompletionsCreate.mockResolvedValue({ choices: [{ message }] })

    const result = await OpenAIService.createChatCompletion([
      { role: 'user', content: 'hi' }
    ])

    expect(result).toEqual(message)
  })

  it('forwards tools and tool_choice when provided', async () => {
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { role: 'assistant', content: 'ok' } }]
    })

    const tools = [{ type: 'function', function: { name: 'foo' } }] as any

    await OpenAIService.createChatCompletion([{ role: 'user', content: 'hi' }], {
      tools,
      toolChoice: 'auto'
    })

    expect(mockChatCompletionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ tools, tool_choice: 'auto' })
    )
  })

  it('wraps a failure into a 500 AppError', async () => {
    mockChatCompletionsCreate.mockRejectedValue(new Error('openai down'))

    await expect(
      OpenAIService.createChatCompletion([{ role: 'user', content: 'hi' }])
    ).rejects.toMatchObject({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to create chat completion'
    })
  })
})
