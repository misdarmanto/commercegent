import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { ChatService } from '../../services/Chat.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type ISendChatMessage } from '../../schemas/chatSchema'

export const sendChatMessage = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as ISendChatMessage
    const userId = req.jwtPayload!.userId

    const result = await ChatService.sendMessage(userId, payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
