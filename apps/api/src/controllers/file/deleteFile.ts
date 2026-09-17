import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { FileService } from '../../services/File.service'

export const deleteFile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { fileId } = req.params

    await FileService.deleteFile(fileId)

    return res.status(StatusCodes.OK).json(
      ResponseData.success({
        message: 'File deleted successfully'
      })
    )
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
