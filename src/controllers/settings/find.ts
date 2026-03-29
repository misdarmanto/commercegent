import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import { handleServerError } from '../../utilities/requestHandler'
import { SettingModel } from '../../models/settings'

export const findSetting = async (req: any, res: Response): Promise<any> => {
  try {
    const { settingType } = req.query ?? {}

    const whereCondition: any = {
      deleted: { [Op.eq]: 0 }
    }

    let attributes: string[] | undefined = undefined

    if (settingType) {
      whereCondition.settingType = { [Op.eq]: settingType }

      switch (settingType) {
        case 'bank':
          attributes = [
            'createdAt',
            'updatedAt',
            'deleted',
            'settingId',
            'settingType',
            'bankName',
            'bankNumber',
            'bankOwner'
          ]
          break

        case 'qris':
          attributes = [
            'createdAt',
            'updatedAt',
            'deleted',
            'settingId',
            'settingType',
            'qris'
          ]
          break

        case 'general':
          attributes = [
            'createdAt',
            'updatedAt',
            'deleted',
            'settingId',
            'settingType',
            'banner',
            'whatsappNumber'
          ]
          break

        case 'wa_blas':
          attributes = [
            'createdAt',
            'updatedAt',
            'deleted',
            'settingId',
            'settingType',
            'waBlasToken',
            'waBlasServer'
          ]
          break

        default:
          const message = 'invalid setting type!'
          const response = ResponseData.error(message)
          return res.status(StatusCodes.BAD_REQUEST).json(response)
      }
    }

    const results = await SettingModel.findAll({
      where: whereCondition,
      attributes,
      order: [['settingId', 'desc']]
    })

    const response = ResponseData.default
    response.data = results
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
