import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { ChatService } from '../../services/Chat.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IFindChatSessionParams } from '../../schemas/chatSchema'

export const findChatSessionMessages = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { chatSessionId } = req.params as unknown as IFindChatSessionParams
    const userId = req.jwtPayload!.userId

    const result = await ChatService.findSessionMessages(userId, chatSessionId)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
