import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import { requestChecker } from '../../utilities/requestCheker'
import { CategoryAttributes, CategoryModel } from '../../models/categories'
import { handleServerError } from '../../utilities/requestHandler'

export const updateCategory = async (req: any, res: Response): Promise<any> => {
  const requestBody = req.body as CategoryAttributes

  const emptyField = requestChecker({
    requireList: ['categoryId'],
    requestData: requestBody
  })

  if (emptyField.length > 0) {
    const message = `invalid request parameter! require (${emptyField})`
    const response = ResponseData.error(message)
    return res.status(StatusCodes.BAD_REQUEST).json(response)
  }

  try {
    const result = await CategoryModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        categoryId: { [Op.eq]: requestBody.categoryId }
      }
    })

    if (result == null) {
      const message = 'not found!'
      const response = ResponseData.error(message)
      return res.status(StatusCodes.NOT_FOUND).json(response)
    }

    const newData: CategoryAttributes | any = {
      ...(requestBody?.categoryIcon &&
        requestBody.categoryIcon.toString().length > 0 && {
          categoryIcon: requestBody.categoryIcon
        }),
      ...(requestBody.categoryName.length > 0 && {
        categoryName: requestBody.categoryName
      })
    }

    await CategoryModel.update(newData, {
      where: {
        deleted: { [Op.eq]: 0 },
        categoryId: { [Op.eq]: requestBody.categoryId }
      }
    })

    const response = ResponseData.default
    response.data = { message: 'success' }
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
