import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { TransactionService } from '../../services/Transaction.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { AppError } from '../../utilities/appError'
import { type IFindAllTransaction } from '../../schemas/TransactionSchema'

export const findAllTransactions = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IFindAllTransaction
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    const result = await TransactionService.findAllTransactions(userId, payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
