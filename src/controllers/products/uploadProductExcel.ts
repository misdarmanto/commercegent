import { type Request, type Response } from 'express'
import fs from 'fs'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { ProductService } from '../../services/Product.service'

export const uploadProductExcel = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const file = req.file
    if (file == null) {
      return res.status(StatusCodes.BAD_REQUEST).json(
        ResponseData.error({
          message: 'No file uploaded. Please upload an Excel file (.xls / .xlsx)'
        })
      )
    }

    const data = await ProductService.recordExcelUpload(file)
    return res.status(StatusCodes.ACCEPTED).json(
      ResponseData.success({
        message: 'File uploaded successfully, processing started in background',
        data
      })
    )
  } catch (error) {
    if (req.file != null && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, () => {})
    }
    return handleError(res, error)
  }
}
