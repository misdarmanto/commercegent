import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { requestChecker } from '../../utilities/requestCheker'
import { TransactionsModel, type TransactionsAttributes } from '../../models/transactions'
import { handleServerError } from '../../utilities/requestHandler'

export const createTransaction = async (req: any, res: Response): Promise<any> => {
  const requestBody = req.body as TransactionsAttributes

  const emptyField = requestChecker({
    requireList: [
      'transactionPrice',
      'transactionOrderId',
      'transactionUserId',
      'transactionOngkirPrice'
    ],
    requestData: requestBody
  })

  if (emptyField.length > 0) {
    const message = `invalid request parameter! require (${emptyField})`
    const response = ResponseData.error(message)
    return res.status(StatusCodes.BAD_REQUEST).json(response)
  }

  try {
    await TransactionsModel.create(requestBody)

    const response = ResponseData.default
    const result = { message: 'success' }
    response.data = result
    return res.status(StatusCodes.CREATED).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
