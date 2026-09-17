import type OpenAI from 'openai'
import { StatusCodes } from 'http-status-codes'
import { ChatSessionModel } from '../models/ChatSessionModel'
import { ChatMessageModel, type ChatMessageRole } from '../models/ChatMessageModel'
import { ProductEmbeddingService } from './ProductEmbedding.service'
import { OpenAIService } from './external/OpenAI.service'
import { chatTools, ChatToolsService } from './ChatTools.service'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import type { ISendChatMessage } from '../schemas/chatSchema'

const SYSTEM_PROMPT = `You are an AI customer service assistant for an online store.
Your job: help customers find & get recommendations for products, answer product questions, answer general store FAQs, and add products to the shopping cart when asked.
Always reply in Bahasa Indonesia, in a friendly, concise, and clear tone.
Use ONLY the product data given in the "PRODUCT CONTEXT" section below when mentioning product names, prices, or stock.
If no relevant product is found in the context, honestly say the product was not found and never make up product names or prices.
Use the add_to_cart tool when the customer clearly wants to buy/add a product to their cart. Use the view_cart tool when the customer asks about their cart contents.
Payment, address entry, and shipping method selection are handled by the customer themselves on the checkout page once products are in the cart.`

const HISTORY_LIMIT = 10
const MAX_TOOL_ITERATIONS = 3

export class ChatService {
  private static async resolveSession(userId: number, chatSessionId?: number) {
    if (chatSessionId != null) {
      const session = await ChatSessionModel.findOne({
        where: { chatSessionId, chatSessionUserId: userId, deleted: false }
      })

      if (session == null) {
        throw new AppError('Chat session not found', StatusCodes.NOT_FOUND)
      }

      return session
    }

    return ChatSessionModel.create({ chatSessionUserId: userId })
  }

  private static buildProductContext(
    matches: Awaited<ReturnType<typeof ProductEmbeddingService.searchProducts>>
  ): string {
    if (matches.length === 0) {
      return 'No relevant products found.'
    }

    return matches
      .map((match) => {
        const metadata = (match.metadata ?? {}) as Record<string, unknown>
        return [
          `- productId: ${String(metadata.productId)}`,
          `  nama: ${String(metadata.productName)}`,
          `  kategori: ${String(metadata.productCategoryName ?? '-')}`,
          `  harga: ${String(metadata.productPrice ?? 0)}`,
          `  stok: ${String(metadata.productStock ?? 0)}`
        ].join('\n')
      })
      .join('\n')
  }

  static async sendMessage(userId: number, payload: ISendChatMessage) {
    try {
      const session = await this.resolveSession(userId, payload.chatSessionId)

      await ChatMessageModel.create({
        chatMessageSessionId: session.chatSessionId,
        chatMessageRole: 'user',
        chatMessageContent: payload.message
      })

      const matches = await ProductEmbeddingService.searchProducts(payload.message, 5)
      const productContext = this.buildProductContext(matches)

      const history = await ChatMessageModel.findAll({
        where: { chatMessageSessionId: session.chatSessionId, deleted: false },
        order: [['chatMessageId', 'desc']],
        limit: HISTORY_LIMIT
      })

      const orderedHistory = history.reverse().map((item) => ({
        role: item.chatMessageRole as ChatMessageRole,
        content: item.chatMessageContent
      }))

      const conversation: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `${SYSTEM_PROMPT}\n\nPRODUCT CONTEXT:\n${productContext}`
        },
        ...orderedHistory
      ]

      const toolCallsExecuted: Array<{ name: string; result: string }> = []
      let finalMessage: OpenAI.Chat.Completions.ChatCompletionMessage | undefined

      for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
        const assistantMessage = await OpenAIService.createChatCompletion(conversation, {
          tools: chatTools
        })

        conversation.push(assistantMessage)

        if (assistantMessage.tool_calls == null || assistantMessage.tool_calls.length === 0) {
          finalMessage = assistantMessage
          break
        }

        for (const toolCall of assistantMessage.tool_calls) {
          const result = await ChatToolsService.execute(userId, toolCall)
          const toolName = toolCall.type === 'function' ? toolCall.function.name : toolCall.type
          toolCallsExecuted.push({ name: toolName, result })
          conversation.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: result
          })
        }
      }

      const replyContent = finalMessage?.content ?? 'Maaf, terjadi kesalahan.'

      await ChatMessageModel.create({
        chatMessageSessionId: session.chatSessionId,
        chatMessageRole: 'assistant',
        chatMessageContent: replyContent,
        chatMessageMeta: {
          matchedProductIds: matches.map((match) => match.metadata?.productId),
          toolCalls: toolCallsExecuted
        }
      })

      if (session.chatSessionTitle == null) {
        await session.update({
          chatSessionTitle: payload.message.slice(0, 80)
        })
      }

      return {
        chatSessionId: session.chatSessionId,
        reply: replyContent,
        products: matches.map((match) => match.metadata)
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[ChatService] sendMessage failed: ${String(serviceError)}`)
      throw new AppError('Failed to process chat message', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findSessionMessages(userId: number, chatSessionId: number) {
    try {
      const session = await ChatSessionModel.findOne({
        where: { chatSessionId, chatSessionUserId: userId, deleted: false }
      })

      if (session == null) {
        throw new AppError('Chat session not found', StatusCodes.NOT_FOUND)
      }

      const messages = await ChatMessageModel.findAll({
        where: { chatMessageSessionId: chatSessionId, deleted: false },
        order: [['chatMessageId', 'asc']]
      })

      return { session, messages }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[ChatService] findSessionMessages failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to find chat session messages',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async findAllSessions(userId: number) {
    try {
      return await ChatSessionModel.findAll({
        where: { chatSessionUserId: userId, deleted: false },
        order: [['chatSessionId', 'desc']]
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[ChatService] findAllSessions failed: ${String(serviceError)}`)
      throw new AppError('Failed to find chat sessions', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
