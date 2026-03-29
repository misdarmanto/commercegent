import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import { requestChecker } from '../../utilities/requestCheker'
import { UserModel } from '../../models/user'
import { handleServerError } from '../../utilities/requestHandler'
import { SettingAttributes, SettingModel } from '../../models/settings'
import { IAuthenticatedRequest } from '../../interfaces/shared'

export const createSetting = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<any> => {
  const requestBody = req.body as SettingAttributes

  const emptyField = requestChecker({
    requireList: ['settingType'],
    requestData: requestBody
  })

  if (emptyField.length > 0) {
    const message = `invalid request parameter! require (${emptyField})`
    return res.status(StatusCodes.BAD_REQUEST).json(ResponseData.error(message))
  }

  try {
    const checkRole = await UserModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        userId: req.jwtPayload?.userId,
        userRole: { [Op.eq]: 'superAdmin' }
      }
    })

    if (!checkRole) {
      return res.status(StatusCodes.FORBIDDEN).json(ResponseData.error('access denied!'))
    }

    const uniqueTypes = ['general', 'wa_blas']

    let existingSetting: any | null = null
    if (uniqueTypes.includes(requestBody.settingType)) {
      existingSetting = await SettingModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          settingType: { [Op.eq]: requestBody.settingType }
        }
      })
    }

    const newSettingData: Partial<SettingAttributes> = {
      settingType: requestBody.settingType
    }

    switch (requestBody.settingType) {
      case 'general':
        newSettingData.banner = requestBody.banner ?? null
        newSettingData.whatsappNumber = requestBody.whatsappNumber ?? null
        break

      case 'wa_blas':
        newSettingData.waBlasToken = requestBody.waBlasToken ?? null
        newSettingData.waBlasServer = requestBody.waBlasServer ?? null
        break

      default:
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(ResponseData.error('invalid setting type!'))
    }

    if (existingSetting) {
      await existingSetting.update(newSettingData)
      const response = ResponseData.default
      response.data = existingSetting
      return res.status(StatusCodes.OK).json(response)
    }

    const createdSetting = await SettingModel.create(newSettingData as SettingAttributes)
    const response = ResponseData.default
    response.data = createdSetting
    return res.status(StatusCodes.CREATED).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
