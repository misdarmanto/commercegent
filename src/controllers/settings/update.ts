import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import { requestChecker } from '../../utilities/requestCheker'
import { handleServerError } from '../../utilities/requestHandler'
import { SettingAttributes, SettingModel } from '../../models/settings'

export const updateSetting = async (req: any, res: Response): Promise<any> => {
  const requestBody = req.body as SettingAttributes

  const emptyField = requestChecker({
    requireList: ['settingId'],
    requestData: requestBody
  })

  if (emptyField.length > 0) {
    const message = `invalid request parameter! require (${emptyField})`
    const response = ResponseData.error(message)
    return res.status(StatusCodes.BAD_REQUEST).json(response)
  }

  try {
    // const checkRole = await UserModel.findOne({
    //   where: {
    //     deleted: { [Op.eq]: 0 },
    //     userId: req.body?.user?.userId,
    //     userRole: { [Op.eq]: 'superAdmin' }
    //   }
    // })

    // if (checkRole == null) {
    //   const message = 'access denied!'
    //   const response = ResponseData.error(message)
    //   return res.status(StatusCodes.FORBIDDEN).json(response)
    // }

    const existingSetting = await SettingModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        settingId: { [Op.eq]: requestBody.settingId }
      }
    })

    if (existingSetting == null) {
      const message = 'setting not found!'
      const response = ResponseData.error(message)
      return res.status(StatusCodes.NOT_FOUND).json(response)
    }

    const updatableFields = [
      'bankName',
      'bankNumber',
      'bankOwner',
      'qris',
      'banner',
      'whatsappNumber',
      'waBlasToken',
      'waBlasServer'
    ]

    const newData: Partial<SettingAttributes> = {}

    for (const key of updatableFields) {
      const value = requestBody[key as keyof SettingAttributes]
      if (value !== undefined && value !== null && value !== '') {
        ;(newData as any)[key] = value
      }
    }

    await SettingModel.update(newData, {
      where: {
        deleted: { [Op.eq]: 0 },
        settingId: { [Op.eq]: requestBody.settingId }
      }
    })

    const response = ResponseData.default
    response.data = { message: 'success' }
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
