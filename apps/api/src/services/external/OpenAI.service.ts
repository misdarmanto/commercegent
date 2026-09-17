import OpenAI from 'openai'
import { StatusCodes } from 'http-status-codes'
import { appConfigs } from '../../configs/appConfig'
import { AppError } from '../../utilities/appError'
import logger from '../../utilities/logger'

const client = new OpenAI({ apiKey: appConfigs.openAi.apiKey ?? '' })

export class OpenAIService {
  static async createEmbedding(input: string): Promise<number[]> {
    try {
      const response = await client.embeddings.create({
        model: appConfigs.openAi.embeddingModel,
        dimensions: appConfigs.openAi.embeddingDimensions,
        input
      })

      return response.data[0].embedding
    } catch (error) {
      logger.error(`[OpenAIService] createEmbedding failed: ${String(error)}`)
      throw new AppError('Failed to create embedding', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async createChatCompletion(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    options?: {
      tools?: OpenAI.Chat.Completions.ChatCompletionTool[]
      toolChoice?: OpenAI.Chat.Completions.ChatCompletionCreateParams['tool_choice']
    }
  ) {
    try {
      const response = await client.chat.completions.create({
        model: appConfigs.openAi.chatModel,
        messages,
        temperature: 0.4,
        ...(options?.tools != null && { tools: options.tools }),
        ...(options?.toolChoice != null && { tool_choice: options.toolChoice })
      })

      return response.choices[0].message
    } catch (error) {
      logger.error(`[OpenAIService] createChatCompletion failed: ${String(error)}`)
      throw new AppError(
        'Failed to create chat completion',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
