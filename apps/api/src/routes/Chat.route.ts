import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { ChatController } from '../controllers/chat'
import { findChatSessionParamsSchema, sendChatMessageSchema } from '../schemas/chatSchema'

const ChatRoute = Router()

ChatRoute.use(MiddleWares.authorization)

ChatRoute.get('/sessions', ChatController.findAllChatSessions)

ChatRoute.get(
  '/sessions/:chatSessionId',
  MiddleWares.validate({ params: findChatSessionParamsSchema }),
  ChatController.findChatSessionMessages
)

ChatRoute.post(
  '/',
  MiddleWares.validate({ body: sendChatMessageSchema }),
  ChatController.sendChatMessage
)

export default ChatRoute
