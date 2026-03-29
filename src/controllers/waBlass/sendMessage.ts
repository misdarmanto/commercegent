/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import {
  type WaBlasHistoryAttributes,
  WaBlasHistoryModel
} from '../../models/waBlasHistory'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import { requestChecker } from '../../utilities/requestCheker'
import { UserModel } from '../../models/user'
import logger from '../../logs'
import { handleServerError } from '../../utilities/requestHandler'
import { SettingModel } from '../../models/settings'

interface IRequestBodyType {
  waBlasTitle: string
  waBlasMessage: string
}

export const waBlasSendMessage = async (req: any, res: Response) => {
  const requestBody: IRequestBodyType = req.body

  const emptyField = requestChecker({
    requireList: ['waBlasTitle', 'waBlasMessage'],
    requestData: requestBody
  })

  if (emptyField.length > 0) {
    const message = `invalid request parameter! require (${emptyField})`
    const response = ResponseData.error(message)
    return res.status(StatusCodes.BAD_REQUEST).json(response)
  }

  try {
    const users = await UserModel.findAll({
      where: {
        deleted: { [Op.eq]: 0 },
        userRole: 'user'
      }
    })

    for (const user of users) {
      if (user.dataValues.userWhatsAppNumber !== null) {
        const payload: WaBlasHistoryAttributes | any = {
          waBlasHistoryId: uuidv4(),
          waBlasHistoryUserId: user.dataValues.userId,
          waBlasHistoryUserPhone: user.dataValues.userWhatsAppNumber,
          waBlasHistoryUserName: user.dataValues.userName,
          waBlasHistoryTitle: requestBody.waBlasTitle,
          waBlasHistoryMessage: requestBody.waBlasMessage
        }

        try {
          const waBlasSettings = await SettingModel.findOne({
            where: {
              deleted: { [Op.eq]: 0 },
              settingType: 'wa_blas'
            }
          })

          console.log(waBlasSettings)

          if (waBlasSettings === null) {
            const message =
              'periksa pengaturan terlebih dahulu, pastikan semua sudah benar!'
            logger.warn(message)
            const response = ResponseData.error(message)
            return res.status(StatusCodes.NOT_FOUND).json(response)
          }

          await axios.get(
            `${waBlasSettings.waBlasServer}/send-message?phone=${user.dataValues.userWhatsAppNumber}&message=${requestBody.waBlasMessage}&token=${waBlasSettings.waBlasToken}`
          )

          payload.waBlasStatus = 'success'
          await WaBlasHistoryModel.create(payload)
        } catch (sendError: any) {
          payload.waBlasStatus = 'fail'
          logger.error(sendError.sendError)
          await WaBlasHistoryModel.create(payload)
          logger.error(`Failed to send message to ${user.dataValues.userName}`, {
            error: sendError.message
          })
          continue
        }
      }
    }
    const response = ResponseData.default
    response.data = { message: 'succsess' }
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
