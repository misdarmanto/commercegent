import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import { UserModel, type UserAttributes } from '../../models/user'
import { appConfigs } from '../../configs/appConfig'
import { handleServerError } from '../../utilities/requestHandler'

export const updateMyProfile = async (req: any, res: Response): Promise<any> => {
  const requestBody = req.body as UserAttributes

  try {
    if ('userPassword' in requestBody) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      requestBody.userPassword = require('crypto')
        .createHash('sha1')
        .update(requestBody.userPassword + appConfigs.secret.passwordEncryption)
        .digest('hex')
    }

    const newData: UserAttributes | any = {
      ...(requestBody.userName?.length > 0 && {
        userName: requestBody.userName
      }),
      ...(requestBody.userPassword?.length > 0 && {
        userPassword: requestBody.userPassword
      }),
      ...(requestBody.userRole?.length > 0 && {
        userRole: requestBody.userRole
      })
    }

    await UserModel.update(newData, {
      where: {
        deleted: { [Op.eq]: 0 },
        userId: { [Op.eq]: req.body?.user?.userId }
      }
    })

    const response = ResponseData.default
    response.data = { message: 'success' }
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
