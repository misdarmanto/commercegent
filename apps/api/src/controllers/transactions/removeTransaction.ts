import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { TransactionService } from '../../services/Transaction.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IRemoveTransaction } from '../../schemas/TransactionSchema'

export const removeTransaction = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IRemoveTransaction

    await TransactionService.removeTransaction(payload)
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Transaction removed successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
