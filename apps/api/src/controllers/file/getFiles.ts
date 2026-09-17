import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { FileService } from '../../services/File.service'

export const getFiles = async (req: Request, res: Response): Promise<Response> => {
  try {
    const page = parseInt(req.query.page as string, 10)
    const size = parseInt(req.query.size as string, 10)

    const result = await FileService.getFiles(
      Number.isNaN(page) ? 1 : page,
      Number.isNaN(size) ? 10 : size
    )

    return res.status(StatusCodes.OK).json(
      ResponseData.success({
        message: 'Files retrieved successfully',
        data: result
      })
    )
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
