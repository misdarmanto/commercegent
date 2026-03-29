import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import { handleServerError } from '../../utilities/requestHandler'
import { SettingModel } from '../../models/settings'
import { UserModel } from '../../models/user'

export const removeSetting = async (req: any, res: Response): Promise<any> => {
  try {
    const { settingId } = req.params

    if (!settingId) {
      const message = 'invalid request parameter! require (settingId)'
      const response = ResponseData.error(message)
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    const checkRole = await UserModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        userId: req.body?.user?.userId,
        userRole: { [Op.eq]: 'superAdmin' }
      }
    })

    if (checkRole == null) {
      const message = 'access denied!'
      const response = ResponseData.error(message)
      return res.status(StatusCodes.FORBIDDEN).json(response)
    }

    const findSetting = await SettingModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        settingId: { [Op.eq]: settingId }
      }
    })

    if (!findSetting) {
      const message = 'setting not found!'
      const response = ResponseData.error(message)
      return res.status(StatusCodes.NOT_FOUND).json(response)
    }

    await SettingModel.update(
      { deleted: 1 },
      {
        where: {
          settingId: { [Op.eq]: settingId }
        }
      }
    )

    const response = ResponseData.default
    response.data = { message: 'setting deleted successfully!' }
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
