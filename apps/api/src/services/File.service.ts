import fs from 'fs'
import path from 'path'
import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'
import { FileModel } from '../models/FileModel'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import { appConfigs } from '../configs/appConfig'
import logger from '../utilities/logger'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FileService {
  static async uploadFile (
    file: { filename: string, originalname: string, size: number, mimetype: string, path: string },
    uploadedBy?: string
  ): Promise<{ url: string, fileName: string, fileId: string }> {
    try {
      if (file == null) {
        throw new AppError('No file uploaded', StatusCodes.BAD_REQUEST)
      }

      const relativeFilePath = path.relative(process.cwd(), file.path)

      const fileRecord = await FileModel.create({
        fileName: file.originalname,
        filePath: relativeFilePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy
      })

      return {
        url: `${appConfigs.app.url}/api/v1/uploads/files/${fileRecord.fileId}`,
        fileName: fileRecord.fileName,
        fileId: fileRecord.fileId
      }
    } catch (serviceError) {
      if (file != null && fs.existsSync(file.path)) {
        fs.unlink(file.path, () => {})
      }
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[FileService] uploadFile failed: ${String(serviceError)}`)
      throw new AppError('Failed to upload file', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async getFiles (
    page: number = 1,
    size: number = 10
  ): Promise<{ items: Array<{ fileId: string, fileName: string, fileSize: number, mimeType: string, uploadedBy?: string, url: string, createdAt: Date }>, totalItems: number, totalPages: number, currentPage: number }> {
    try {
      const pagination = new Pagination(page, size)

      const result = await FileModel.findAndCountAll({
        where: { deleted: { [Op.eq]: false } },
        offset: pagination.offset,
        limit: pagination.limit,
        order: [['createdAt', 'DESC']]
      })

      const mappedRows = result.rows.map((file) => ({
        fileId: file.fileId,
        fileName: file.fileName,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        uploadedBy: file.uploadedBy,
        url: `${appConfigs.app.url}/api/v1/uploads/files/${file.fileId}`,
        createdAt: file.createdAt
      }))

      return pagination.formatData({
        count: result.count,
        rows: mappedRows
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[FileService] getFiles failed: ${String(serviceError)}`)
      throw new AppError('Failed to retrieve files', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async getFileById (fileId: string): Promise<{ fileId: string, fileName: string, fileSize: number, mimeType: string, filePath: string, uploadedBy?: string, createdAt: Date }> {
    try {
      const file = await FileModel.findByPk(fileId)

      if (file == null || (file.deleted ?? false)) {
        throw new AppError('File not found', StatusCodes.NOT_FOUND)
      }

      return {
        fileId: file.fileId,
        fileName: file.fileName,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        filePath: file.filePath,
        uploadedBy: file.uploadedBy ?? undefined,
        createdAt: file.createdAt ?? new Date()
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[FileService] getFileById failed: ${String(serviceError)}`)
      throw new AppError('Failed to retrieve file', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async deleteFile (fileId: string): Promise<{ message: string }> {
    try {
      const file = await FileModel.findByPk(fileId)

      if (file == null) {
        throw new AppError('File not found', StatusCodes.NOT_FOUND)
      }

      const filePath = path.join(process.cwd(), file.filePath)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }

      await file.destroy()

      return { message: 'File deleted successfully' }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[FileService] deleteFile failed: ${String(serviceError)}`)
      throw new AppError('Failed to delete file', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async serveFile (fileId: string): Promise<{ filePath: string, fileName: string, mimeType: string }> {
    try {
      const file = await FileModel.findByPk(fileId)

      if (file == null || (file.deleted ?? false)) {
        throw new AppError('File not found', StatusCodes.NOT_FOUND)
      }

      const filePath = path.join(process.cwd(), file.filePath)

      if (!fs.existsSync(filePath)) {
        throw new AppError('File not found on disk', StatusCodes.NOT_FOUND)
      }

      return {
        filePath,
        fileName: file.fileName,
        mimeType: file.mimeType
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[FileService] serveFile failed: ${String(serviceError)}`)
      throw new AppError('Failed to retrieve file', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
