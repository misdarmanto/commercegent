import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { TransactionService } from '../../services/Transaction.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type ICreateTransactionBody } from '../../schemas/TransactionSchema'
import { AppError } from '../../utilities/appError'

export const createTransaction = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as ICreateTransactionBody

    const userId = req.jwtPayload?.userId
    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    await TransactionService.createTransaction(userId, payload)
    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'Transaction created successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
