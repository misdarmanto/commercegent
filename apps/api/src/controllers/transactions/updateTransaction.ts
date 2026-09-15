import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { TransactionService } from '../../services/Transaction.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IUpdateTransaction } from '../../schemas/TransactionSchema'

export const updateTransaction = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as IUpdateTransaction

    await TransactionService.updateTransaction(payload)
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Transaction updated successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
