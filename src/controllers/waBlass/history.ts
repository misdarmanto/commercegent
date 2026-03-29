/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import { Pagination } from '../../utilities/pagination'
import { WaBlasHistoryModel } from '../../models/waBlasHistory'
import { requestChecker } from '../../utilities/requestCheker'
import { handleServerError } from '../../utilities/requestHandler'

export const waBlasHistoryFindAll = async (req: any, res: Response) => {
  try {
    const page = new Pagination(
      parseInt(req.query.page) ?? 0,
      parseInt(req.query.size) ?? 10
    )
    const result = await WaBlasHistoryModel.findAndCountAll({
      where: {
        deleted: { [Op.eq]: 0 },
        ...(Boolean(req.query.search) && {
          [Op.or]: [
            { userName: { [Op.like]: `%${req.query.search}%` } },
            { userEmail: { [Op.like]: `%${req.query.search}%` } }
          ]
        })
      },
      order: [['waBlasHistoryId', 'desc']],
      ...(req.query.pagination === 'true' && {
        limit: page.limit,
        offset: page.offset
      })
    })

    const response = ResponseData.default
    response.data = page.data(result)
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}

export const waBlasHistoryFindOne = async (req: any, res: Response) => {
  const emptyField = requestChecker({
    requireList: ['waBlasHistoryId'],
    requestData: req.params
  })

  if (emptyField.length > 0) {
    const message = `invalid request parameter! require (${emptyField})`
    const response = ResponseData.error(message)
    return res.status(StatusCodes.BAD_REQUEST).json(response)
  }

  try {
    const waBlasHistory = await WaBlasHistoryModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        waBlasHistoryId: { [Op.eq]: req.params.waBlasHistoryId }
      }
    })

    if (waBlasHistory === null) {
      const message = 'not found!'
      const response = ResponseData.error(message)
      return res.status(StatusCodes.NOT_FOUND).json(response)
    }

    const response = ResponseData.default
    response.data = waBlasHistory
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
