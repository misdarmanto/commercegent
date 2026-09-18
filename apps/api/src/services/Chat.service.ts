import type OpenAI from 'openai'
import { StatusCodes } from 'http-status-codes'
import { ChatSessionModel } from '../models/ChatSessionModel'
import { ChatMessageModel, type ChatMessageRole } from '../models/ChatMessageModel'
import { ProductEmbeddingService } from './ProductEmbedding.service'
import { FaqEmbeddingService } from './FaqEmbedding.service'
import { ProductService } from './Product.service'
import { OpenAIService } from './external/OpenAI.service'
import { chatTools, ChatToolsService } from './ChatTools.service'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import type { IChatLanguage, ISendChatMessage } from '../schemas/chatSchema'

const REPLY_LANGUAGE_NAME: Record<IChatLanguage, string> = {
  en: 'English',
  id: 'Bahasa Indonesia'
}

const FALLBACK_REPLY: Record<IChatLanguage, string> = {
  en: 'Sorry, something went wrong.',
  id: 'Maaf, terjadi kesalahan.'
}

const buildSystemPrompt = (language: IChatLanguage): string => `You are an AI customer service assistant for an online store.
Your job: help customers find & get recommendations for products, answer product questions, answer general store FAQs, and add products to the shopping cart when asked.
Always reply in ${REPLY_LANGUAGE_NAME[language]}, in a friendly, concise, and clear tone, regardless of what language the product/FAQ context below is written in.
Use ONLY the product data given in the "PRODUCT CONTEXT" section below when mentioning product names, prices, or stock.
Use ONLY the entries given in the "FAQ CONTEXT" section below when answering general store questions (shipping, returns, payment methods, etc).
If no relevant product or FAQ entry is found in the context, honestly say so and never make up product names, prices, or store policies.
Use the add_to_cart tool when the customer clearly wants to buy/add a product to their cart. Use the view_cart tool when the customer asks about their cart contents.
Payment, address entry, and shipping method selection are handled by the customer themselves on the checkout page once products are in the cart.`

const HISTORY_LIMIT = 10
const MAX_TOOL_ITERATIONS = 3
const RECOMMENDATION_HISTORY_MESSAGE_LIMIT = 10
const RECOMMENDATION_LIMIT = 6

const INTEREST_EXTRACTION_PROMPT = `You analyze a customer's recent chat messages to an online store and extract their CURRENT product interests for a recommendation engine.

Respond with EXACTLY two lines, nothing else:
INTERESTED: <comma-separated list of products/categories they want, are curious about, or asked to buy — empty if none>
AVOID: <comma-separated list of products/categories they explicitly said they dislike, don't want, are allergic to, or asked to avoid — empty if none>

Rules:
- A product mentioned only in a negative context (e.g. "I don't like X", "I hate X", "no X please") belongs ONLY in AVOID, never in INTERESTED.
- Do not invent products that were never mentioned.
- Keep each list short (a few words per item, comma-separated), no explanations.`

interface IExtractedInterest {
  interested: string
  avoid: string[]
}

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

  private static buildFaqContext(
    matches: Awaited<ReturnType<typeof FaqEmbeddingService.searchFaqs>>
  ): string {
    if (matches.length === 0) {
      return 'No relevant FAQ entries found.'
    }

    return matches
      .map((match) => {
        const metadata = (match.metadata ?? {}) as Record<string, unknown>
        return [
          `- Q: ${String(metadata.faqQuestion)}`,
          `  A: ${String(metadata.faqAnswer)}`
        ].join('\n')
      })
      .join('\n')
  }

  /**
   * Uses the LLM to separate what the customer actually wants from what
   * they explicitly said they dislike, so recommendation search embeds
   * only positive intent — a plain embedding of the raw messages would
   * otherwise surface products the customer rejected, since "I don't like
   * mineral water" is semantically close to "mineral water".
   */
  private static async extractInterest(userMessages: string[]): Promise<IExtractedInterest> {
    const response = await OpenAIService.createChatCompletion([
      { role: 'system', content: INTEREST_EXTRACTION_PROMPT },
      { role: 'user', content: userMessages.join('\n') }
    ])

    const content = response.content ?? ''
    const interestedLine = /INTERESTED:[ \t]*(.*)/i.exec(content)?.[1] ?? ''
    const avoidLine = /AVOID:[ \t]*(.*)/i.exec(content)?.[1] ?? ''

    return {
      interested: interestedLine.trim(),
      avoid: avoidLine
        .split(',')
        .map((term) => term.trim().toLowerCase())
        .filter((term) => term.length > 0)
    }
  }

  /** Strips a trailing "s" so simple plural/singular variants ("oranges" vs "orange") still match. */
  private static singularize(word: string): string {
    return word.length > 3 && word.endsWith('s') ? word.slice(0, -1) : word
  }

  /**
   * True when the product's name shares a significant word with any avoid
   * term (e.g. avoid "mineral water" matches product "Mineral Water";
   * avoid "oranges" matches product "Sunkist Orange"). Word-level
   * comparison avoids both false negatives from singular/plural mismatches
   * and false positives from unrelated substrings.
   */
  private static isProductAvoided(productName: unknown, avoid: string[]): boolean {
    if (typeof productName !== 'string' || avoid.length === 0) return false

    const productWords = new Set(
      productName
        .toLowerCase()
        .split(/\s+/)
        .map((word) => this.singularize(word))
    )

    return avoid.some((term) =>
      term
        .split(/\s+/)
        .map((word) => this.singularize(word))
        .some((word) => word.length > 2 && productWords.has(word))
    )
  }

  static async sendMessage(userId: number, payload: ISendChatMessage) {
    try {
      const language: IChatLanguage = payload.language ?? 'id'
      const session = await this.resolveSession(userId, payload.chatSessionId)

      await ChatMessageModel.create({
        chatMessageSessionId: session.chatSessionId,
        chatMessageRole: 'user',
        chatMessageContent: payload.message
      })

      const [matches, faqMatches] = await Promise.all([
        ProductEmbeddingService.searchProducts(payload.message, 5),
        FaqEmbeddingService.searchFaqs(payload.message, 3)
      ])
      const productContext = this.buildProductContext(matches)
      const faqContext = this.buildFaqContext(faqMatches)

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
          content: `${buildSystemPrompt(language)}\n\nPRODUCT CONTEXT:\n${productContext}\n\nFAQ CONTEXT:\n${faqContext}`
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

      const replyContent = finalMessage?.content ?? FALLBACK_REPLY[language]

      await ChatMessageModel.create({
        chatMessageSessionId: session.chatSessionId,
        chatMessageRole: 'assistant',
        chatMessageContent: replyContent,
        chatMessageMeta: {
          matchedProductIds: matches.map((match) => match.metadata?.productId),
          matchedFaqIds: faqMatches.map((match) => match.metadata?.faqId),
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
        products: matches.map((match) => match.metadata),
        faqs: faqMatches.map((match) => match.metadata)
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

  /**
   * Product recommendations derived from the user's most recent chat
   * session: the last few things they typed are embedded and searched
   * fresh against Pinecone (rather than replaying old matchedProductIds),
   * so results stay current with stock/visibility and are re-ranked with
   * live product data.
   */
  static async getRecommendations(userId: number) {
    try {
      const session = await ChatSessionModel.findOne({
        where: { chatSessionUserId: userId, deleted: false },
        order: [['chatSessionId', 'desc']]
      })

      if (session == null) return { products: [] }

      const recentUserMessages = await ChatMessageModel.findAll({
        where: {
          chatMessageSessionId: session.chatSessionId,
          chatMessageRole: 'user',
          deleted: false
        },
        order: [['chatMessageId', 'desc']],
        limit: RECOMMENDATION_HISTORY_MESSAGE_LIMIT
      })

      if (recentUserMessages.length === 0) return { products: [] }

      const { interested, avoid } = await this.extractInterest(
        recentUserMessages.reverse().map((message) => message.chatMessageContent)
      )

      if (interested.length === 0) return { products: [] }

      const matches = await ProductEmbeddingService.searchProducts(
        interested,
        RECOMMENDATION_LIMIT
      )

      const productIds = matches
        .filter((match) => !this.isProductAvoided(match.metadata?.productName, avoid))
        .map((match) => Number(match.metadata?.productId))
        .filter((productId) => Number.isFinite(productId))

      const products = await ProductService.findByIds(productIds)

      return { products }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[ChatService] getRecommendations failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to get chat recommendations',
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
