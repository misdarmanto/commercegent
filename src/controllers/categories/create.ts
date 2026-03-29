import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { requestChecker } from '../../utilities/requestCheker'
import { CategoryAttributes, CategoryModel } from '../../models/categories'
import { handleServerError } from '../../utilities/requestHandler'

export const createCategory = async (req: any, res: Response): Promise<any> => {
  const requestBody = req.body as CategoryAttributes

  const emptyField = requestChecker({
    requireList: ['categoryName'],
    requestData: requestBody
  })

  if (emptyField.length > 0) {
    const message = `invalid request parameter! require (${emptyField})`
    const response = ResponseData.error(message)
    return res.status(StatusCodes.BAD_REQUEST).json(response)
  }

  try {
    await CategoryModel.create(requestBody)

    const response = ResponseData.default

    response.data = {
      message: 'success'
    }

    return res.status(StatusCodes.CREATED).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
