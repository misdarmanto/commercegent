import fs from 'fs'
import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { FileUploadModel } from '../models/FileUploadModel'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import { addProductFileToQueue } from '../queues/productFileQueue'
import type { IUploadHistories } from '../schemas/productSchema'

export class UploadProductService {
  static async recordExcelUpload(file: { path: string; originalname: string }) {
    try {
      const payload = {
        fileName: file.originalname,
        filePath: file.path,
        status: 'PENDING' as const,
        deleted: false
      }

      const fileRecord = await FileUploadModel.create(payload)
      await addProductFileToQueue(fileRecord.fileId, file.path)

      return {
        fileId: fileRecord.fileId,
        fileName: fileRecord.fileName,
        status: fileRecord.status
      }
    } catch (serviceError) {
      if (fs.existsSync(file.path)) {
        fs.unlink(file.path, () => {})
      }
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[UploadProductService] recordExcelUpload failed: ${String(serviceError)}`
      )
      throw new AppError(
        'Failed to process upload file',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async findUploadHistories(payload: IUploadHistories) {
    try {
      const page = new Pagination(payload.page, payload.size)

      const result = await FileUploadModel.findAndCountAll({
        where: {
          deleted: { [Op.eq]: false },
          ...(payload.status != null &&
            payload.status.length > 0 && {
              status: { [Op.eq]: payload.status }
            })
        },
        order: [['fileId', 'desc']],
        ...(payload.pagination === true && {
          limit: page.limit,
          offset: page.offset
        })
      })

      return page.formatData(result)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[UploadProductService] findUploadHistories failed: ${String(serviceError)}`
      )
      throw new AppError(
        'Failed to find upload histories',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
