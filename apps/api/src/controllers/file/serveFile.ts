import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { handleError } from '../../utilities/requestHandler'
import { FileService } from '../../services/File.service'

export const serveFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params

    const file = await FileService.serveFile(fileId)

    res.setHeader('Content-Type', file.mimeType)
    res.setHeader('Content-Disposition', `inline; filename="${file.fileName}"`)

    res.status(StatusCodes.OK).sendFile(file.filePath)
  } catch (serverError) {
    handleError(res, serverError)
  }
}
