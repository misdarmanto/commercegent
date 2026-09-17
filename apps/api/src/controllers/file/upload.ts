import { type Request, type Response } from 'express'
import fs from 'fs'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { FileService } from '../../services/File.service'
import { AppError } from '../../utilities/appError'

export const uploadFile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const file = req.file

    if (file == null) {
      throw new AppError(
        'No file uploaded. Please upload an image file',
        StatusCodes.BAD_REQUEST
      )
    }

    const adminId = (req as unknown as { user?: { id: string } }).user?.id

    const result = await FileService.uploadFile(file, adminId)

    return res.status(StatusCodes.CREATED).json(
      ResponseData.success({
        message: 'File uploaded successfully',
        data: result
      })
    )
  } catch (serverError) {
    if (req.file != null && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, () => {})
    }
    return handleError(res, serverError)
  }
}
