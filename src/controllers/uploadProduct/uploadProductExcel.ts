import { type Request, type Response } from 'express'
import fs from 'fs'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { UploadProductService } from '../../services/UploadProduct.service'
import { AppError } from '../../utilities/appError'

export const uploadProductExcel = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const file = req.file
    if (file == null) {
      throw new AppError(
        'No file uploaded. Please upload an Excel file (.xls / .xlsx)',
        StatusCodes.BAD_REQUEST
      )
    }

    await UploadProductService.recordExcelUpload(file)

    return res.status(StatusCodes.ACCEPTED).json(
      ResponseData.success({
        message: 'File uploaded successfully, processing started in background'
      })
    )
  } catch (serverError) {
    if (req.file != null && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, () => {})
    }
    return handleError(res, serverError)
  }
}
